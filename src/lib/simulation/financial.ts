import type {
  FinancialConfig,
  FinancialYearResult,
  YearResult,
  ComparisonResult,
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

  for (let i = 0; i < batteryYears.length; i++) {
    const priceMultiplier = Math.pow(1 + financialConfig.annualPriceIncrease, i);
    const importPrice = financialConfig.importPriceEur * priceMultiplier;
    const exportPrice = financialConfig.exportPriceEur * priceMultiplier;

    const batteryYear = batteryYears[i];
    const baselineYear = baselineYears[i];

    let annualSavings: number;

    if (financialConfig.saldering) {
      // Net metering: exported kWh offsets imported kWh 1:1
      // Cost = max(0, netImport) * importPrice
      // netImport = gridImport - gridExport
      const baselineNetImport = baselineYear.totalGridImport - baselineYear.totalGridExport;
      const batteryNetImport = batteryYear.totalGridImport - batteryYear.totalGridExport;

      const baselineCost = Math.max(0, baselineNetImport) * importPrice;
      const batteryCost = Math.max(0, batteryNetImport) * importPrice;

      annualSavings = baselineCost - batteryCost;
    } else {
      // No net metering: import costs importPrice, export earns exportPrice
      const baselineCost =
        baselineYear.totalGridImport * importPrice -
        baselineYear.totalGridExport * exportPrice;
      const batteryCost =
        batteryYear.totalGridImport * importPrice -
        batteryYear.totalGridExport * exportPrice;

      annualSavings = baselineCost - batteryCost;
    }

    annualSavings = Math.max(0, annualSavings);
    cumulativeSavings += annualSavings;

    if (paybackYears === null && cumulativeSavings >= totalInvestment) {
      // Interpolate within the year for more precise payback
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
