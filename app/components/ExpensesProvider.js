"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ExpensesContext = createContext({
  expenses: [],
  incomes: [],
  budget: null,
  setBudgetValue: () => {},
});

export function ExpensesProvider({ expenses, incomes = [], budget, children }) {
  // Budget lives in client state so saving/editing it updates the UI
  // instantly without a server re-render (no flash / no animation replay).
  const [budgetValue, setBudgetValue] = useState(budget);

  // Keep in sync if the server-provided value changes (e.g. after a
  // full reload or an expense mutation that revalidates the layout).
  useEffect(() => {
    setBudgetValue(budget);
  }, [budget]);

  return (
    <ExpensesContext.Provider
      value={{ expenses, incomes, budget: budgetValue, setBudgetValue }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpensesContext).expenses;
}

export function useIncomes() {
  return useContext(ExpensesContext).incomes;
}

export function useBudget() {
  return useContext(ExpensesContext).budget;
}

export function useSetBudget() {
  return useContext(ExpensesContext).setBudgetValue;
}
