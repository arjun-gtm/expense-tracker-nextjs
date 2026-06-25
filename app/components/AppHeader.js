"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Wallet, LayoutDashboard, ListChecks } from "lucide-react";

const NAV = [
  { href: "/", label: "Expenses", icon: ListChecks },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Wallet className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Yahi-Lahi Expense Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Next.js Server Actions · Prisma · Supabase
          </p>
        </div>
      </div>

      <nav className="flex w-fit items-center gap-1 rounded-lg border border-border/60 bg-card/60 p-1 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        {NAV.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:text-foreground"
              data-active={active}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-foreground/10"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="size-4" />
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
