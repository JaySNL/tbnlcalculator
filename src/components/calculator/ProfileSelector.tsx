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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PROFILE_KEYS.map((key) => {
          const isSelected = value.profile === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => selectProfile(key)}
              className={cn(
                "relative flex flex-col gap-0.5 rounded-md px-4 py-3 text-left transition-all duration-200",
                "active:scale-[0.98]",
                isSelected
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted hover:bg-muted/80 hover:shadow-sm",
              )}
            >
              <span className="text-[13px] font-medium">{t(key)}</span>
              {key !== "custom" && (
                <span
                  className={cn(
                    "font-mono text-xs",
                    isSelected ? "text-background/60" : "text-muted-foreground",
                  )}
                >
                  {HOUSEHOLD_PROFILES[key].toLocaleString()} kWh
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-md bg-muted px-5 py-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-muted-foreground">
            {value.profile === "custom" ? t("consumption") : t("estimated")}
          </span>
          <span className="font-mono text-2xl font-medium tracking-tight">
            {value.consumption.toLocaleString()}
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              kWh
            </span>
          </span>
        </div>
        {value.profile === "custom" && (
          <div className="mt-4 space-y-2">
            <Slider
              min={500}
              max={15000}
              step={50}
              value={[value.consumption]}
              onValueChange={setConsumption}
            />
            <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>500</span>
              <span>15.000</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
