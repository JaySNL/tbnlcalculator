"use client";

import { useTranslations } from "next-intl";
import { ComparisonTable } from "./ComparisonTable";
import type { ComparisonResult, FinancialConfig } from "@/lib/simulation/types";

interface ResultsSectionProps {
  results: ComparisonResult[];
  financialConfig: FinancialConfig;
}

export function ResultsSection({ results }: ResultsSectionProps) {
  const t = useTranslations("calculator.results");

  return (
    <section className="space-y-6">
      <div>
        <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-brand">
          05
        </span>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-5">
        <ComparisonTable results={results} />
      </div>
    </section>
  );
}
