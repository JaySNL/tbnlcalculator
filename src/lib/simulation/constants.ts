import type {
  BatteryConfig,
  FinancialConfig,
  ElectricityPriceBreakdown,
  HouseholdProfileKey,
  Orientation,
} from "./types";

export const ANNUAL_YIELD_KWH_PER_KWP = 948;

export const MONTHLY_SOLAR_WEIGHTS = [
  0.026, 0.042, 0.084, 0.116, 0.137, 0.142,
  0.137, 0.121, 0.090, 0.053, 0.030, 0.021,
] as const;

export const MONTHLY_DEMAND_WEIGHTS = [
  1.15, 1.1, 1.05, 0.95, 0.9, 0.85,
  0.85, 0.9, 0.95, 1.0, 1.1, 1.15,
] as const;

export const DAYS_PER_MONTH = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
] as const;

export const ORIENTATION_FACTORS: Record<Orientation, number> = {
  south: 1.0,
  southEastWest: 0.95,
  eastWest: 0.85,
  north: 0.55,
};

export function getSolarHourlyFraction(hour: number): number {
  if (hour < 5 || hour > 21) return 0;
  return Math.sin(((hour - 5) / 16) * Math.PI);
}

export function getDemandHourlyFraction(hour: number): number {
  const baseLoad = 0.025;
  const morningPeak = hour >= 7 && hour <= 9 ? 0.04 : 0;
  const eveningPeak =
    hour >= 17 && hour <= 21
      ? 0.06 * Math.sin(((hour - 17) / 4) * Math.PI)
      : 0;
  const daytime = hour >= 8 && hour <= 22 ? 0.015 : 0;
  return baseLoad + morningPeak + eveningPeak + daytime;
}

export const HOUSEHOLD_PROFILES: Record<HouseholdProfileKey, number> = {
  working: 3250,
  home: 4250,
  family: 5000,
  custom: 3500,
};

export const BATTERY_SIZE_OPTIONS = [5, 7, 10, 13.5, 15, 20] as const;

// Battery cost per kWh scales with size — larger = cheaper per kWh
// Source: jeroen.nl stroomanalyse, thuisbatterijnederland.nl 2026 pricing
export function getBatteryCostPerKwh(sizeKwh: number): number {
  if (sizeKwh <= 5) return 550;
  if (sizeKwh <= 7) return 520;
  if (sizeKwh <= 10) return 500;
  if (sizeKwh <= 15) return 460;
  if (sizeKwh <= 20) return 430;
  return 395;
}

export function createDefaultBatteryConfig(sizeKwh: number): BatteryConfig {
  return {
    sizeKwh,
    depthOfDischarge: 0.9, // 90% usable (industry standard)
    maxChargeRateKw: Math.min(sizeKwh * 0.5, 5),
    maxDischargeRateKw: Math.min(sizeKwh * 0.5, 5),
    roundTripEfficiency: 0.85, // 85% real-world (jeroen.nl uses 75%, manufacturers claim 90%+)
    ratedCycles: 6000,
    endOfLifeDegradation: 0.8,
  };
}

// NL electricity price breakdown (all incl 21% BTW)
// Source: jeroen.nl/stroomanalyse, CBS energieprijzen 2025-2026
export const DEFAULT_IMPORT_PRICE: ElectricityPriceBreakdown = {
  energyPriceEur: 0.12, // kale stroomprijs incl BTW
  energyTaxEur: 0.11, // energiebelasting incl BTW
  networkCostEur: 0.02, // inkoopvergoeding/ODE incl BTW
};

// Total: €0.25/kWh. Matches jeroen.nl's €0.2520 for dynamic contract.
export function getTotalImportPrice(price: ElectricityPriceBreakdown): number {
  return price.energyPriceEur + price.energyTaxEur + price.networkCostEur;
}

// Net export: ~€0.02/kWh after terugleverkosten
export const DEFAULT_FINANCIAL_CONFIG: FinancialConfig = {
  importPrice: { ...DEFAULT_IMPORT_PRICE },
  exportPriceEur: 0.02,
  saldering: false,
  annualPriceIncrease: 0.02,
  timeframeYears: 15,
};

export const DEFAULT_SOLAR_CONFIG = {
  panelCount: 10,
  panelWattage: 400,
  orientation: "south" as Orientation,
  shadingFactor: 0,
};

export const DEFAULT_BATTERY_SIZES = [5, 10, 15] as const;

export const CALENDAR_AGING_PER_YEAR = 0.005;
