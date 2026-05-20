"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Area,
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

interface DailyProfileChartProps {
  results: ComparisonResult[];
  selectedMonth?: number;
}

export function DailyProfileChart({
  results,
  selectedMonth = 5,
}: DailyProfileChartProps) {
  const t = useTranslations("calculator.charts");
  const [month, setMonth] = useState(selectedMonth);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => t(`months.${i}`)),
    [t],
  );

  const data = useMemo(() => {
    const firstResult = results[0];
    if (!firstResult?.yearResults[0]) return [];

    const monthlyData = firstResult.yearResults[0].monthlyBreakdown[month];
    if (!monthlyData?.hourlyData) return [];

    return monthlyData.hourlyData.map((point) => ({
      hour: `${point.hour.toString().padStart(2, "0")}:00`,
      solar: Math.round(point.solarProduction * 1000) / 1000,
      consumption: Math.round(point.consumption * 1000) / 1000,
      soc: Math.round(point.batterySoc * 100) / 100,
    }));
  }, [results, month]);

  if (data.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {t("dailyProfile")}
        </h3>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {t("selectMonth")}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded border border-border bg-muted px-2 py-1 text-xs text-foreground"
          >
            {months.map((name, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ width: "100%", minWidth: 0, height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.6}
            />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              interval={3}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}`}
              unit=" kWh"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "0.375rem",
                fontSize: 12,
                color: "var(--foreground)",
              }}
              formatter={(value) => [`${Number(value)} kWh`]}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4, color: "var(--muted-foreground)" }} />
            <Area
              dataKey="solar"
              name={t("solarProduction")}
              type="monotone"
              fill="#d97706"
              fillOpacity={0.12}
              stroke="#d97706"
              strokeWidth={1.5}
            />
            <Area
              dataKey="consumption"
              name={t("consumption")}
              type="monotone"
              fill="#2563eb"
              fillOpacity={0.08}
              stroke="#2563eb"
              strokeWidth={1.5}
            />
            <Line
              dataKey="soc"
              name={t("batterySoc")}
              type="monotone"
              stroke="#16a34a"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
