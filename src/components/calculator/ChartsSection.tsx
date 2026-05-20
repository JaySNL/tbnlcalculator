"use client";

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

export function ChartsSection({
  results,
  simulationInput,
  selectedSizes,
}: ChartsSectionProps) {
  return (
    <section className="space-y-12">
      <SelfConsumptionCurve
        input={simulationInput}
        selectedSizes={selectedSizes}
      />
      <EnergyFlowChart results={results} />
      <PaybackChart results={results} />
      <DailyProfileChart results={results} />
    </section>
  );
}
