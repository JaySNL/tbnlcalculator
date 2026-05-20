"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import type { ComparisonResult } from "@/lib/simulation/types";

interface EnergyFlowChartProps {
  results: ComparisonResult[];
}

export function EnergyFlowChart({ results }: EnergyFlowChartProps) {
  const t = useTranslations("calculator.charts");

  const data = useMemo(() => {
    const firstResult = results[0];
    if (!firstResult?.yearResults[0]) return [];

    return firstResult.yearResults[0].monthlyBreakdown.map((m) => ({
      month: t(`months.${m.month}`),
      selfConsumed: Math.round(m.selfConsumedDirect),
      batteryDischarge: Math.round(m.batteryDischarged),
      gridImport: Math.round(m.gridImport),
      gridExport: -Math.round(m.gridExport),
      solarProduction: Math.round(m.solarProduction),
    }));
  }, [results, t]);

  if (data.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {t("energyFlow")}
      </h3>
      <div style={{ width: "100%", minWidth: 0, height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.6}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v} kWh`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.375rem",
                fontSize: 12,
              }}
              formatter={(value) => [`${Number(value)} kWh`]}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
            <Bar
              dataKey="selfConsumed"
              name={t("selfConsumed")}
              stackId="a"
              fill="#16a34a"
            />
            <Bar
              dataKey="batteryDischarge"
              name={t("batteryDischarge")}
              stackId="a"
              fill="#0d9488"
            />
            <Bar
              dataKey="gridImport"
              name={t("gridImport")}
              stackId="a"
              fill="#dc2626"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="gridExport"
              name={t("gridExport")}
              stackId="b"
              fill="#ea580c"
              radius={[0, 0, 2, 2]}
            />
            <Line
              dataKey="solarProduction"
              name={t("solarProduction")}
              type="monotone"
              stroke="#d97706"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "#d97706" }}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
