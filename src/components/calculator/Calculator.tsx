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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <LanguageSwitcher />
      </header>

      <InputSection formData={formData} onFormDataChange={setFormData} />

      {results && (
        <div className="mt-14 space-y-14">
          <ResultsSection
            results={results}
            financialConfig={formData.financial}
          />
          <ChartsSection results={results} />
        </div>
      )}
    </div>
  );
}
