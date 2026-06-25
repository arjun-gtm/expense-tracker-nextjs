"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { PlusCircle, Loader2 } from "lucide-react";

import { createExpense } from "../actions";
import { CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";

const initialState = { success: false, errors: {}, message: "" };

export default function ExpenseForm() {
  const formRef = useRef(null);
  const [state, formAction, isPending] = useActionState(
    createExpense,
    initialState
  );

  // React to the result of the server action
  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Expense added.");
      formRef.current?.reset();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const today = new Date().toISOString().split("T")[0];
  const fieldErrors = state.errors ?? {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PlusCircle className="size-5 text-primary" />
            Add Expense
          </CardTitle>
          <CardDescription>
            Record a new expense and keep your budget in check.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Groceries"
                  aria-invalid={Boolean(fieldErrors.title)}
                />
                {fieldErrors.title && (
                  <p className="text-xs text-destructive">{fieldErrors.title}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  aria-invalid={Boolean(fieldErrors.amount)}
                />
                {fieldErrors.amount && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.amount}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="Other">
                  <SelectTrigger id="category" className="w-full">
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
                {fieldErrors.category && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.category}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={today}
                  aria-invalid={Boolean(fieldErrors.date)}
                />
                {fieldErrors.date && (
                  <p className="text-xs text-destructive">{fieldErrors.date}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isPending} className="self-start">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle className="size-4" />
                  Add Expense
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
