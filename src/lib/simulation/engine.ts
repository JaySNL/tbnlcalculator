import type {
  SimulationInput,
  BatteryConfig,
  YearResult,
  MonthlyBreakdown,
  HourlyDataPoint,
} from "./types";
import {
  ANNUAL_YIELD_KWH_PER_KWP,
  MONTHLY_SOLAR_WEIGHTS,
  MONTHLY_DEMAND_WEIGHTS,
  DAYS_PER_MONTH,
  ORIENTATION_FACTORS,
  getSolarHourlyFraction,
  getDemandHourlyFraction,
} from "./constants";

/**
 * Pre-compute the normalized hourly fractions so that they sum to 1.0 over 24 hours.
 * This ensures hourly values scale correctly to daily totals.
 */
function getNormalizedSolarHourlyFractions(): number[] {
  const raw: number[] = [];
  let sum = 0;
  for (let h = 0; h < 24; h++) {
    const v = getSolarHourlyFraction(h);
    raw.push(v);
    sum += v;
  }
  if (sum === 0) return raw;
  return raw.map((v) => v / sum);
}

function getNormalizedDemandHourlyFractions(): number[] {
  const raw: number[] = [];
  let sum = 0;
  for (let h = 0; h < 24; h++) {
    const v = getDemandHourlyFraction(h);
    raw.push(v);
    sum += v;
  }
  if (sum === 0) return raw;
  return raw.map((v) => v / sum);
}

// Pre-compute once at module level
const SOLAR_HOURLY_FRACTIONS = getNormalizedSolarHourlyFractions();
const DEMAND_HOURLY_FRACTIONS = getNormalizedDemandHourlyFractions();

/**
 * Compute the total kWp of the solar installation.
 */
function getTotalKwp(input: SimulationInput): number {
  return (input.solar.panelCount * input.solar.panelWattage) / 1000;
}

/**
 * Compute the annual solar yield in kWh, accounting for orientation and shading.
 */
function getAnnualSolarYield(input: SimulationInput): number {
  const kwp = getTotalKwp(input);
  const orientationFactor = ORIENTATION_FACTORS[input.solar.orientation];
  const shadingMultiplier = 1 - input.solar.shadingFactor;
  return kwp * ANNUAL_YIELD_KWH_PER_KWP * orientationFactor * shadingMultiplier;
}

/**
 * Normalize monthly demand weights so the weighted daily consumptions
 * sum to the correct annual total.
 *
 * annualConsumption = sum over months of (dailyConsumption_m * daysInMonth_m)
 * dailyConsumption_m = (annualConsumption / 365) * adjustedWeight_m
 *
 * We need adjusted weights such that:
 *   sum_m(adjustedWeight_m * daysInMonth_m) = 365
 *
 * So adjustedWeight_m = rawWeight_m * 365 / sum_m(rawWeight_m * daysInMonth_m)
 */
function getNormalizedDemandWeights(): number[] {
  let weightedDays = 0;
  for (let m = 0; m < 12; m++) {
    weightedDays += MONTHLY_DEMAND_WEIGHTS[m] * DAYS_PER_MONTH[m];
  }
  const scale = 365 / weightedDays;
  return MONTHLY_DEMAND_WEIGHTS.map((w) => w * scale);
}

const NORMALIZED_DEMAND_WEIGHTS = getNormalizedDemandWeights();

/**
 * Simulate one full year of energy flows for a given battery configuration.
 *
 * @param input - Solar and consumption parameters
 * @param batteryConfig - Battery specs (size, rates, efficiency)
 * @param effectiveCapacity - Actual usable capacity in kWh (after degradation)
 * @returns YearResult with monthly and hourly breakdowns
 */
export function simulateYear(
  input: SimulationInput,
  batteryConfig: BatteryConfig,
  effectiveCapacity: number,
): YearResult {
  const annualSolarYield = getAnnualSolarYield(input);
  const dailyAvgConsumption = input.annualConsumptionKwh / 365;
  const oneWayEfficiency = Math.sqrt(batteryConfig.roundTripEfficiency);

  let batterySoc = 0; // Start of year at 0 kWh
  let totalSolarProduction = 0;
  let totalConsumption = 0;
  let totalSelfConsumed = 0;
  let totalGridImport = 0;
  let totalGridExport = 0;
  let totalCycles = 0;

  const monthlyBreakdown: MonthlyBreakdown[] = [];

  for (let month = 0; month < 12; month++) {
    const days = DAYS_PER_MONTH[month];
    const monthlySolarWeight = MONTHLY_SOLAR_WEIGHTS[month];

    // Daily solar production for this month:
    // annualSolarYield * monthWeight / daysInMonth
    const dailySolar = (annualSolarYield * monthlySolarWeight) / days;

    // Daily consumption for this month:
    const dailyConsumption = dailyAvgConsumption * NORMALIZED_DEMAND_WEIGHTS[month];

    let monthSolar = 0;
    let monthConsumption = 0;
    let monthSelfConsumedDirect = 0;
    let monthBatteryCharged = 0;
    let monthBatteryDischarged = 0;
    let monthGridImport = 0;
    let monthGridExport = 0;
    let monthEnergyThroughput = 0;

    const hourlyData: HourlyDataPoint[] = [];

    for (let day = 0; day < days; day++) {
      for (let hour = 0; hour < 24; hour++) {
        // Hourly production and consumption
        const solarProduction = dailySolar * SOLAR_HOURLY_FRACTIONS[hour];
        const consumption = dailyConsumption * DEMAND_HOURLY_FRACTIONS[hour];

        const netEnergy = solarProduction - consumption; // positive = surplus, negative = deficit

        let batteryCharge = 0;
        let batteryDischarge = 0;
        let gridImport = 0;
        let gridExport = 0;
        let selfConsumedDirect = 0;

        if (netEnergy >= 0) {
          // Surplus: solar covers all consumption, rest goes to battery/grid
          selfConsumedDirect = consumption;
          let surplus = netEnergy;

          // Try to charge battery with surplus
          const spaceAvailable = effectiveCapacity - batterySoc;
          // Maximum we can push into battery this hour (accounting for charge rate and efficiency)
          const maxChargeInput = Math.min(
            surplus,
            batteryConfig.maxChargeRateKw, // rate limit (kW = kWh per hour)
            spaceAvailable / oneWayEfficiency, // energy needed at input to fill remaining space
          );

          if (maxChargeInput > 0) {
            batteryCharge = maxChargeInput;
            const energyStored = maxChargeInput * oneWayEfficiency;
            batterySoc += energyStored;
            surplus -= maxChargeInput;
          }

          // Remaining surplus goes to grid
          gridExport = surplus;
        } else {
          // Deficit: solar does not cover consumption
          selfConsumedDirect = solarProduction;
          let deficit = -netEnergy;

          // Try to discharge battery to cover deficit
          const maxDischargeOutput = Math.min(
            deficit,
            batteryConfig.maxDischargeRateKw, // rate limit
            batterySoc * oneWayEfficiency, // max energy we can extract (accounting for efficiency)
          );

          if (maxDischargeOutput > 0) {
            batteryDischarge = maxDischargeOutput;
            const energyFromBattery = maxDischargeOutput / oneWayEfficiency;
            batterySoc -= energyFromBattery;
            deficit -= maxDischargeOutput;
          }

          // Remaining deficit from grid
          gridImport = deficit;
        }

        // Clamp SOC to valid range (floating-point safety)
        batterySoc = Math.max(0, Math.min(effectiveCapacity, batterySoc));

        // Accumulate monthly totals
        monthSolar += solarProduction;
        monthConsumption += consumption;
        monthSelfConsumedDirect += selfConsumedDirect;
        monthBatteryCharged += batteryCharge;
        monthBatteryDischarged += batteryDischarge;
        monthGridImport += gridImport;
        monthGridExport += gridExport;
        monthEnergyThroughput += batteryCharge; // track input-side throughput

        // Only store one representative day's hourly data per month (first day)
        if (day === 0) {
          hourlyData.push({
            hour,
            solarProduction,
            consumption,
            batteryCharge,
            batteryDischarge,
            batterySoc,
            gridImport,
            gridExport,
          });
        }
      }
    }

    // Cycles this month = energy throughput / (2 * capacity)
    // One full cycle = one full charge + one full discharge
    // Using input-side throughput (batteryCharge) as a proxy for one direction,
    // so cycles = throughput / capacity (charge side only counts once)
    const monthCycles =
      effectiveCapacity > 0 ? monthEnergyThroughput / effectiveCapacity : 0;

    monthlyBreakdown.push({
      month,
      solarProduction: monthSolar,
      consumption: monthConsumption,
      selfConsumedDirect: monthSelfConsumedDirect,
      batteryCharged: monthBatteryCharged,
      batteryDischarged: monthBatteryDischarged,
      gridImport: monthGridImport,
      gridExport: monthGridExport,
      cycles: monthCycles,
      hourlyData,
    });

    totalSolarProduction += monthSolar;
    totalConsumption += monthConsumption;
    totalSelfConsumed += monthSelfConsumedDirect + monthBatteryDischarged;
    totalGridImport += monthGridImport;
    totalGridExport += monthGridExport;
    totalCycles += monthCycles;
  }

  const selfConsumptionRatio =
    totalSolarProduction > 0 ? totalSelfConsumed / totalSolarProduction : 0;

  return {
    year: 0, // Will be set by simulateMultiYear
    effectiveCapacityKwh: effectiveCapacity,
    monthlyBreakdown,
    totalSolarProduction,
    totalConsumption,
    totalSelfConsumed,
    totalGridImport,
    totalGridExport,
    totalCycles,
    selfConsumptionRatio,
  };
}

/**
 * Degradation callback signature:
 * Given cumulative cycles so far and the year number (0-indexed),
 * returns the effective capacity in kWh.
 */
export type DegradationFn = (
  cumulativeCycles: number,
  year: number,
) => number;

/**
 * Run a multi-year simulation, applying degradation each year.
 *
 * @param input - Solar and consumption parameters
 * @param batteryConfig - Battery specs
 * @param years - Number of years to simulate
 * @param degradationFn - Callback that returns effective capacity given cumulative cycles and year
 * @returns Array of YearResult, one per year
 */
export function simulateMultiYear(
  input: SimulationInput,
  batteryConfig: BatteryConfig,
  years: number,
  degradationFn: DegradationFn,
): YearResult[] {
  const results: YearResult[] = [];
  let cumulativeCycles = 0;

  for (let year = 0; year < years; year++) {
    const effectiveCapacity = degradationFn(cumulativeCycles, year);
    const yearResult = simulateYear(input, batteryConfig, effectiveCapacity);
    yearResult.year = year;

    cumulativeCycles += yearResult.totalCycles;
    results.push(yearResult);
  }

  return results;
}
