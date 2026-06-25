"use client";

import { useActionState, useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Wallet, Pencil, Check, X, Loader2, AlertTriangle } from "lucide-react";

import { setBudget, clearBudget } from "../actions";
import { useSetBudget } from "./ExpensesProvider";
import { formatCurrency } from "@/lib/currency";
import { monthLabel, currentMonthKey } from "@/lib/month";
import { Card } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";

const initialState = { success: false, message: "" };

export default function BudgetTracker({ budget, spent }) {
  const setBudgetValue = useSetBudget();
  const [isEditing, setIsEditing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [state, formAction, isSaving] = useActionState(
    setBudget,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      // Update shared client state locally so the UI reflects the new
      // budget instantly without a server-driven re-render.
      if (typeof state.amount === "number") {
        setBudgetValue(state.amount);
      }
      toast.success(state.message || "Budget updated.");
      setIsEditing(false);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, setBudgetValue]);

  async function handleClear() {
    setIsClearing(true);
    const result = await clearBudget();
    setIsClearing(false);
    if (result?.success) {
      setBudgetValue(null);
      toast.success(result.message || "Budget cleared.");
    } else {
      toast.error(result?.message || "Could not clear budget.");
    }
  }

  const hasBudget = budget !== null && budget !== undefined;
  const remaining = hasBudget ? budget - spent : 0;
  const usage = hasBudget && budget > 0 ? (spent / budget) * 100 : 0;
  const over = hasBudget && spent > budget;

  // Bar color shifts as usage climbs
  const barColor = over
    ? "#ef4444"
    : usage >= 80
      ? "#f59e0b"
      : "#10b981";

  const label = monthLabel(currentMonthKey());

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Monthly Budget
          </h3>
          <span className="text-xs text-muted-foreground">· {label}</span>
        </div>
        {hasBudget && !isEditing && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-7"
              aria-label="Edit budget"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-7 text-muted-foreground hover:text-destructive"
              aria-label="Clear budget"
              onClick={handleClear}
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <X className="size-3.5" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* No budget set yet, or editing -> show the form */}
      {!hasBudget || isEditing ? (
        <form action={formAction} className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {hasBudget
              ? "Update your spending limit for this month."
              : "Set a spending limit for this month to track your progress."}
          </p>
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label
                htmlFor="budget-amount"
                className="text-xs text-muted-foreground"
              >
                Budget amount
              </label>
              <Input
                id="budget-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                autoFocus
                defaultValue={hasBudget ? budget : ""}
                placeholder="e.g. 50000"
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
            {hasBudget && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Numbers row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Budget</span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(budget)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Spent</span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(spent)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                {over ? "Over by" : "Remaining"}
              </span>
              <span
                className={`text-lg font-bold ${
                  over ? "text-red-500" : "text-emerald-500"
                }`}
              >
                {formatCurrency(Math.abs(remaining))}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: barColor }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usage, 100)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span
                className={`flex items-center gap-1 font-medium ${
                  over
                    ? "text-red-500"
                    : usage >= 80
                      ? "text-amber-500"
                      : "text-muted-foreground"
                }`}
              >
                {over && <AlertTriangle className="size-3.5" />}
                {usage.toFixed(0)}% used
              </span>
              <span className="text-muted-foreground">
                {over
                  ? "Over budget"
                  : `${formatCurrency(remaining)} left`}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
