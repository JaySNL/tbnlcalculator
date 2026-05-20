"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import {
  ANNUAL_YIELD_KWH_PER_KWP,
  ORIENTATION_FACTORS,
} from "@/lib/simulation/constants";
import type { SolarConfig as SolarConfigType, Orientation } from "@/lib/simulation/types";

interface SolarConfigProps {
  value: SolarConfigType;
  onChange: (v: SolarConfigType) => void;
}

const WATTAGE_OPTIONS = [350, 400, 450];

const ORIENTATION_OPTIONS: { key: Orientation; label: string }[] = [
  { key: "south", label: "S" },
  { key: "southEastWest", label: "SE/SW" },
  { key: "eastWest", label: "E/W" },
  { key: "north", label: "N" },
];

function computeAnnualYield(config: SolarConfigType): number {
  const kwp = (config.panelCount * config.panelWattage) / 1000;
  const orientationFactor = ORIENTATION_FACTORS[config.orientation];
  const shadingMultiplier = 1 - config.shadingFactor;
  return Math.round(kwp * ANNUAL_YIELD_KWH_PER_KWP * orientationFactor * shadingMultiplier);
}

export function SolarConfig({ value, onChange }: SolarConfigProps) {
  const t = useTranslations("calculator.solar");

  function update(partial: Partial<SolarConfigType>) {
    onChange({ ...value, ...partial });
  }

  function handleSlider(
    fn: (n: number) => void,
  ) {
    return (v: number | readonly number[]) => {
      fn(Array.isArray(v) ? v[0] : v);
    };
  }

  const annualYield = computeAnnualYield(value);
  const systemKwp = ((value.panelCount * value.panelWattage) / 1000).toFixed(1);
  const shadingPercent = Math.round(value.shadingFactor * 100);

  return (
    <div className="space-y-5">
      {/* Panel count */}
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">{t("panels")}</span>
          <div className="text-right">
            <span className="text-2xl font-semibold tabular-nums">
              {value.panelCount}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              ({systemKwp} kWp)
            </span>
          </div>
        </div>
        <Slider
          min={1}
          max={30}
          step={1}
          value={[value.panelCount]}
          onValueChange={handleSlider((n) => update({ panelCount: n }))}
        />
      </div>

      {/* Wattage */}
      <div className="space-y-2">
        <span className="text-sm text-muted-foreground">{t("wattage")}</span>
        <div className="grid grid-cols-3 gap-2">
          {WATTAGE_OPTIONS.map((wp) => {
            const isSelected = value.panelWattage === wp;
            return (
              <button
                key={wp}
                type="button"
                onClick={() => update({ panelWattage: wp })}
                className={cn(
                  "rounded-lg border py-2.5 text-center transition-colors",
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/40",
                )}
              >
                <span className="text-sm font-medium">{wp} Wp</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orientation */}
      <div className="space-y-2">
        <span className="text-sm text-muted-foreground">{t("orientation")}</span>
        <div className="grid grid-cols-4 gap-2">
          {ORIENTATION_OPTIONS.map(({ key, label }) => {
            const isSelected = value.orientation === key;
            const factor = Math.round(ORIENTATION_FACTORS[key] * 100);
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ orientation: key })}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg border py-2.5 transition-colors",
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/40",
                )}
              >
                <span className="text-xs font-medium">{t(key)}</span>
                <span
                  className={cn(
                    "text-[10px]",
                    isSelected ? "text-background/60" : "text-muted-foreground",
                  )}
                >
                  {factor}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shading */}
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">{t("shading")}</span>
          <span className="text-lg font-semibold tabular-nums">
            {shadingPercent}%
          </span>
        </div>
        <Slider
          min={0}
          max={30}
          step={1}
          value={[shadingPercent]}
          onValueChange={handleSlider((n) =>
            update({ shadingFactor: n / 100 }),
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("noShading")}</span>
          <span>{t("heavyShading")}</span>
        </div>
      </div>

      {/* Annual yield */}
      <div className="flex items-baseline justify-between rounded-lg bg-muted px-4 py-3">
        <span className="text-sm font-medium">{t("annualYield")}</span>
        <span className="text-2xl font-semibold tabular-nums">
          {annualYield.toLocaleString()}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            kWh
          </span>
        </span>
      </div>
    </div>
  );
}
