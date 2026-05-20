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

  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {t("title")}
        </h2>
      </div>

      <ComparisonTable results={results} />
    </section>
  );
}
