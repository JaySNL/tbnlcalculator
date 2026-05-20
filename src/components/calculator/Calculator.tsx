"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { InputSection, type FormData } from "./InputSection";
import { ResultsSection } from "./ResultsSection";
import { ChartsSection } from "./ChartsSection";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  DEFAULT_FINANCIAL_CONFIG,
  DEFAULT_SOLAR_CONFIG,
  DEFAULT_BATTERY_SIZES,
  HOUSEHOLD_PROFILES,
} from "@/lib/simulation/constants";
import { compareScenarios } from "@/lib/simulation/compare";
import type { ComparisonResult } from "@/lib/simulation/types";

const INITIAL_FORM_DATA: FormData = {
  profile: "working",
  consumption: HOUSEHOLD_PROFILES.working,
  solar: { ...DEFAULT_SOLAR_CONFIG },
  batterySizes: [...DEFAULT_BATTERY_SIZES],
  financial: { ...DEFAULT_FINANCIAL_CONFIG },
};

export function Calculator() {
  const t = useTranslations("common");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

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

      <InputSection formData={formData} onFormDataChange={setFormData} />

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
