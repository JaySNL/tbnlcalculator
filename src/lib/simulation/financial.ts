import type {
  FinancialConfig,
  FinancialYearResult,
  SavingsBreakdown,
  YearResult,
  BatteryConfig,
} from "./types";
import { getTotalImportPrice, getBatteryCostPerKwh } from "./constants";

export interface FinancialAnalysis {
  yearResults: FinancialYearResult[];
  totalSavings: number;
  annualSavingsFirstYear: SavingsBreakdown;
  paybackYears: number | null;
  roi: number;
  totalInvestment: number;
}

function calculateYearSavings(
  batteryYear: YearResult,
  baselineYear: YearResult,
  financialConfig: FinancialConfig,
  priceMultiplier: number,
  useSaldering: boolean,
): { savings: SavingsBreakdown; importPriceTotal: number; exportPrice: number } {
  const ip = financialConfig.importPrice;
  const energyPrice = ip.energyPriceEur * priceMultiplier;
  const energyTax = ip.energyTaxEur * priceMultiplier;
  const networkCost = ip.networkCostEur * priceMultiplier;
  const importPriceTotal = energyPrice + energyTax + networkCost;
  const exportPrice = financialConfig.exportPriceEur * priceMultiplier;

  if (useSaldering) {
    // Full saldering: grid acts as battery, no financial benefit from physical battery
    return {
      savings: { energy: 0, energyTax: 0, networkCost: 0, total: 0 },
      importPriceTotal,
      exportPrice,
    };
  }

  // Post-saldering: each kWh shifted from export→self-consumption saves the import-export spread
  // The avoided import has three components: energy, tax, and network cost
  const avoidedImport = Math.max(0, baselineYear.totalGridImport - batteryYear.totalGridImport);
  const reducedExport = Math.max(0, baselineYear.totalGridExport - batteryYear.totalGridExport);

  // Net kWh shifted from grid to self-consumption via battery
  const kwhShifted = Math.min(avoidedImport, reducedExport);

  // Savings per component: each shifted kWh saves the full import price component
  // but loses the export revenue for that kWh
  const exportLossPerKwh = exportPrice;

  const energySaved = kwhShifted * (energyPrice - exportLossPerKwh / 3);
  const taxSaved = kwhShifted * (energyTax - exportLossPerKwh / 3);
  const networkSaved = kwhShifted * (networkCost - exportLossPerKwh / 3);

  // Simpler and more accurate: total savings = avoided import cost - lost export revenue
  const totalSaved = avoidedImport * importPriceTotal - reducedExport * exportPrice;
  const safeTotal = Math.max(0, totalSaved);

  // Proportionally split total across components
  const ratio = safeTotal > 0 ? safeTotal / (avoidedImport * importPriceTotal || 1) : 0;

  return {
    savings: {
      energy: avoidedImport * energyPrice * ratio,
      energyTax: avoidedImport * energyTax * ratio,
      networkCost: avoidedImport * networkCost * ratio,
      total: safeTotal,
    },
    importPriceTotal,
    exportPrice,
  };
}

export function calculateFinancials(
  batteryYears: YearResult[],
  baselineYears: YearResult[],
  financialConfig: FinancialConfig,
  batteryConfig: BatteryConfig,
): FinancialAnalysis {
  const costPerKwh = getBatteryCostPerKwh(batteryConfig.sizeKwh);
  const totalInvestment = batteryConfig.sizeKwh * costPerKwh;
  const yearResults: FinancialYearResult[] = [];
  let cumulativeSavings = 0;
  let paybackYears: number | null = null;

  const salderingEndsAfterYear = financialConfig.saldering ? 1 : 0;

  for (let i = 0; i < batteryYears.length; i++) {
    const priceMultiplier = Math.pow(1 + financialConfig.annualPriceIncrease, i);
    const useSaldering = i < salderingEndsAfterYear;

    const { savings, importPriceTotal, exportPrice } = calculateYearSavings(
      batteryYears[i],
      baselineYears[i],
      financialConfig,
      priceMultiplier,
      useSaldering,
    );

    cumulativeSavings += savings.total;

    if (paybackYears === null && cumulativeSavings >= totalInvestment) {
      const prevCumulative = cumulativeSavings - savings.total;
      const remaining = totalInvestment - prevCumulative;
      const fractionOfYear = savings.total > 0 ? remaining / savings.total : 1;
      paybackYears = i + fractionOfYear;
    }

    yearResults.push({
      year: i,
      savings,
      cumulativeSavings,
      importPriceTotal,
      exportPrice,
    });
  }

  const roi =
    totalInvestment > 0
      ? ((cumulativeSavings - totalInvestment) / totalInvestment) * 100
      : 0;

  return {
    yearResults,
    totalSavings: cumulativeSavings,
    annualSavingsFirstYear: yearResults[0]?.savings ?? { energy: 0, energyTax: 0, networkCost: 0, total: 0 },
    paybackYears,
    roi,
    totalInvestment,
  };
}
