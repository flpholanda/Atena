import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Transaction } from "../../../lib/schemas/transaction.interface";
import { Category } from "../../../lib/schemas/category.interface";

interface ExpenseAnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function ExpenseAnalytics({
  transactions,
  categories,
}: ExpenseAnalyticsProps) {
  const categoryMap = useMemo(() => {
    return categories.reduce(
      (acc, cat) => {
        acc[cat._id.toString()] = { name: cat.name, color: cat.color };
        return acc;
      },
      {} as Record<string, { name: string; color: string }>
    );
  }, [categories]);

  const {
    categoryBreakdown,
    topCategories,
    monthlyTrend,
    totalExpenses,
    monthlyChange,
  } = useMemo(() => {
    const expenseTransactions = transactions.filter(
      (t) => t.type === "EXPENSE"
    );
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Monthly spending data
    const monthlySpending = expenseTransactions.reduce(
      (acc, transaction) => {
        const date = new Date(transaction.paymentDate!);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!acc[monthKey]) acc[monthKey] = 0;
        acc[monthKey] += transaction.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate month-over-month change
    const thisMonth =
      monthlySpending[
        `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
      ] || 0;
    const lastMonth =
      monthlySpending[
        `${currentYear}-${String(currentMonth).padStart(2, "0")}`
      ] || 0;
    const monthlyChange = ((thisMonth - lastMonth) / lastMonth) * 100;

    // Category breakdown
    const breakdown = expenseTransactions.reduce(
      (acc, transaction) => {
        const catId = transaction.category.toString();
        if (!acc[catId]) acc[catId] = 0;
        acc[catId] += transaction.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    // Transform data for charts
    const categoryBreakdown = Object.entries(breakdown)
      .map(([catId, amount]) => ({
        name: categoryMap[catId]?.name || "Outros",
        value: amount,
        color: categoryMap[catId]?.color || "#666",
      }))
      .sort((a, b) => b.value - a.value);

    // Monthly trend data
    const monthlyTrend = Object.entries(monthlySpending)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    // Top spending categories
    const topCategories = categoryBreakdown.slice(0, 4);

    const totalExpenses = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return {
      monthlyData: monthlySpending,
      categoryBreakdown,
      topCategories,
      monthlyTrend,
      totalExpenses,
      monthlyChange,
    };
  }, [transactions, categoryMap]);

  return (
    <div className="space-y-4 p-4">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {totalExpenses.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              {monthlyChange > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
              )}
              <span
                className={
                  monthlyChange > 0 ? "text-red-500" : "text-green-500"
                }
              >
                {Math.abs(monthlyChange).toFixed(1)}%
              </span>
              <span className="ml-1">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        {topCategories.slice(0, 3).map((category, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {category.name}
              </CardTitle>
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R${" "}
                {category.value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-muted-foreground pt-1">
                {((category.value / totalExpenses) * 100).toFixed(1)}% do total
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Monthly Trend Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tendência de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyTrend}>
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
