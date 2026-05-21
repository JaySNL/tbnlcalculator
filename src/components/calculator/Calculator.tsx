"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { InputSection, type FormData } from "./InputSection";
import { ResultsSection } from "./ResultsSection";
import { ChartsSection } from "./ChartsSection";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  DEFAULT_FINANCIAL_CONFIG,
  DEFAULT_SOLAR_CONFIG,
  HOUSEHOLD_PROFILES,
} from "@/lib/simulation/constants";
import { compareScenarios } from "@/lib/simulation/compare";
import { suggestBatterySizes, computeEveningDemand } from "@/lib/simulation/sizing";
import type { ComparisonResult } from "@/lib/simulation/types";

function getInitialSolarKwp(): number {
  return (DEFAULT_SOLAR_CONFIG.panelCount * DEFAULT_SOLAR_CONFIG.panelWattage) / 1000;
}

const initialConsumption = HOUSEHOLD_PROFILES.working;
const initialSolarKwp = getInitialSolarKwp();

const INITIAL_FORM_DATA: FormData = {
  profile: "working",
  consumption: initialConsumption,
  solar: { ...DEFAULT_SOLAR_CONFIG },
  batterySizes: suggestBatterySizes(initialConsumption, initialSolarKwp),
  financial: { ...DEFAULT_FINANCIAL_CONFIG },
};

export function Calculator() {
  const t = useTranslations("common");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const userEditedSizes = useRef(false);

  const eveningDemand = useMemo(
    () => computeEveningDemand(formData.consumption),
    [formData.consumption],
  );

  const handleFormDataChange = useCallback(
    (newData: FormData) => {
      const consumptionChanged = newData.consumption !== formData.consumption;
      const solarChanged =
        newData.solar.panelCount !== formData.solar.panelCount ||
        newData.solar.panelWattage !== formData.solar.panelWattage;
      const sizesChanged =
        JSON.stringify(newData.batterySizes) !== JSON.stringify(formData.batterySizes);

      // If the user manually toggled a battery size (sizes changed but consumption/solar didn't),
      // mark as user-edited and stop auto-updating
      if (sizesChanged && !consumptionChanged && !solarChanged) {
        userEditedSizes.current = true;
      }

      // Auto-update battery sizes when consumption or solar changes (unless user edited)
      if ((consumptionChanged || solarChanged) && !userEditedSizes.current) {
        const kwp = (newData.solar.panelCount * newData.solar.panelWattage) / 1000;
        newData = {
          ...newData,
          batterySizes: suggestBatterySizes(newData.consumption, kwp),
        };
      }

      setFormData(newData);
    },
    [formData],
  );

  const results: ComparisonResult[] | null = useMemo(() => {
    if (formData.batterySizes.length < 2) return null;
    return compareScenarios(
      {
        annualConsumptionKwh: formData.consumption,
        solar: formData.solar,
      },
      formData.batterySizes,
      formData.financial,
    );
  }, [formData]);

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-24 pt-12 sm:px-6 lg:pt-16">
      <header className="mb-14">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tighter sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-[50ch] text-[15px] leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
        <div className="mt-6 h-px bg-border" />
      </header>

      <InputSection formData={formData} onFormDataChange={handleFormDataChange} eveningDemand={eveningDemand} />

      {results && (
        <div className="mt-20 space-y-20">
          <ResultsSection
            results={results}
            financialConfig={formData.financial}
          />
          <ChartsSection
            results={results}
            simulationInput={{
              annualConsumptionKwh: formData.consumption,
              solar: formData.solar,
            }}
            selectedSizes={formData.batterySizes}
          />
        </div>
      )}
    </div>
  );
}
