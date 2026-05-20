"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ComparisonResult } from "@/lib/simulation/types";

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

type RowDef = {
  key: string;
  getValue: (r: ComparisonResult, locale: string, yearsUnit: string) => string;
};

const ROWS: RowDef[] = [
  { key: "annualSavings", getValue: (r, l) => fmtEur(r.annualSavingsFirstYear.total, l) },
  { key: "selfConsumption", getValue: (r) => fmtPct(r.selfConsumptionRatio) },
  { key: "gridDependency", getValue: (r) => fmtPct(r.gridDependencyRatio) },
  { key: "paybackPeriod", getValue: (r, _l, y) => fmtYears(r.paybackYears, y) },
  { key: "cyclesPerYear", getValue: (r) => Math.round(r.averageCyclesPerYear).toLocaleString() },
  { key: "batteryHealth", getValue: (r) => fmtPct(r.finalBatteryHealth) },
  { key: "totalSavings", getValue: (r, l) => fmtEur(r.totalSavings, l) },
  { key: "roi", getValue: (r) => `${r.roi.toFixed(1)}%` },
];

export function ComparisonTable({ results }: ComparisonTableProps) {
  const t = useTranslations("calculator.results");
  const locale = useLocale();
  const yearsUnit = t("yearsUnit");

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="pb-3 pr-6 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" />
              {results.map((r) => (
                <th
                  key={r.batteryConfig.sizeKwh}
                  className={cn(
                    "pb-3 text-center",
                    r.isRecommended && "text-brand",
                  )}
                >
                  <span className="text-lg font-semibold tabular-nums">
                    {r.batteryConfig.sizeKwh}
                  </span>
                  <span className="ml-1 text-muted-foreground">kWh</span>
                  {r.isRecommended && (
                    <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide">
                      {t("recommended")}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key} className="border-t border-border">
                <td className="py-2.5 pr-6 text-left text-sm text-muted-foreground">
                  {t(row.key)}
                </td>
                {results.map((r) => (
                  <td
                    key={r.batteryConfig.sizeKwh}
                    className={cn(
                      "py-2.5 text-center font-medium tabular-nums",
                      r.isRecommended && "bg-brand-muted/40",
                    )}
                  >
                    {row.getValue(r, locale, yearsUnit)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-4 sm:hidden">
        {results.map((r) => (
          <div
            key={r.batteryConfig.sizeKwh}
            className={cn(
              "rounded-lg border p-4",
              r.isRecommended && "border-brand",
            )}
          >
            <div className="mb-3 flex items-baseline justify-between">
              <div>
                <span className="text-lg font-semibold tabular-nums">
                  {r.batteryConfig.sizeKwh}
                </span>
                <span className="ml-1 text-sm text-muted-foreground">kWh</span>
              </div>
              {r.isRecommended && (
                <span className="bg-brand text-brand-foreground rounded px-2 py-0.5 text-xs font-medium">
                  {t("recommended")}
                </span>
              )}
            </div>
            <dl className="space-y-1.5">
              {ROWS.map((row) => (
                <div
                  key={row.key}
                  className="flex items-baseline justify-between"
                >
                  <dt className="text-sm text-muted-foreground">
                    {t(row.key)}
                  </dt>
                  <dd className="text-sm font-medium tabular-nums">
                    {row.getValue(r, locale, yearsUnit)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
