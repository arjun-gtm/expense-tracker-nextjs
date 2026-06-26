"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  Wallet,
  Receipt,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

import { getCategoryMeta } from "@/lib/categories";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import BudgetTracker from "./BudgetTracker";
import ExpenseTrendChart from "./ExpenseTrendChart";
import CategoryPieChart from "./CategoryPieChart";
import IncomeVsExpenseChart from "./IncomeVsExpenseChart";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Dashboard({ expenses, budget, incomes = [] }) {
  const stats = useMemo(() => {
    const count = expenses.length;
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const average = count > 0 ? total / count : 0;

    // This month total
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const thisMonth = expenses.reduce((sum, e) => {
      const t = new Date(e.date).getTime();
      return t >= monthStart ? sum + e.amount : sum;
    }, 0);

    // Last 7 days total
    const weekAgo = startOfDay(now).getTime() - 6 * 24 * 60 * 60 * 1000;
    const last7 = expenses.reduce((sum, e) => {
      const t = new Date(e.date).getTime();
      return t >= weekAgo ? sum + e.amount : sum;
    }, 0);

    // Category breakdown
    const byCategory = {};
    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    }
    const categories = Object.entries(byCategory)
      .map(([category, value]) => ({
        category,
        value,
        pct: total > 0 ? (value / total) * 100 : 0,
        ...getCategoryMeta(category),
      }))
      .sort((a, b) => b.value - a.value);

    // Recent expenses (newest first, top 5)
    const recent = [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Largest single expense
    const largest = expenses.reduce(
      (max, e) => (e.amount > (max?.amount ?? 0) ? e : max),
      null
    );

    return {
      count,
      total,
      average,
      thisMonth,
      last7,
      categories,
      recent,
      largest,
      topCategory: categories[0] ?? null,
    };
  }, [expenses]);

  const statCards = [
    {
      label: "Total Spent",
      value: formatCurrency(stats.total),
      icon: Wallet,
      accent: "text-emerald-500",
    },
    {
      label: "This Month",
      value: formatCurrency(stats.thisMonth),
      icon: CalendarDays,
      accent: "text-blue-500",
    },
    {
      label: "Last 7 Days",
      value: formatCurrency(stats.last7),
      icon: TrendingUp,
      accent: "text-purple-500",
    },
    {
      label: "Transactions",
      value: String(stats.count),
      icon: Receipt,
      accent: "text-amber-500",
    },
  ];

  if (stats.count === 0) {
    return (
      <div className="flex flex-col gap-6">
        <BudgetTracker budget={budget} spent={stats.thisMonth} />
        <IncomeVsExpenseChart expenses={expenses} incomes={incomes} />
        <Card className="items-center gap-3 p-12 text-center">
          <Wallet className="size-10 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">No data yet</p>
            <p className="text-sm text-muted-foreground">
              Add some expenses to see your dashboard come to life.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item} whileHover={{ y: -3 }}>
              <Card className="gap-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </span>
                  <Icon className={`size-4 ${stat.accent}`} />
                </div>
                <span className="truncate text-xl font-bold text-foreground">
                  {stat.value}
                </span>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Monthly budget */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <BudgetTracker budget={budget} spent={stats.thisMonth} />
      </motion.div>

      {/* Expense trend over time */}
      <ExpenseTrendChart expenses={expenses} />

      {/* Income vs expense comparison */}
      <IncomeVsExpenseChart expenses={expenses} incomes={incomes} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category breakdown pie chart */}
        <CategoryPieChart expenses={expenses} />

        {/* Recent activity + highlights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="flex flex-col gap-6"
        >
          {/* Highlights */}
          <Card className="gap-4 p-5">
            <h3 className="text-sm font-semibold text-foreground">Highlights</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">
                  Avg. per expense
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(stats.average)}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">
                  Top category
                </span>
                <span className="flex items-center gap-1.5 text-lg font-semibold text-foreground">
                  {stats.topCategory?.category ?? "—"}
                </span>
              </div>
              {stats.largest && (
                <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">
                    Largest expense
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-foreground">
                      {stats.largest.title}
                    </span>
                    <span className="shrink-0 font-semibold text-foreground">
                      {formatCurrency(stats.largest.amount)}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Recent activity */}
          <Card className="gap-4 p-5">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Recent Activity
              </h3>
            </div>
            <ul className="flex flex-col divide-y divide-border/60">
              {stats.recent.map((e) => {
                const meta = getCategoryMeta(e.category);
                const Icon = meta.icon;
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${meta.color}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {e.title}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="font-normal">
                          {e.category}
                        </Badge>
                        {formatDate(e.date)}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(e.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
