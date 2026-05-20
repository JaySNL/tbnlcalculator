"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { HOUSEHOLD_PROFILES } from "@/lib/simulation/constants";
import type { HouseholdProfileKey } from "@/lib/simulation/types";

interface ProfileValue {
  profile: HouseholdProfileKey;
  consumption: number;
}

interface ProfileSelectorProps {
  value: ProfileValue;
  onChange: (v: ProfileValue) => void;
}

const PROFILE_KEYS: HouseholdProfileKey[] = [
  "working",
  "home",
  "family",
  "custom",
];

export function ProfileSelector({ value, onChange }: ProfileSelectorProps) {
  const t = useTranslations("calculator.profile");

  function selectProfile(profile: HouseholdProfileKey) {
    const consumption =
      profile === "custom"
        ? value.consumption
        : HOUSEHOLD_PROFILES[profile];
    onChange({ profile, consumption });
  }

  function setConsumption(v: number | readonly number[]) {
    const n = Array.isArray(v) ? v[0] : v;
    onChange({ ...value, consumption: n });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PROFILE_KEYS.map((key) => {
          const isSelected = value.profile === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => selectProfile(key)}
              className={cn(
                "flex flex-col gap-1 rounded-lg border px-4 py-3 text-left transition-colors",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <span className="text-sm font-medium">{t(key)}</span>
              {key !== "custom" && (
                <span
                  className={cn(
                    "text-xs",
                    isSelected
                      ? "text-background/70"
                      : "text-muted-foreground",
                  )}
                >
                  {HOUSEHOLD_PROFILES[key].toLocaleString()} kWh
                </span>
              )}
            </button>
          );
        })}
      </div>

      {value.profile === "custom" ? (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">
              {t("consumption")}
            </span>
            <span className="text-2xl font-semibold tabular-nums">
              {value.consumption.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                kWh
              </span>
            </span>
          </div>
          <Slider
            min={500}
            max={15000}
            step={50}
            value={[value.consumption]}
            onValueChange={setConsumption}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>500</span>
            <span>15.000 kWh</span>
          </div>
        </div>
      ) : (
        <div className="flex items-baseline justify-between rounded-lg border border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {t("estimated")}
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {value.consumption.toLocaleString()}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              kWh
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
