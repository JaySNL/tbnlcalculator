"use client";

import { useTranslations } from "next-intl";
import { ComparisonTable } from "./ComparisonTable";
import type { ComparisonResult, FinancialConfig } from "@/lib/simulation/types";

interface ResultsSectionProps {
  results: ComparisonResult[];
  financialConfig: FinancialConfig;
}

export function ResultsSection({
  results,
}: ResultsSectionProps) {
  const t = useTranslations("calculator.results");
  const recommended = results.find((r) => r.isRecommended);

  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {t("title")}
        </h2>
      </div>

      <ComparisonTable results={results} />

      <p className="text-sm text-muted-foreground">
        {recommended ? (
          <>
            <span className="font-medium text-foreground">
              {recommended.batteryConfig.sizeKwh} kWh
            </span>
            {" — "}
            {t("recommendationReason")}
            {recommended.paybackYears !== null && (
              <>
                {" ("}
                <span className="tabular-nums">
                  {recommended.paybackYears.toFixed(1)}
                </span>
                {` ${t("yearsUnit")})`}
              </>
            )}
          </>
        ) : (
          t("noRecommendation")
        )}
      </p>
    </section>
  );
}
