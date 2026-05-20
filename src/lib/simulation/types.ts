export type HouseholdProfileKey = "working" | "home" | "family" | "custom";

export type Orientation =
  | "south"
  | "southEastWest"
  | "eastWest"
  | "north";

export interface SolarConfig {
  panelCount: number;
  panelWattage: number;
  orientation: Orientation;
  shadingFactor: number; // 0-1
}

export interface BatteryConfig {
  sizeKwh: number;
  depthOfDischarge: number; // 0-1 (e.g. 0.9 = 90% usable)
  maxChargeRateKw: number;
  maxDischargeRateKw: number;
  roundTripEfficiency: number; // 0-1
  ratedCycles: number;
  endOfLifeDegradation: number; // 0-1
}

// NL electricity price is composed of multiple components
export interface ElectricityPriceBreakdown {
  energyPriceEur: number; // bare energy cost (incl BTW) ~€0.12
  energyTaxEur: number; // energiebelasting (incl BTW) ~€0.11
  networkCostEur: number; // inkoopvergoeding / ODE (incl BTW) ~€0.02
}

export interface FinancialConfig {
  importPrice: ElectricityPriceBreakdown;
  exportPriceEur: number; // net terugleververgoeding after fees
  saldering: boolean;
  annualPriceIncrease: number; // 0-1
  timeframeYears: number;
}

export interface SimulationInput {
  annualConsumptionKwh: number;
  solar: SolarConfig;
}

export interface HourlyDataPoint {
  hour: number;
  solarProduction: number;
  consumption: number;
  batteryCharge: number;
  batteryDischarge: number;
  batterySoc: number;
  gridImport: number;
  gridExport: number;
}

export interface MonthlyBreakdown {
  month: number;
  solarProduction: number;
  consumption: number;
  selfConsumedDirect: number;
  batteryCharged: number;
  batteryDischarged: number;
  gridImport: number;
  gridExport: number;
  cycles: number;
  hourlyData: HourlyDataPoint[];
}

export interface YearResult {
  year: number;
  effectiveCapacityKwh: number;
  monthlyBreakdown: MonthlyBreakdown[];
  totalSolarProduction: number;
  totalConsumption: number;
  totalSelfConsumed: number;
  totalGridImport: number;
  totalGridExport: number;
  totalCycles: number;
  selfConsumptionRatio: number; // 0-1
}

export interface SavingsBreakdown {
  energy: number; // saved on bare energy cost
  energyTax: number; // saved on energiebelasting
  networkCost: number; // saved on inkoopvergoeding/ODE
  total: number; // sum
}

export interface FinancialYearResult {
  year: number;
  savings: SavingsBreakdown;
  cumulativeSavings: number;
  importPriceTotal: number; // total EUR/kWh for this year
  exportPrice: number;
}

export interface ComparisonResult {
  batteryConfig: BatteryConfig;
  yearResults: YearResult[];
  financialResults: FinancialYearResult[];
  totalSavings: number;
  annualSavingsFirstYear: SavingsBreakdown;
  paybackYears: number | null;
  roi: number;
  averageCyclesPerYear: number;
  finalBatteryHealth: number;
  selfConsumptionRatio: number;
  gridDependencyRatio: number; // netafhankelijkheid
  isRecommended: boolean;
  totalInvestment: number;
}

export interface BaselineResult {
  yearResults: YearResult[];
  totalGridImport: number;
  totalGridExport: number;
}
