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

const ORIENTATION_OPTIONS: { key: Orientation }[] = [
  { key: "south" },
  { key: "southEastWest" },
  { key: "eastWest" },
  { key: "north" },
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

  function handleSlider(fn: (n: number) => void) {
    return (v: number | readonly number[]) => {
      fn(Array.isArray(v) ? v[0] : v);
    };
  }

  const annualYield = computeAnnualYield(value);
  const systemKwp = ((value.panelCount * value.panelWattage) / 1000).toFixed(1);
  const shadingPercent = Math.round(value.shadingFactor * 100);

  return (
    <div className="space-y-6">
      {/* Panel count */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-muted-foreground">{t("panels")}</span>
          <div>
            <span className="font-mono text-2xl font-medium tracking-tight">
              {value.panelCount}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              {systemKwp} kWp
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
        <span className="text-[13px] text-muted-foreground">{t("wattage")}</span>
        <div className="grid grid-cols-3 gap-2">
          {WATTAGE_OPTIONS.map((wp) => {
            const isSelected = value.panelWattage === wp;
            return (
              <button
                key={wp}
                type="button"
                onClick={() => update({ panelWattage: wp })}
                className={cn(
                  "rounded-md py-2.5 text-center font-mono text-sm transition-all duration-200 active:scale-[0.98]",
                  isSelected
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "bg-muted hover:bg-muted/80",
                )}
              >
                {wp} Wp
              </button>
            );
          })}
        </div>
      </div>

      {/* Orientation */}
      <div className="space-y-2">
        <span className="text-[13px] text-muted-foreground">{t("orientation")}</span>
        <div className="grid grid-cols-4 gap-2">
          {ORIENTATION_OPTIONS.map(({ key }) => {
            const isSelected = value.orientation === key;
            const factor = Math.round(ORIENTATION_FACTORS[key] * 100);
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ orientation: key })}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md py-2.5 transition-all duration-200 active:scale-[0.98]",
                  isSelected
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "bg-muted hover:bg-muted/80",
                )}
              >
                <span className="text-[13px] font-medium">{t(key)}</span>
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    isSelected ? "text-brand-foreground/50" : "text-muted-foreground",
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
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-muted-foreground">{t("shading")}</span>
          <span className="font-mono text-lg font-medium">{shadingPercent}%</span>
        </div>
        <Slider
          min={0}
          max={30}
          step={1}
          value={[shadingPercent]}
          onValueChange={handleSlider((n) => update({ shadingFactor: n / 100 }))}
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{t("noShading")}</span>
          <span>{t("heavyShading")}</span>
        </div>
      </div>

      {/* Yield summary */}
      <div className="flex items-baseline justify-between rounded-md bg-brand-muted px-5 py-3.5">
        <span className="text-[13px] font-medium text-brand">{t("annualYield")}</span>
        <span className="font-mono text-2xl font-medium tracking-tight text-foreground">
          {annualYield.toLocaleString()}
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
            kWh
          </span>
        </span>
      </div>
    </div>
  );
}
