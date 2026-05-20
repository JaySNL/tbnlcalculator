"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { ComparisonResult } from "@/lib/simulation/types";

interface PaybackChartProps {
  results: ComparisonResult[];
}

const LINE_COLORS = ["#d97706", "#2563eb", "#16a34a", "#7c3aed"];

export function PaybackChart({ results }: PaybackChartProps) {
  const t = useTranslations("calculator.charts");
  const tCommon = useTranslations("common");

  const { data, investments } = useMemo(() => {
    if (results.length === 0) return { data: [], investments: [] };

    const maxYears = Math.max(
      ...results.map((r) => r.financialResults.length),
    );

    const chartData = Array.from({ length: maxYears }, (_, i) => {
      const point: Record<string, number | string> = { year: i + 1 };
      results.forEach((r) => {
        const key = `${r.batteryConfig.sizeKwh}`;
        const fr = r.financialResults[i];
        point[key] = fr ? Math.round(fr.cumulativeSavings) : 0;
      });
      return point;
    });

    const investmentLines = results.map((r) => ({
      label: `${r.batteryConfig.sizeKwh} kWh`,
      value: Math.round(r.totalInvestment),
    }));

    return { data: chartData, investments: investmentLines };
  }, [results]);

  if (data.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {t("paybackTimeline")}
      </h3>
      <div style={{ width: "100%", minWidth: 0, height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.6}
            />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `€${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.375rem",
                fontSize: 12,
              }}
              formatter={(value) => [`€${Number(value)}`]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              formatter={(value: string) => `${value} kWh`}
            />
            {results.map((r, i) => (
              <Line
                key={r.batteryConfig.sizeKwh}
                dataKey={`${r.batteryConfig.sizeKwh}`}
                name={`${r.batteryConfig.sizeKwh}`}
                type="monotone"
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
            {investments.map((inv, i) => (
              <ReferenceLine
                key={`inv-${inv.label}`}
                y={inv.value}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
