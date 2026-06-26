"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import { Card } from "@/components/shadcn/card";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const RANGES = [
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
];

function dayKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        Spent:{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(payload[0].value)}
        </span>
      </p>
    </div>
  );
}

export default function ExpenseTrendChart({ expenses }) {
  const [days, setDays] = useState(30);

  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = today.getTime() - (days - 1) * 24 * 60 * 60 * 1000;

    // Bucket expense totals by day
    const totals = new Map();
    for (const e of expenses) {
      const k = dayKey(e.date);
      if (k >= start && k <= today.getTime()) {
        totals.set(k, (totals.get(k) || 0) + e.amount);
      }
    }

    // Build a continuous series so the line has no gaps
    const series = [];
    for (let i = 0; i < days; i++) {
      const t = start + i * 24 * 60 * 60 * 1000;
      const d = new Date(t);
      series.push({
        label: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
        amount: totals.get(t) || 0,
      });
    }
    return series;
  }, [expenses, days]);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.amount, 0),
    [data]
  );
  const hasSpending = total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LineChartIcon className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Expense Trend
            </h3>
          </div>

          {/* Range selector */}
          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
            {RANGES.map((r) => {
              const active = days === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setDays(r.value)}
                  data-active={active}
                  className="relative cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:text-foreground"
                >
                  {active && (
                    <motion.span
                      layoutId="trend-range-pill"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-foreground/10"
                    />
                  )}
                  <span className="relative z-10">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {hasSpending ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => formatCurrency(v).replace(".00", "")}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="url(#trendLine)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#a855f7" }}
                  isAnimationActive
                  animationDuration={700}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <LineChartIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No spending in the last {days} days.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
          <span className="text-muted-foreground">
            Total ({days} days)
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
