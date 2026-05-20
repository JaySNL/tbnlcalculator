import type {
  BatteryConfig,
  FinancialConfig,
  HouseholdProfileKey,
  Orientation,
} from "./types";

// NL annual solar yield: ~948 kWh per kWp (PVGIS/MilieuCentraal reference)
export const ANNUAL_YIELD_KWH_PER_KWP = 948;

// Monthly solar production weights (fraction of annual total)
// Source: PVGIS data for Netherlands, validated against v1 constants
export const MONTHLY_SOLAR_WEIGHTS = [
  0.026, // Jan  - 25 kWh/kWp
  0.042, // Feb  - 40 kWh/kWp
  0.084, // Mar  - 80 kWh/kWp
  0.116, // Apr  - 110 kWh/kWp
  0.137, // May  - 130 kWh/kWp
  0.142, // Jun  - 135 kWh/kWp
  0.137, // Jul  - 130 kWh/kWp
  0.121, // Aug  - 115 kWh/kWp
  0.090, // Sep  - 85 kWh/kWp
  0.053, // Oct  - 50 kWh/kWp
  0.030, // Nov  - 28 kWh/kWp
  0.021, // Dec  - 20 kWh/kWp
] as const;

// Monthly demand weights (multiplier on average daily demand)
// Higher in winter (heating, lighting), lower in summer
export const MONTHLY_DEMAND_WEIGHTS = [
  1.15, // Jan
  1.1, // Feb
  1.05, // Mar
  0.95, // Apr
  0.9, // May
  0.85, // Jun
  0.85, // Jul
  0.9, // Aug
  0.95, // Sep
  1.0, // Oct
  1.1, // Nov
  1.15, // Dec
] as const;

// Days per month (non-leap year)
export const DAYS_PER_MONTH = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
] as const;

// Orientation yield correction factors (fraction of south-facing yield)
// Source: PVGIS/MilieuCentraal
export const ORIENTATION_FACTORS: Record<Orientation, number> = {
  south: 1.0,
  southEastWest: 0.95,
  eastWest: 0.85,
  north: 0.55,
};

// Hourly solar production curve (fraction of daily total per hour)
// Bell curve approximation for NL latitude, peak around solar noon
// Hours 0-23. Significant production between 6:00-20:00
export function getSolarHourlyFraction(hour: number): number {
  if (hour < 5 || hour > 21) return 0;
  return Math.sin(((hour - 5) / 16) * Math.PI);
}

// Hourly demand curve (fraction of daily total per hour)
// Dual peak: morning (7-9), evening (17-21), with overnight baseline
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

// Household consumption presets (annual kWh)
export const HOUSEHOLD_PROFILES: Record<HouseholdProfileKey, number> = {
  working: 3250,
  home: 4250,
  family: 5000,
  custom: 3500,
};

// Common battery sizes available for comparison (kWh)
export const BATTERY_SIZE_OPTIONS = [5, 7, 10, 13.5, 15, 20] as const;

// Default battery config factory: scales charge/discharge rate with size
export function createDefaultBatteryConfig(sizeKwh: number): BatteryConfig {
  return {
    sizeKwh,
    maxChargeRateKw: Math.min(sizeKwh * 0.5, 5),
    maxDischargeRateKw: Math.min(sizeKwh * 0.5, 5),
    roundTripEfficiency: 0.9,
    ratedCycles: 6000,
    endOfLifeDegradation: 0.8,
  };
}

// Default financial config for NL market (2026)
export const DEFAULT_FINANCIAL_CONFIG: FinancialConfig = {
  importPriceEur: 0.28,
  exportPriceEur: 0.07,
  saldering: false, // post-2027 default (forward-looking)
  batteryCostPerKwh: 500,
  annualPriceIncrease: 0.02,
  timeframeYears: 15,
};

// Default solar config
export const DEFAULT_SOLAR_CONFIG = {
  panelCount: 10,
  panelWattage: 400,
  orientation: "south" as Orientation,
  shadingFactor: 0,
};

// Default selected battery sizes for comparison
export const DEFAULT_BATTERY_SIZES = [5, 10, 15] as const;

// Calendar aging: annual capacity loss independent of cycling
export const CALENDAR_AGING_PER_YEAR = 0.005; // 0.5% per year
