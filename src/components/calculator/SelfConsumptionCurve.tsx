"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import type { SimulationInput } from "@/lib/simulation/types";
import { simulateYear } from "@/lib/simulation/engine";
import { createDefaultBatteryConfig } from "@/lib/simulation/constants";

interface SelfConsumptionCurveProps {
  input: SimulationInput;
  selectedSizes: number[];
}

const CURVE_SIZES = [0, 1, 2, 3, 5, 7, 10, 13.5, 15, 20, 25, 30];

export function SelfConsumptionCurve({
  input,
  selectedSizes,
}: SelfConsumptionCurveProps) {
  const t = useTranslations("calculator.charts");

  const data = useMemo(() => {
    return CURVE_SIZES.map((size) => {
      if (size === 0) {
        const baseline = simulateYear(
          input,
          { sizeKwh: 0, depthOfDischarge: 1, maxChargeRateKw: 0, maxDischargeRateKw: 0, roundTripEfficiency: 1, ratedCycles: 1, endOfLifeDegradation: 1 },
          0,
        );
        return {
          size,
          selfConsumption: Math.round(baseline.selfConsumptionRatio * 1000) / 10,
          isSelected: false,
        };
      }
      const bat = createDefaultBatteryConfig(size);
      const effective = size * bat.depthOfDischarge;
      const result = simulateYear(input, bat, effective);
      return {
        size,
        selfConsumption: Math.round(result.selfConsumptionRatio * 1000) / 10,
        isSelected: selectedSizes.includes(size),
      };
    });
  }, [input, selectedSizes]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {t("selfConsumptionCurve")}
      </h3>
      <div style={{ width: "100%", minWidth: 0, height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.4}
            />
            <XAxis
              dataKey="size"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              unit=" kWh"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "0.375rem",
                fontSize: 12,
                color: "var(--foreground)",
              }}
              formatter={(value) => [`${Number(value)}%`]}
              labelFormatter={(label) => `${label} kWh`}
            />
            <Area
              dataKey="selfConsumption"
              name={t("selfConsumptionCurve")}
              type="monotone"
              fill="#d97706"
              fillOpacity={0.15}
              stroke="#d97706"
              strokeWidth={2}
            />
            {data
              .filter((d) => d.isSelected)
              .map((d) => (
                <ReferenceDot
                  key={d.size}
                  x={d.size}
                  y={d.selfConsumption}
                  r={5}
                  fill="#d97706"
                  stroke="var(--background)"
                  strokeWidth={2}
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
