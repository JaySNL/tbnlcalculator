"use client";

import { EnergyFlowChart } from "./EnergyFlowChart";
import { PaybackChart } from "./PaybackChart";
import { DailyProfileChart } from "./DailyProfileChart";
import type { ComparisonResult } from "@/lib/simulation/types";

interface ChartsSectionProps {
  results: ComparisonResult[];
}

export function ChartsSection({ results }: ChartsSectionProps) {
  return (
    <section className="space-y-10">
      <EnergyFlowChart results={results} />
      <PaybackChart results={results} />
      <DailyProfileChart results={results} />
    </section>
  );
}
