export type HouseholdProfileKey = "working" | "home" | "family" | "custom";

export type Orientation =
  | "south"
  | "southEastWest"
  | "eastWest"
  | "north";

export interface SolarConfig {
  panelCount: number;
  panelWattage: number; // Wp per panel
  orientation: Orientation;
  shadingFactor: number; // 0-1 (0 = no shading, 1 = full shading)
}

export interface BatteryConfig {
  sizeKwh: number;
  maxChargeRateKw: number;
  maxDischargeRateKw: number;
  roundTripEfficiency: number; // 0-1
  ratedCycles: number;
  endOfLifeDegradation: number; // 0-1 (e.g. 0.8 = 80% capacity at end of life)
}

export interface FinancialConfig {
  importPriceEur: number; // EUR per kWh
  exportPriceEur: number; // EUR per kWh
  saldering: boolean; // net metering active
  batteryCostPerKwh: number; // EUR per kWh installed
  annualPriceIncrease: number; // 0-1 (e.g. 0.02 = 2%)
  timeframeYears: number;
}

export interface SimulationInput {
  annualConsumptionKwh: number;
  solar: SolarConfig;
}

export interface HourlyDataPoint {
  hour: number;
  solarProduction: number; // kWh
  consumption: number; // kWh
  batteryCharge: number; // kWh charged this hour
  batteryDischarge: number; // kWh discharged this hour
  batterySoc: number; // kWh in battery after this hour
  gridImport: number; // kWh from grid
  gridExport: number; // kWh to grid
}

export interface MonthlyBreakdown {
  month: number; // 0-11
  solarProduction: number; // kWh
  consumption: number; // kWh
  selfConsumedDirect: number; // kWh solar used directly
  batteryCharged: number; // kWh
  batteryDischarged: number; // kWh
  gridImport: number; // kWh
  gridExport: number; // kWh
  cycles: number;
  hourlyData: HourlyDataPoint[];
}

export interface YearResult {
  year: number;
  effectiveCapacityKwh: number;
  monthlyBreakdown: MonthlyBreakdown[];
  totalSolarProduction: number;
  totalConsumption: number;
  totalSelfConsumed: number; // direct + battery
  totalGridImport: number;
  totalGridExport: number;
  totalCycles: number;
  selfConsumptionRatio: number; // 0-1
}

export interface FinancialYearResult {
  year: number;
  annualSavings: number; // EUR
  cumulativeSavings: number; // EUR
  importPrice: number; // EUR/kWh for this year
  exportPrice: number; // EUR/kWh for this year
}

export interface ComparisonResult {
  batteryConfig: BatteryConfig;
  yearResults: YearResult[];
  financialResults: FinancialYearResult[];
  totalSavings: number; // EUR over timeframe
  annualSavingsFirstYear: number; // EUR
  paybackYears: number | null; // null if never pays back
  roi: number; // percentage
  averageCyclesPerYear: number;
  finalBatteryHealth: number; // 0-1
  selfConsumptionRatio: number; // 0-1 (first year)
  isRecommended: boolean;
  totalInvestment: number; // EUR
}

export interface BaselineResult {
  yearResults: YearResult[];
  totalGridImport: number;
  totalGridExport: number;
}
