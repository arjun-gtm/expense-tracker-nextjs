"use client";

import { useMemo, useState } from "react";
import { resolveRange } from "@/lib/date-range";
import ExpenseForm from "./ExpenseForm";
import ExpenseFilter from "./ExpenseFilter";
import ExpenseList from "./ExpenseList";

// Owns the full expense dataset and applies date-range + search filtering
// entirely on the client, so switching filters/searching is instant and
// animates smoothly with no server round-trip or re-render flash.
export default function ExpensesView({ expenses }) {
  const [range, setRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const { from, to } = resolveRange(range, customFrom, customTo);

    let fromTime = null;
    let toTime = null;
    if (from) {
      const f = new Date(from);
      f.setHours(0, 0, 0, 0);
      fromTime = f.getTime();
    }
    if (to) {
      const t = new Date(to);
      t.setHours(23, 59, 59, 999);
      toTime = t.getTime();
    }

    const q = query.trim().toLowerCase();

    return expenses.filter((e) => {
      const time = new Date(e.date).getTime();
      if (fromTime !== null && time < fromTime) return false;
      if (toTime !== null && time > toTime) return false;

      if (q) {
        const haystack = `${e.title} ${e.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [expenses, range, customFrom, customTo, query]);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(320px,400px)_1fr]">
        <div className="flex flex-col gap-6 lg:sticky lg:top-8">
          <ExpenseForm />
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Expenses{" "}
            <span className="text-muted-foreground">({filtered.length})</span>
          </h2>

          <ExpenseFilter
            range={range}
            customFrom={customFrom}
            customTo={customTo}
            query={query}
            onRangeChange={setRange}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
            onQueryChange={setQuery}
          />

          <ExpenseList
            expenses={filtered}
            hasAny={expenses.length > 0}
            isSearching={query.trim().length > 0 || range !== "all"}
          />
        </section>
    </div>
  );
}
