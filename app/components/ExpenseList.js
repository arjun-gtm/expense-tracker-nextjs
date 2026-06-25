"use client";

import { AnimatePresence, motion } from "motion/react";
import { Inbox, SearchX } from "lucide-react";
import ExpenseItem from "./ExpenseItem";

export default function ExpenseList({ expenses, hasAny = true, isSearching }) {
  if (expenses.length === 0) {
    const noMatches = hasAny && isSearching;
    return (
      <motion.div
        key={noMatches ? "no-matches" : "empty"}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center"
      >
        {noMatches ? (
          <>
            <SearchX className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No expenses match your filters. Try adjusting the date range or
              search.
            </p>
          </>
        ) : (
          <>
            <Inbox className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No expenses yet. Add your first one above.
            </p>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {expenses.map((expense) => (
          <ExpenseItem key={expense.id} expense={expense} />
        ))}
      </AnimatePresence>
    </ul>
  );
}
