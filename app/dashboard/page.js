"use client";

import { motion } from "motion/react";
import Dashboard from "../components/Dashboard";
import { useExpenses, useBudget } from "../components/ExpensesProvider";

export default function DashboardPage() {
  const expenses = useExpenses();
  const budget = useBudget();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Dashboard expenses={expenses} budget={budget} />
    </motion.div>
  );
}
