"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { FinancialConfig as FinancialConfigType, ContractType } from "@/lib/simulation/types";
import {
  getTotalImportPrice,
  DEFAULT_IMPORT_PRICE,
  FIXED_IMPORT_PRICE,
} from "@/lib/simulation/constants";

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

  function handleContractChange(contractType: ContractType) {
    const importPrice =
      contractType === "dynamic"
        ? { ...DEFAULT_IMPORT_PRICE }
        : { ...FIXED_IMPORT_PRICE };
    update({ contractType, importPrice });
  }

  const priceIncreasePercent = Math.round(value.annualPriceIncrease * 100);
  const allInImportPrice = getTotalImportPrice(value.importPrice);

  function handleAllInImportPriceChange(newTotal: number) {
    const currentTotal = getTotalImportPrice(value.importPrice);
    if (currentTotal === 0) return;
    const ratio = newTotal / currentTotal;
    update({
      importPrice: {
        energyPriceEur: Math.round(value.importPrice.energyPriceEur * ratio * 100) / 100,
        energyTaxEur: Math.round(value.importPrice.energyTaxEur * ratio * 100) / 100,
        networkCostEur: Math.round(value.importPrice.networkCostEur * ratio * 100) / 100,
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Contract type */}
      <div className="space-y-2">
        <span className="text-[13px] text-muted-foreground">{t("contractType")}</span>
        <div className="grid grid-cols-2 gap-2">
          {(["fixed", "dynamic"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleContractChange(type)}
              className={cn(
                "rounded-md py-2.5 text-center text-sm transition-all duration-200 active:scale-[0.98]",
                value.contractType === type
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80",
              )}
            >
              <span className="font-medium">{t(type)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <span className="text-[13px] text-muted-foreground">{t("importPrice")}</span>
          <div className="flex items-center gap-1.5 rounded-md bg-muted px-3 py-2">
            <span className="text-sm text-muted-foreground">&euro;</span>
            <Input
              type="number"
              min={0.01}
              max={1}
              step={0.01}
              value={Math.round(allInImportPrice * 100) / 100}
              onChange={(e) =>
                handleAllInImportPriceChange(parseFloat(e.target.value) || 0)
              }
              className="h-auto border-0 bg-transparent p-0 font-mono text-base shadow-none focus-visible:ring-0"
            />
            <span className="text-[11px] text-muted-foreground">/kWh</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-[13px] text-muted-foreground">{t("exportPrice")}</span>
          <div className="flex items-center gap-1.5 rounded-md bg-muted px-3 py-2">
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
              className="h-auto border-0 bg-transparent p-0 font-mono text-base shadow-none focus-visible:ring-0"
            />
            <span className="text-[11px] text-muted-foreground">/kWh</span>
          </div>
        </div>
      </div>

      {/* Salderingsregeling */}
      <div className="flex items-center justify-between gap-4 rounded-md bg-muted px-5 py-4">
        <div>
          <span className="text-[13px] font-medium">{t("saldering")}</span>
          <p
            className={cn(
              "mt-0.5 text-[12px]",
              value.saldering ? "text-brand" : "text-muted-foreground",
            )}
          >
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

      {/* Price increase */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-muted-foreground">
            {t("priceIncrease")}
          </span>
          <span className="font-mono text-lg font-medium">
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
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-muted-foreground">
            {t("timeframe")}
          </span>
          <span className="font-mono text-2xl font-medium tracking-tight">
            {value.timeframeYears}
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              jaar
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
