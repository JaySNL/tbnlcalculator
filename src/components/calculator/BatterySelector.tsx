"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BATTERY_SIZE_OPTIONS } from "@/lib/simulation/constants";

interface BatterySelectorProps {
  value: number[];
  onChange: (sizes: number[]) => void;
}

export function BatterySelector({ value, onChange }: BatterySelectorProps) {
  const t = useTranslations("calculator.battery");
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  function toggleSize(size: number) {
    if (value.includes(size)) {
      onChange(value.filter((s) => s !== size));
    } else {
      if (value.length >= 4) return;
      onChange([...value, size].sort((a, b) => a - b));
    }
  }

  function addCustomSize() {
    const parsed = parseFloat(customInput.replace(",", "."));
    if (isNaN(parsed) || parsed < 1 || parsed > 50) return;
    const rounded = Math.round(parsed * 2) / 2;
    if (value.includes(rounded) || value.length >= 4) return;
    onChange([...value, rounded].sort((a, b) => a - b));
    setCustomInput("");
    setShowCustom(false);
  }

  const tooFew = value.length < 2;
  const atMax = value.length >= 4;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {BATTERY_SIZE_OPTIONS.map((size) => {
          const isSelected = value.includes(size);
          const disabled = !isSelected && atMax;
          return (
            <button
              key={size}
              type="button"
              disabled={disabled}
              onClick={() => toggleSize(size)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-md py-3.5 transition-all duration-200 active:scale-[0.98]",
                disabled && "cursor-not-allowed opacity-25",
                isSelected
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80",
              )}
            >
              <span className="font-mono text-lg font-medium tabular-nums">
                {size}
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  isSelected ? "text-brand-foreground/50" : "text-muted-foreground",
                )}
              >
                kWh
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom sizes not in presets */}
      {value.some(
        (s) =>
          !BATTERY_SIZE_OPTIONS.includes(
            s as (typeof BATTERY_SIZE_OPTIONS)[number],
          ),
      ) && (
        <div className="flex flex-wrap gap-2">
          {value
            .filter(
              (s) =>
                !BATTERY_SIZE_OPTIONS.includes(
                  s as (typeof BATTERY_SIZE_OPTIONS)[number],
                ),
            )
            .map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 font-mono text-sm"
              >
                {size} kWh
                <button
                  type="button"
                  onClick={() => toggleSize(size)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Remove ${size} kWh`}
                >
                  &times;
                </button>
              </span>
            ))}
        </div>
      )}

      {/* Add custom */}
      <div>
        {!showCustom ? (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            disabled={atMax}
            className={cn(
              "text-[13px] text-muted-foreground transition-colors hover:text-foreground",
              atMax && "cursor-not-allowed opacity-25",
            )}
          >
            + {t("customSize")}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={50}
              step={0.5}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomSize()}
              placeholder="kWh"
              className="w-24 font-mono"
              autoFocus
            />
            <Button size="sm" onClick={addCustomSize} className="active:scale-[0.98]">
              +
            </Button>
            <button
              type="button"
              onClick={() => { setShowCustom(false); setCustomInput(""); }}
              className="px-2 text-muted-foreground hover:text-foreground"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {tooFew && (
        <p className="text-[13px] text-destructive">{t("minSelection")}</p>
      )}
    </div>
  );
}
