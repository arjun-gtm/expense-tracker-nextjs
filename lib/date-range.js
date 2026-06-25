// Preset date-range options for filtering expenses.
export const RANGE_PRESETS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom" },
];

function toISODate(date) {
  // Local YYYY-MM-DD (avoids timezone shifting from toISOString)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Resolve a preset (and optional custom dates) into { from, to } ISO strings.
 * Returns empty strings when no bound applies.
 */
export function resolveRange(preset, customFrom = "", customTo = "") {
  const now = new Date();

  switch (preset) {
    case "today": {
      const today = toISODate(now);
      return { from: today, to: today };
    }
    case "week": {
      // Week starts on Monday
      const day = now.getDay(); // 0 = Sun ... 6 = Sat
      const diffToMonday = (day + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diffToMonday);
      return { from: toISODate(monday), to: toISODate(now) };
    }
    case "month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toISODate(first), to: toISODate(now) };
    }
    case "custom": {
      return { from: customFrom || "", to: customTo || "" };
    }
    case "all":
    default:
      return { from: "", to: "" };
  }
}
