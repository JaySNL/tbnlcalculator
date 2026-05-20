"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ComparisonResult } from "@/lib/simulation/types";
import { getBatteryCostPerKwh } from "@/lib/simulation/constants";

interface ComparisonTableProps {
  results: ComparisonResult[];
}

function fmtEur(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function fmtYears(
  value: number | null,
  unit: string,
): string {
  if (value === null) return "—";
  return `${value.toFixed(1)} ${unit}`;
}

// Determine which result index has the "best" value for a given metric.
// Returns -1 if no valid best exists.
type BestDirection = "highest" | "lowest" | "none";

function findBestIndex(
  results: ComparisonResult[],
  getValue: (r: ComparisonResult) => number | null,
  direction: BestDirection,
): number {
  if (direction === "none") return -1;
  let bestIdx = -1;
  let bestVal: number | null = null;
  for (let i = 0; i < results.length; i++) {
    const v = getValue(results[i]);
    if (v === null) continue;
    if (
      bestVal === null ||
      (direction === "highest" && v > bestVal) ||
      (direction === "lowest" && v < bestVal)
    ) {
      bestVal = v;
      bestIdx = i;
    }
  }
  return bestIdx;
}

type RowDef = {
  key: string;
  getValue: (r: ComparisonResult, locale: string, yearsUnit: string) => string;
  getNumeric: (r: ComparisonResult) => number | null;
  direction: BestDirection;
};

const ROWS: RowDef[] = [
  {
    key: "selfConsumption",
    getValue: (r) => fmtPct(r.selfConsumptionRatio),
    getNumeric: (r) => r.selfConsumptionRatio,
    direction: "highest",
  },
  {
    key: "gridDependency",
    getValue: (r) => fmtPct(r.gridDependencyRatio),
    getNumeric: (r) => r.gridDependencyRatio,
    direction: "lowest",
  },
  {
    key: "paybackPeriod",
    getValue: (r, _l, y) => fmtYears(r.paybackYears, y),
    getNumeric: (r) => r.paybackYears,
    direction: "lowest",
  },
  {
    key: "cyclesPerYear",
    getValue: (r) => Math.round(r.averageCyclesPerYear).toLocaleString(),
    getNumeric: (r) => r.averageCyclesPerYear,
    direction: "none",
  },
  {
    key: "batteryHealth",
    getValue: (r) => fmtPct(r.finalBatteryHealth),
    getNumeric: (r) => r.finalBatteryHealth,
    direction: "highest",
  },
  {
    key: "totalSavings",
    getValue: (r, l) => fmtEur(r.totalSavings, l),
    getNumeric: (r) => r.totalSavings,
    direction: "highest",
  },
  {
    key: "roi",
    getValue: (r) => `${r.roi.toFixed(1)}%`,
    getNumeric: (r) => r.roi,
    direction: "highest",
  },
];

function BatteryColumnHeader({
  result,
  locale,
  t,
}: {
  result: ComparisonResult;
  locale: string;
  t: (key: string) => string;
}) {
  const size = result.batteryConfig.sizeKwh;
  const dod = result.batteryConfig.depthOfDischarge;
  const effective = size * dod;
  const costPerKwh = getBatteryCostPerKwh(size);
  const totalCost = costPerKwh * size;

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted px-3 py-2.5">
      <div>
        <span className="text-lg font-semibold tabular-nums">{size}</span>
        <span className="ml-1 text-sm text-muted-foreground">kWh</span>
      </div>
      <div className="text-xs text-muted-foreground">
        {effective.toFixed(1)} kWh {t("usable")}
      </div>
      <div className="font-mono text-sm font-medium tabular-nums">
        {fmtEur(totalCost, locale)}
      </div>
      <div className="text-xs text-muted-foreground">
        {fmtEur(costPerKwh, locale)}/kWh
      </div>
    </div>
  );
}

function SavingsBreakdownCell({
  result,
  locale,
  t,
  isBest,
}: {
  result: ComparisonResult;
  locale: string;
  t: (key: string) => string;
  isBest: boolean;
}) {
  const s = result.annualSavingsFirstYear;
  return (
    <td
      className={cn(
        "py-2.5 text-center font-mono tabular-nums",
        isBest && "bg-brand/10 text-brand",
      )}
    >
      <div className="flex flex-col items-center gap-0.5 text-xs">
        <span>
          {t("savingsEnergy")}: {fmtEur(s.energy, locale)}
        </span>
        <span>
          {t("savingsEnergyTax")}: {fmtEur(s.energyTax, locale)}
        </span>
        <span>
          {t("savingsNetworkCost")}: {fmtEur(s.networkCost, locale)}
        </span>
        <span className="mt-0.5 text-sm font-semibold">
          {fmtEur(s.total, locale)}
        </span>
      </div>
    </td>
  );
}

export function ComparisonTable({ results }: ComparisonTableProps) {
  const t = useTranslations("calculator.results");
  const locale = useLocale();
  const yearsUnit = t("yearsUnit");

  // Pre-compute best index for annual savings row
  const bestSavingsIdx = findBestIndex(
    results,
    (r) => r.annualSavingsFirstYear.total,
    "highest",
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="pb-3 pr-6 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" />
              {results.map((r) => (
                <th key={r.batteryConfig.sizeKwh} className="pb-3 px-2">
                  <BatteryColumnHeader result={r} locale={locale} t={t} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Annual savings breakdown row */}
            <tr className="border-t border-border">
              <td className="py-2.5 pr-6 text-left text-sm text-muted-foreground">
                {t("annualSavings")}
              </td>
              {results.map((r, idx) => (
                <SavingsBreakdownCell
                  key={r.batteryConfig.sizeKwh}
                  result={r}
                  locale={locale}
                  t={t}
                  isBest={idx === bestSavingsIdx}
                />
              ))}
            </tr>

            {/* Standard metric rows */}
            {ROWS.map((row) => {
              const bestIdx = findBestIndex(results, row.getNumeric, row.direction);
              return (
                <tr key={row.key} className="border-t border-border">
                  <td className="py-2.5 pr-6 text-left text-sm text-muted-foreground">
                    {t(row.key)}
                  </td>
                  {results.map((r, idx) => (
                    <td
                      key={r.batteryConfig.sizeKwh}
                      className={cn(
                        "py-2.5 text-center font-mono font-medium tabular-nums",
                        idx === bestIdx && "bg-brand/10 text-brand",
                      )}
                    >
                      {row.getValue(r, locale, yearsUnit)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-4 sm:hidden">
        {results.map((r) => {
          const size = r.batteryConfig.sizeKwh;
          const dod = r.batteryConfig.depthOfDischarge;
          const effective = size * dod;
          const costPerKwh = getBatteryCostPerKwh(size);
          const totalCost = costPerKwh * size;
          const s = r.annualSavingsFirstYear;

          return (
            <div
              key={size}
              className="rounded-lg border border-border p-4"
            >
              {/* Card header */}
              <div className="mb-3 rounded-md bg-muted px-3 py-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-semibold tabular-nums">
                      {size}
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      kWh
                    </span>
                  </div>
                  <span className="font-mono text-sm font-medium tabular-nums">
                    {fmtEur(totalCost, locale)}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-xs text-muted-foreground">
                  <span>
                    {effective.toFixed(1)} kWh {t("usable")}
                  </span>
                  <span>{fmtEur(costPerKwh, locale)}/kWh</span>
                </div>
              </div>

              {/* Savings breakdown */}
              <div className="mb-2 space-y-0.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("savingsEnergy")}</span>
                  <span className="font-mono tabular-nums">{fmtEur(s.energy, locale)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("savingsEnergyTax")}</span>
                  <span className="font-mono tabular-nums">{fmtEur(s.energyTax, locale)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("savingsNetworkCost")}</span>
                  <span className="font-mono tabular-nums">{fmtEur(s.networkCost, locale)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1">
                  <span className="font-medium">{t("savingsTotal")}</span>
                  <span className="font-mono font-semibold tabular-nums">{fmtEur(s.total, locale)}</span>
                </div>
              </div>

              {/* Metric rows */}
              <dl className="space-y-1.5">
                {ROWS.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-baseline justify-between"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {t(row.key)}
                    </dt>
                    <dd className="font-mono text-sm font-medium tabular-nums">
                      {row.getValue(r, locale, yearsUnit)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </>
  );
}
