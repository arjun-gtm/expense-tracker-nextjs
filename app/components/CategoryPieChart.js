"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

import { getCategoryMeta } from "@/lib/categories";
import { formatCurrency } from "@/lib/currency";
import { Card } from "@/components/shadcn/card";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const slice = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: slice.bar }}
        />
        {slice.category}
      </p>
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground">
          {formatCurrency(slice.value)}
        </span>{" "}
        · {slice.pct.toFixed(0)}%
      </p>
    </div>
  );
}

export default function CategoryPieChart({ expenses }) {
  const { slices, total } = useMemo(() => {
    const byCategory = {};
    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    }
    const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
    const slices = Object.entries(byCategory)
      .map(([category, value]) => ({
        category,
        value,
        pct: total > 0 ? (value / total) * 100 : 0,
        bar: getCategoryMeta(category).bar,
        icon: getCategoryMeta(category).icon,
      }))
      .sort((a, b) => b.value - a.value);
    return { slices, total };
  }, [expenses]);

  const hasData = total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="gap-4 p-5">
        <div className="flex items-center gap-2">
          <PieChartIcon className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Category Breakdown
          </h3>
        </div>

        {hasData ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {/* Pie chart with total in the center */}
            <div className="relative h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="none"
                    animationDuration={700}
                  >
                    {slices.map((slice) => (
                      <Cell key={slice.category} fill={slice.bar} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Legend with amounts and percentages */}
            <ul className="flex w-full flex-1 flex-col gap-2">
              {slices.map((slice) => {
                const Icon = slice.icon;
                return (
                  <li
                    key={slice.category}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.bar }}
                    />
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-foreground">
                      {slice.category}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {slice.pct.toFixed(0)}%
                    </span>
                    <span className="w-24 text-right font-medium tabular-nums text-foreground">
                      {formatCurrency(slice.value)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <PieChartIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No spending to break down yet.
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
