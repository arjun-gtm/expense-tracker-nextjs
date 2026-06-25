"use client";

import { motion } from "motion/react";
import { CalendarDays, X, Search } from "lucide-react";

import { RANGE_PRESETS, resolveRange } from "@/lib/date-range";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";

export default function ExpenseFilter({
  range,
  customFrom,
  customTo,
  query,
  onRangeChange,
  onCustomFromChange,
  onCustomToChange,
  onQueryChange,
}) {
  function handlePreset(preset) {
    if (preset === "custom") {
      // Seed custom inputs with the current month so the fields aren't empty
      const seeded = resolveRange("month");
      if (!customFrom) onCustomFromChange(seeded.from);
      if (!customTo) onCustomToChange(seeded.to);
    }
    onRangeChange(preset);
  }

  const isFiltered = range !== "all" || query.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-2 backdrop-blur supports-[backdrop-filter]:bg-card/50"
    >
      {/* Search box */}
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by title or category..."
          className="w-full pl-9"
          aria-label="Search expenses"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Toolbar row: label + segmented presets + clear */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex shrink-0 items-center gap-1.5 px-1.5 text-sm font-medium text-muted-foreground">
          <CalendarDays className="size-4" />
          <span className="hidden sm:inline">Showing</span>
        </span>

        {/* Segmented control of presets */}
        <div className="flex flex-1 flex-wrap items-center gap-1 rounded-lg bg-muted/60 p-1">
          {RANGE_PRESETS.map((preset) => {
            const active = range === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePreset(preset.value)}
                className="relative cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:text-foreground"
                data-active={active}
              >
                {active && (
                  <motion.span
                    layoutId="filter-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-foreground/10"
                  />
                )}
                <span className="relative z-10">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {isFiltered && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              onRangeChange("all");
              onQueryChange("");
            }}
            className="h-8 shrink-0 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Custom date inputs reveal inline when "Custom" is active */}
      {range === "custom" && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 px-1 pb-1 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="from" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="from"
              type="date"
              value={customFrom}
              max={customTo || undefined}
              onChange={(e) => onCustomFromChange(e.target.value)}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="to" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="to"
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(e) => onCustomToChange(e.target.value)}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
