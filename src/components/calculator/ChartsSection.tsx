"use client";

import type { ReactNode } from "react";
import { EnergyFlowChart } from "./EnergyFlowChart";
import { PaybackChart } from "./PaybackChart";
import { DailyProfileChart } from "./DailyProfileChart";
import { SelfConsumptionCurve } from "./SelfConsumptionCurve";
import type { ComparisonResult, SimulationInput } from "@/lib/simulation/types";

interface ChartsSectionProps {
  results: ComparisonResult[];
  simulationInput: SimulationInput;
  selectedSizes: number[];
}

function ChartCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-5">
      {children}
    </div>
  );
}

export function ChartsSection({
  results,
  simulationInput,
  selectedSizes,
}: ChartsSectionProps) {
  return (
    <section className="space-y-6">
      <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-brand">
        Grafieken
      </span>

      <div className="space-y-4">
        <ChartCard>
          <SelfConsumptionCurve
            input={simulationInput}
            selectedSizes={selectedSizes}
          />
        </ChartCard>
        <ChartCard>
          <EnergyFlowChart results={results} />
        </ChartCard>
        <ChartCard>
          <PaybackChart results={results} />
        </ChartCard>
        <ChartCard>
          <DailyProfileChart results={results} />
        </ChartCard>
      </div>
    </section>
  );
}
