import type {
  SimulationInput,
  BatteryConfig,
  FinancialConfig,
  ComparisonResult,
  YearResult,
} from "./types";
import { createDefaultBatteryConfig } from "./constants";
import { simulateMultiYear } from "./engine";
import { createDegradationFn } from "./degradation";
import { calculateFinancials } from "./financial";

function simulateBaseline(
  input: SimulationInput,
  years: number,
): YearResult[] {
  const zeroBattery: BatteryConfig = {
    sizeKwh: 0,
    maxChargeRateKw: 0,
    maxDischargeRateKw: 0,
    roundTripEfficiency: 1,
    ratedCycles: 1,
    endOfLifeDegradation: 1,
  };

  return simulateMultiYear(input, zeroBattery, years, () => 0);
}

export function compareScenarios(
  input: SimulationInput,
  batterySizes: number[],
  financialConfig: FinancialConfig,
): ComparisonResult[] {
  const years = financialConfig.timeframeYears;
  const baselineYears = simulateBaseline(input, years);

  const results: ComparisonResult[] = batterySizes.map((size) => {
    const batteryConfig = createDefaultBatteryConfig(size);
    const degradationFn = createDegradationFn(batteryConfig);
    const yearResults = simulateMultiYear(
      input,
      batteryConfig,
      years,
      degradationFn,
    );

    const financial = calculateFinancials(
      yearResults,
      baselineYears,
      financialConfig,
      batteryConfig,
    );

    const totalCycles = yearResults.reduce((s, y) => s + y.totalCycles, 0);
    const averageCyclesPerYear = totalCycles / years;
    const lastYear = yearResults[years - 1];
    const finalBatteryHealth = lastYear
      ? lastYear.effectiveCapacityKwh / batteryConfig.sizeKwh
      : 1;

    const firstYear = yearResults[0];

    return {
      batteryConfig,
      yearResults,
      financialResults: financial.yearResults,
      totalSavings: financial.totalSavings,
      annualSavingsFirstYear: financial.annualSavingsFirstYear,
      paybackYears: financial.paybackYears,
      roi: financial.roi,
      averageCyclesPerYear,
      finalBatteryHealth,
      selfConsumptionRatio: firstYear?.selfConsumptionRatio ?? 0,
      isRecommended: false,
      totalInvestment: financial.totalInvestment,
    };
  });

  // Sweet spot: best payback-to-investment ratio
  // Among those that pay back, pick shortest payback. If tie, prefer smaller.
  const withPayback = results.filter((r) => r.paybackYears !== null);

  if (withPayback.length > 0) {
    withPayback.sort((a, b) => {
      const diff = (a.paybackYears ?? Infinity) - (b.paybackYears ?? Infinity);
      if (Math.abs(diff) < 0.5) {
        return a.batteryConfig.sizeKwh - b.batteryConfig.sizeKwh;
      }
      return diff;
    });
    const best = withPayback[0];
    const match = results.find(
      (r) => r.batteryConfig.sizeKwh === best.batteryConfig.sizeKwh,
    );
    if (match) match.isRecommended = true;
  }

  return results;
}
