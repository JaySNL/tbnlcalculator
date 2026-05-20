"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FinancialConfig as FinancialConfigType } from "@/lib/simulation/types";

interface FinancialConfigProps {
  value: FinancialConfigType;
  onChange: (v: FinancialConfigType) => void;
}

export function FinancialConfig({ value, onChange }: FinancialConfigProps) {
  const t = useTranslations("calculator.financial");

  function update(partial: Partial<FinancialConfigType>) {
    onChange({ ...value, ...partial });
  }

  function handleSlider(fn: (n: number) => void) {
    return (v: number | readonly number[]) => {
      fn(Array.isArray(v) ? v[0] : v);
    };
  }

  const priceIncreasePercent = Math.round(value.annualPriceIncrease * 100);

  return (
    <div className="space-y-5">
      {/* Price inputs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 rounded-lg border border-border p-4">
          <Label className="text-sm text-muted-foreground">
            {t("importPrice")}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">&euro;</span>
            <Input
              type="number"
              min={0.01}
              max={1}
              step={0.01}
              value={value.importPriceEur}
              onChange={(e) =>
                update({ importPriceEur: parseFloat(e.target.value) || 0 })
              }
              className="font-medium"
            />
            <span className="text-xs text-muted-foreground">/kWh</span>
          </div>
        </div>

        <div className="space-y-1.5 rounded-lg border border-border p-4">
          <Label className="text-sm text-muted-foreground">
            {t("exportPrice")}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">&euro;</span>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={value.exportPriceEur}
              onChange={(e) =>
                update({ exportPriceEur: parseFloat(e.target.value) || 0 })
              }
              className="font-medium"
            />
            <span className="text-xs text-muted-foreground">/kWh</span>
          </div>
        </div>
      </div>

      {/* Salderingsregeling */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm font-medium">{t("saldering")}</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {value.saldering ? t("salderingOn") : t("salderingOff")}
            </p>
          </div>
          <Switch
            checked={value.saldering}
            onCheckedChange={(checked: boolean) =>
              update({ saldering: checked })
            }
          />
        </div>
      </div>

      {/* Battery cost */}
      <div className="space-y-1.5 rounded-lg border border-border p-4">
        <Label className="text-sm text-muted-foreground">
          {t("batteryPrice")}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">&euro;</span>
          <Input
            type="number"
            min={100}
            max={2000}
            step={10}
            value={value.batteryCostPerKwh}
            onChange={(e) =>
              update({ batteryCostPerKwh: parseInt(e.target.value, 10) || 0 })
            }
            className="font-medium"
          />
          <span className="text-xs text-muted-foreground">/kWh</span>
        </div>
      </div>

      {/* Price increase */}
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            {t("priceIncrease")}
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {priceIncreasePercent}%
          </span>
        </div>
        <Slider
          min={0}
          max={5}
          step={0.5}
          value={[priceIncreasePercent]}
          onValueChange={handleSlider((n) =>
            update({ annualPriceIncrease: n / 100 }),
          )}
        />
      </div>

      {/* Timeframe */}
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            {t("timeframe")}
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {value.timeframeYears}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {t("timeframe").toLowerCase().includes("jaar") ? "jaar" : "years"}
            </span>
          </span>
        </div>
        <Slider
          min={5}
          max={25}
          step={1}
          value={[value.timeframeYears]}
          onValueChange={handleSlider((n) => update({ timeframeYears: n }))}
        />
      </div>
    </div>
  );
}
