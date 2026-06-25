"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

import { deleteExpense, updateExpense } from "../actions";
import { CATEGORIES, getCategoryMeta } from "@/lib/categories";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Badge } from "@/components/shadcn/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn/alert-dialog";

const initialState = { success: false, errors: {}, message: "" };

export default function ExpenseItem({ expense }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const updateAction = updateExpense.bind(null, expense.id);
  const [state, formAction, isUpdating] = useActionState(
    updateAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Expense updated.");
      setIsEditing(false);
    } else if (state.message && Object.keys(state.errors ?? {}).length === 0) {
      toast.error(state.message);
    }
  }, [state]);

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteExpense(expense.id);
      if (result?.success) {
        toast.success(result.message || "Expense deleted.");
      } else {
        toast.error(result?.message || "Failed to delete.");
      }
    });
  }

  const dateValue = new Date(expense.date).toISOString().split("T")[0];
  const fieldErrors = state.errors ?? {};
  const meta = getCategoryMeta(expense.category);
  const CategoryIcon = meta.icon;

  if (isEditing) {
    return (
      <motion.li
        layout
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
      >
        <form action={formAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <Input
                name="title"
                type="text"
                required
                maxLength={100}
                defaultValue={expense.title}
                aria-invalid={Boolean(fieldErrors.title)}
              />
              {fieldErrors.title && (
                <p className="text-xs text-destructive">{fieldErrors.title}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={expense.amount}
                aria-invalid={Boolean(fieldErrors.amount)}
              />
              {fieldErrors.amount && (
                <p className="text-xs text-destructive">{fieldErrors.amount}</p>
              )}
            </div>
            <Select name="category" defaultValue={expense.category}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="date"
              type="date"
              defaultValue={dateValue}
              className="sm:col-span-2"
              aria-invalid={Boolean(fieldErrors.date)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isUpdating}
            >
              <X className="size-4" />
              Cancel
            </Button>
          </div>
        </form>
      </motion.li>
    );
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="flex items-center justify-between gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${meta.color}`}
          aria-hidden
        >
          <CategoryIcon className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">{expense.title}</span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="font-normal">
              {expense.category}
            </Badge>
            {formatDate(expense.date)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="mr-1 text-lg font-semibold tabular-nums text-foreground">
          {formatCurrency(expense.amount)}
        </span>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => setIsEditing(true)}
          disabled={isDeleting}
          aria-label="Edit expense"
        >
          <Pencil className="size-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={isDeleting}
              aria-label="Delete expense"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{" "}
                <span className="font-medium text-foreground">
                  {expense.title}
                </span>{" "}
                ({formatCurrency(expense.amount)}). This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.li>
  );
}
