"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { currentMonthKey } from "@/lib/month";

const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Shopping",
  "Bills",
  "Other",
];

const MAX_TITLE_LENGTH = 100;
const MAX_AMOUNT = 1_000_000_000;

/**
 * Server-side validation. Returns a map of field -> error message.
 * An empty object means the input is valid.
 */
function validateExpenseInput({ title, amount, category, date }) {
  const errors = {};

  // Title
  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  // Amount
  if (amount === "" || amount === null || amount === undefined) {
    errors.amount = "Amount is required.";
  } else if (Number.isNaN(amount)) {
    errors.amount = "Amount must be a valid number.";
  } else if (amount <= 0) {
    errors.amount = "Amount must be greater than zero.";
  } else if (amount > MAX_AMOUNT) {
    errors.amount = "Amount is too large.";
  }

  // Category
  if (category && !CATEGORIES.includes(category)) {
    errors.category = "Invalid category selected.";
  }

  // Date
  if (date && Number.isNaN(new Date(date).getTime())) {
    errors.date = "Invalid date.";
  }

  return errors;
}

/**
 * Pull and normalize fields from a FormData object.
 */
function parseFormData(formData) {
  const rawAmount = formData.get("amount");
  return {
    title: formData.get("title")?.toString().trim() ?? "",
    amount: rawAmount === null || rawAmount === "" ? "" : parseFloat(rawAmount),
    category: formData.get("category")?.toString().trim() || "Other",
    date: formData.get("date")?.toString() || "",
  };
}

// READ: fetch all expenses, newest first, optionally filtered by a date range.
// `from` and `to` are ISO date strings (inclusive). Either may be omitted.
export async function getExpenses({ from, to } = {}) {
  const dateFilter = {};

  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) {
      fromDate.setHours(0, 0, 0, 0);
      dateFilter.gte = fromDate;
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      dateFilter.lte = toDate;
    }
  }

  const expenses = await prisma.expense.findMany({
    where:
      Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
    orderBy: { date: "desc" },
  });

  // Convert Decimal to plain number so it can cross the server/client boundary
  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));
}

// CREATE: add a new expense
export async function createExpense(prevState, formData) {
  const data = parseFormData(formData);
  const errors = validateExpenseInput(data);

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: "Please fix the errors below." };
  }

  try {
    await prisma.expense.create({
      data: {
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  } catch (err) {
    console.error("createExpense failed:", err);
    return {
      success: false,
      errors: {},
      message: "Could not save the expense. Please try again.",
    };
  }

  revalidatePath("/");
  return { success: true, errors: {}, message: "Expense added." };
}

// UPDATE: edit an existing expense
export async function updateExpense(id, prevState, formData) {
  if (!id) {
    return { success: false, errors: {}, message: "Expense id is required." };
  }

  const data = parseFormData(formData);
  const errors = validateExpenseInput(data);

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: "Please fix the errors below." };
  }

  try {
    await prisma.expense.update({
      where: { id },
      data: {
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  } catch (err) {
    console.error("updateExpense failed:", err);
    return {
      success: false,
      errors: {},
      message: "Could not update the expense. Please try again.",
    };
  }

  revalidatePath("/");
  return { success: true, errors: {}, message: "Expense updated." };
}

// DELETE: remove an expense
export async function deleteExpense(id) {
  if (!id) {
    return { success: false, message: "Expense id is required." };
  }

  try {
    await prisma.expense.delete({ where: { id } });
  } catch (err) {
    console.error("deleteExpense failed:", err);
    return {
      success: false,
      message: "Could not delete the expense. Please try again.",
    };
  }

  revalidatePath("/");
  return { success: true, message: "Expense deleted." };
}

// ---------------------------------------------------------------------------
// Monthly budget
// ---------------------------------------------------------------------------

const MAX_BUDGET = 1_000_000_000;

// READ: get the budget for a given month (defaults to current). Returns the
// amount as a plain number, or null if no budget is set.
export async function getBudget(month = currentMonthKey()) {
  const budget = await prisma.budget.findUnique({ where: { month } });
  return budget ? Number(budget.amount) : null;
}

// CREATE/UPDATE: set the budget for the current month (upsert).
export async function setBudget(prevState, formData) {
  const month = currentMonthKey();
  const raw = formData.get("amount");
  const amount =
    raw === null || raw === "" ? NaN : parseFloat(raw.toString());

  if (Number.isNaN(amount) || amount <= 0) {
    return {
      success: false,
      message: "Budget must be a positive number.",
    };
  }
  if (amount > MAX_BUDGET) {
    return { success: false, message: "Budget is too large." };
  }

  try {
    await prisma.budget.upsert({
      where: { month },
      update: { amount },
      create: { month, amount },
    });
  } catch (err) {
    console.error("setBudget failed:", err);
    return {
      success: false,
      message: "Could not save the budget. Please try again.",
    };
  }

  // No revalidatePath here: the client updates its budget state locally,
  // so we avoid a full layout re-render (and the animation replay/flash).
  return { success: true, amount, message: "Budget updated." };
}

// DELETE: remove the budget for the current month.
export async function clearBudget() {
  const month = currentMonthKey();
  try {
    await prisma.budget.deleteMany({ where: { month } });
  } catch (err) {
    console.error("clearBudget failed:", err);
    return { success: false, message: "Could not clear the budget." };
  }

  return { success: true, message: "Budget cleared." };
}

// ---------------------------------------------------------------------------
// Income
// ---------------------------------------------------------------------------

// READ: fetch all income entries, newest first.
export async function getIncomes() {
  const incomes = await prisma.income.findMany({
    orderBy: { date: "desc" },
  });
  return incomes.map((income) => ({
    ...income,
    amount: Number(income.amount),
  }));
}

// CREATE: add a new income entry.
export async function createIncome(prevState, formData) {
  const source = formData.get("source")?.toString().trim() ?? "";
  const rawAmount = formData.get("amount");
  const amount =
    rawAmount === null || rawAmount === "" ? NaN : parseFloat(rawAmount.toString());
  const date = formData.get("date")?.toString() || "";

  const errors = {};
  if (!source) {
    errors.source = "Source is required.";
  } else if (source.length > MAX_TITLE_LENGTH) {
    errors.source = `Source must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }
  if (Number.isNaN(amount)) {
    errors.amount = "Amount is required.";
  } else if (amount <= 0) {
    errors.amount = "Amount must be greater than zero.";
  } else if (amount > MAX_AMOUNT) {
    errors.amount = "Amount is too large.";
  }
  if (date && Number.isNaN(new Date(date).getTime())) {
    errors.date = "Invalid date.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: "Please fix the errors below." };
  }

  try {
    await prisma.income.create({
      data: {
        source,
        amount,
        date: date ? new Date(date) : new Date(),
      },
    });
  } catch (err) {
    console.error("createIncome failed:", err);
    return {
      success: false,
      errors: {},
      message: "Could not save the income. Please try again.",
    };
  }

  revalidatePath("/");
  return { success: true, errors: {}, message: "Income added." };
}

// DELETE: remove an income entry.
export async function deleteIncome(id) {
  if (!id) {
    return { success: false, message: "Income id is required." };
  }
  try {
    await prisma.income.delete({ where: { id } });
  } catch (err) {
    console.error("deleteIncome failed:", err);
    return {
      success: false,
      message: "Could not delete the income. Please try again.",
    };
  }

  revalidatePath("/");
  return { success: true, message: "Income deleted." };
}
