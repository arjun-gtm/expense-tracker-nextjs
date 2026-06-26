import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shadcn/theme-provider";
import { Toaster } from "@/components/shadcn/sonner";
import { ExpensesProvider } from "./components/ExpensesProvider";
import AppHeader from "./components/AppHeader";
import { getExpenses, getBudget, getIncomes } from "./actions";

// These pages read from the database at request time, so they must render
// dynamically rather than being statically prerendered at build time.
export const dynamic = "force-dynamic";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Expense Tracker",
  description: "Track expenses with Next.js Server Actions, Prisma, and Supabase",
};

export default async function RootLayout({ children }) {
  // Fetched once in the shared layout so navigating between Expenses and
  // Dashboard reads from already-loaded data (no refetch, no flash).
  const [expenses, budget, incomes] = await Promise.all([
    getExpenses(),
    getBudget(),
    getIncomes(),
  ]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <ExpensesProvider expenses={expenses} incomes={incomes} budget={budget}>
            <div className="animated-gradient flex flex-1 justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
              <main className="flex w-full max-w-[1400px] flex-col gap-8">
                <AppHeader />
                {children}
              </main>
            </div>
          </ExpensesProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
