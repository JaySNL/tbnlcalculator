import type {
  FinancialConfig,
  FinancialYearResult,
  YearResult,
  BatteryConfig,
} from "./types";

export interface FinancialAnalysis {
  yearResults: FinancialYearResult[];
  totalSavings: number;
  annualSavingsFirstYear: number;
  paybackYears: number | null;
  roi: number;
  totalInvestment: number;
}

function calculateYearSavings(
  batteryYear: YearResult,
  baselineYear: YearResult,
  importPrice: number,
  exportPrice: number,
  useSaldering: boolean,
): number {
  if (useSaldering) {
    // Full saldering: exported kWh offset imported kWh 1:1 (including taxes)
    // Net cost = max(0, gridImport - gridExport) × importPrice
    // Battery shifts energy from export→self-consumption, but net stays the same
    // Under full saldering, battery provides no financial benefit
    // (and actually loses money due to efficiency, but we floor at 0)
    const baselineNet = baselineYear.totalGridImport - baselineYear.totalGridExport;
    const batteryNet = batteryYear.totalGridImport - batteryYear.totalGridExport;
    const baselineCost = Math.max(0, baselineNet) * importPrice;
    const batteryCost = Math.max(0, batteryNet) * importPrice;
    return Math.max(0, baselineCost - batteryCost);
  }

  // No saldering: import costs importPrice, export earns exportPrice
  // Battery value = avoided imports × importPrice - reduced exports × exportPrice
  // = shifting kWh from export (€0.07) to self-consumption (avoiding €0.28 import)
  const baselineCost =
    baselineYear.totalGridImport * importPrice -
    baselineYear.totalGridExport * exportPrice;
  const batteryCost =
    batteryYear.totalGridImport * importPrice -
    batteryYear.totalGridExport * exportPrice;
  return Math.max(0, baselineCost - batteryCost);
}

export function calculateFinancials(
  batteryYears: YearResult[],
  baselineYears: YearResult[],
  financialConfig: FinancialConfig,
  batteryConfig: BatteryConfig,
): FinancialAnalysis {
  const totalInvestment = batteryConfig.sizeKwh * financialConfig.batteryCostPerKwh;
  const yearResults: FinancialYearResult[] = [];
  let cumulativeSavings = 0;
  let paybackYears: number | null = null;

  // Saldering ends Jan 1 2027. If toggle is ON, the user currently has saldering.
  // Year 0 (2026) uses saldering. Years 1+ (2027+) do not.
  // If toggle is OFF, all years use post-saldering economics.
  const salderingEndsAfterYear = financialConfig.saldering ? 1 : 0;

  for (let i = 0; i < batteryYears.length; i++) {
    const priceMultiplier = Math.pow(1 + financialConfig.annualPriceIncrease, i);
    const importPrice = financialConfig.importPriceEur * priceMultiplier;
    const exportPrice = financialConfig.exportPriceEur * priceMultiplier;
    const useSaldering = i < salderingEndsAfterYear;

    const annualSavings = calculateYearSavings(
      batteryYears[i],
      baselineYears[i],
      importPrice,
      exportPrice,
      useSaldering,
    );

    cumulativeSavings += annualSavings;

    if (paybackYears === null && cumulativeSavings >= totalInvestment) {
      const prevCumulative = cumulativeSavings - annualSavings;
      const remaining = totalInvestment - prevCumulative;
      const fractionOfYear = annualSavings > 0 ? remaining / annualSavings : 1;
      paybackYears = i + fractionOfYear;
    }

    yearResults.push({
      year: i,
      annualSavings,
      cumulativeSavings,
      importPrice,
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
    annualSavingsFirstYear: yearResults[0]?.annualSavings ?? 0,
    paybackYears,
    roi,
    totalInvestment,
  };
}
