"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Scale, Plus, Loader2, Check, X } from "lucide-react";

import { createIncome } from "../actions";
import { formatCurrency } from "@/lib/currency";
import { Card } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";

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

const NUM_MONTHS = 6;
const initialState = { success: false, errors: {}, message: "" };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const income = payload.find((p) => p.dataKey === "income")?.value ?? 0;
  const expense = payload.find((p) => p.dataKey === "expense")?.value ?? 0;
  const net = income - expense;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <p className="text-emerald-500">Income: {formatCurrency(income)}</p>
      <p className="text-red-500">Expense: {formatCurrency(expense)}</p>
      <p
        className={`mt-1 border-t border-border/60 pt-1 font-medium ${
          net >= 0 ? "text-emerald-500" : "text-red-500"
        }`}
      >
        Net: {formatCurrency(net)}
      </p>
    </div>
  );
}

export default function IncomeVsExpenseChart({ expenses, incomes }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isSaving] = useActionState(
    createIncome,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Income added.");
      setShowForm(false);
    } else if (state.message && Object.keys(state.errors ?? {}).length === 0) {
      toast.error(state.message);
    }
  }, [state]);

  const { data, totalIncome, totalExpense } = useMemo(() => {
    const now = new Date();
    // Build the last NUM_MONTHS month buckets (oldest -> newest)
    const buckets = [];
    const index = new Map();
    for (let i = NUM_MONTHS - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = {
        key,
        label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
        income: 0,
        expense: 0,
      };
      index.set(key, bucket);
      buckets.push(bucket);
    }

    const bucketFor = (date) => {
      const d = new Date(date);
      return index.get(`${d.getFullYear()}-${d.getMonth()}`);
    };

    for (const e of expenses) {
      const b = bucketFor(e.date);
      if (b) b.expense += e.amount;
    }
    for (const inc of incomes) {
      const b = bucketFor(inc.date);
      if (b) b.income += inc.amount;
    }

    const totalIncome = buckets.reduce((s, b) => s + b.income, 0);
    const totalExpense = buckets.reduce((s, b) => s + b.expense, 0);
    return { data: buckets, totalIncome, totalExpense };
  }, [expenses, incomes]);

  const fieldErrors = state.errors ?? {};
  const net = totalIncome - totalExpense;
  const hasAny = totalIncome > 0 || totalExpense > 0;
  const today = new Date().toISOString().split("T")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Income vs Expense
            </h3>
            <span className="text-xs text-muted-foreground">
              · last {NUM_MONTHS} months
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant={showForm ? "outline" : "default"}
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? (
              <>
                <X className="size-4" />
                Close
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Add Income
              </>
            )}
          </Button>
        </div>

        {/* Add income form */}
        {showForm && (
          <motion.form
            action={formAction}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-col gap-3 rounded-lg bg-muted/40 p-3 sm:flex-row sm:items-end"
          >
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="income-source" className="text-xs">
                Source
              </Label>
              <Input
                id="income-source"
                name="source"
                type="text"
                required
                placeholder="e.g. Salary"
                aria-invalid={Boolean(fieldErrors.source)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="income-amount" className="text-xs">
                Amount
              </Label>
              <Input
                id="income-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                aria-invalid={Boolean(fieldErrors.amount)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="income-date" className="text-xs">
                Date
              </Label>
              <Input
                id="income-date"
                name="date"
                type="date"
                defaultValue={today}
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Save
            </Button>
          </motion.form>
        )}

        {/* Summary numbers */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Income</span>
            <span className="text-lg font-bold text-emerald-500">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Expense</span>
            <span className="text-lg font-bold text-red-500">
              {formatCurrency(totalExpense)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Net</span>
            <span
              className={`text-lg font-bold ${
                net >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {formatCurrency(net)}
            </span>
          </div>
        </div>

        {/* Bar chart */}
        {hasAny ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                barGap={4}
              >
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
                  cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                  animationDuration={700}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                  animationDuration={700}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-72 flex-col items-center justify-center gap-2 text-center">
            <Scale className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Add income to compare it against your expenses.
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
