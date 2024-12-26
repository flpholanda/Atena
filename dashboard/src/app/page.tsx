"use client";

import React, { useEffect, useState } from "react";
import InfoCard from "../components/Home/InfoCard";
import LastTransactions from "../components/Home/LastTransactions";
import FinancialCalendar from "../components/Home/TabItems/FinancialCalendar";
import SavingPlansDashboard from "../components/Home/TabItems/SavingPlan";
import TabNavigation from "../components/Home/TabNavigation";
import {
  Transaction,
  TransactionStatus,
} from "../lib/schemas/transaction.interface";
import { TransactionRepository } from "../lib/repositories/transactionsRepository";
import { CreditCardRepository } from "../lib/repositories/creditCardRepository";
import CreditCardSpending from "../components/Home/CreditCardSpending";
import { CreditCard } from "../lib/schemas/credit-card.interface";
import { SavingPlansRepository } from "../lib/repositories/savingPlansRepository";
import { SavingPlan } from "../lib/schemas/saving-plan.interface";
import { CategoryRepository } from "../lib/repositories/categoriesRepository";
import { Category } from "../lib/schemas/category.interface";
import ExpenseAnalytics from "../components/Home/TabItems/ExpenseCategoryBreakdown";
import { useTransactionsStore } from "../store/useTransactionsStore";
import HomeSkeleton from "../components/Skeleton/HomeSkeleton";

export default function Home() {
  const { transactions, fetchTransactions, getLastTransactions } =
    useTransactionsStore();
  const [, setMonthlyTransactions] = useState<Transaction[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [savingPlans, setSavingPlans] = useState<SavingPlan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastTransactions = getLastTransactions();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [fetchedCreditCards, fetchedSavingPlans, fetchedCategories] =
          await Promise.all([
            CreditCardRepository.findAll(),
            SavingPlansRepository.findAll(),
            CategoryRepository.findAll(),
          ]);

        setCreditCards(fetchedCreditCards);
        setSavingPlans(fetchedSavingPlans);
        setCategories(fetchedCategories);

        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const monthEnd = new Date(currentYear, currentMonth, 0);

        const thisMonthTransactions = transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.paymentDate!);
          return transactionDate >= monthStart && transactionDate <= monthEnd;
        });

        setMonthlyTransactions(thisMonthTransactions);

        setLoading(false);
      } catch {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, currentYear, transactions]);

  const calculateFinancialMetrics = () => {
    const currentMonthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.paymentDate!);
      return (
        transactionDate >= new Date(currentYear, currentMonth - 1, 1) &&
        transactionDate <= new Date(currentYear, currentMonth, 0)
      );
    });

    const lastMonthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.paymentDate!);
      return (
        transactionDate >= new Date(currentYear, currentMonth - 2, 1) &&
        transactionDate <= new Date(currentYear, currentMonth - 1, 0)
      );
    });

    const currentIncome = currentMonthTransactions
      .filter(
        (t) => t.type === "INCOME" && t.status === TransactionStatus.COMPLETED
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpense = currentMonthTransactions
      .filter(
        (t) => t.type === "EXPENSE" && t.status === TransactionStatus.COMPLETED
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthIncome = lastMonthTransactions
      .filter(
        (t) => t.type === "INCOME" && t.status === TransactionStatus.COMPLETED
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpense = lastMonthTransactions
      .filter(
        (t) => t.type === "EXPENSE" && t.status === TransactionStatus.COMPLETED
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingExpenses = currentMonthTransactions
      .filter(
        (t) => t.type === "EXPENSE" && t.status === TransactionStatus.PENDING
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const incomeChange = calculatePercentageChange(
      currentIncome,
      lastMonthIncome
    );
    const expenseChange = calculatePercentageChange(
      currentExpense,
      lastMonthExpense
    );

    const incomeChangeAmount = currentIncome - lastMonthIncome;
    const expenseChangeAmount = currentExpense - lastMonthExpense;

    const currentTotal = currentIncome - currentExpense;
    const lastMonthTotal = lastMonthIncome - lastMonthExpense;
    const totalChange = calculatePercentageChange(currentTotal, lastMonthTotal);
    const totalChangeAmount = currentTotal - lastMonthTotal;

    return {
      currentIncome,
      currentExpense,
      pendingExpenses,
      incomeChange,
      expenseChange,
      incomeChangeAmount,
      expenseChangeAmount,
      currentTotal,
      totalChange,
      totalChangeAmount,
    };
  };

  const metrics = calculateFinancialMetrics();

  const tabItems = [
    {
      id: 1,
      label: "Calendário",
      content: (
        <div>
          <FinancialCalendar
            month={currentMonth}
            year={currentYear}
            transactions={transactions}
            categories={categories}
          />
        </div>
      ),
    },
    {
      id: 2,
      label: "Cofrinho",
      content: (
        <div>
          <SavingPlansDashboard savingPlans={savingPlans} />
        </div>
      ),
    },
    {
      id: 3,
      label: "Categorias",
      content: (
        <div>
          <ExpenseAnalytics
            transactions={transactions}
            categories={categories}
          />
        </div>
      ),
    },
  ];

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  async function onPayBill(transactionsToComplete: Transaction[]) {
    await Promise.all(
      transactionsToComplete.map((transaction) =>
        TransactionRepository.update(transaction._id.toString(), {
          ...transaction,
          status: TransactionStatus.COMPLETED,
        })
      )
    );

    const completedIds = new Set(
      transactionsToComplete.map((t) => t._id.toString())
    );

    useTransactionsStore.setState((state) => ({
      transactions: state.transactions.map((t) =>
        completedIds.has(t._id.toString())
          ? { ...t, status: TransactionStatus.COMPLETED }
          : t
      ),
    }));
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Info Cards Container */}
      <div className="flex gap-4">
        <div className="flex gap-2 flex-1">
          <InfoCard
            title="Entradas"
            amount={metrics.currentIncome}
            percentage={metrics.incomeChange}
            percentageAmount={metrics.incomeChangeAmount}
            type="income"
          />
          <InfoCard
            title="Saídas"
            amount={metrics.currentExpense}
            percentage={metrics.expenseChange}
            percentageAmount={metrics.expenseChangeAmount}
            type="expense"
            pendingAmount={metrics.pendingExpenses}
          />
          <InfoCard
            title="Total"
            amount={metrics.currentTotal}
            percentage={metrics.totalChange}
            percentageAmount={metrics.totalChangeAmount}
            type="total"
          />
        </div>

        {/* Sidebar with Credit Card */}
        <div className="w-1/4">
          <CreditCardSpending
            transactions={transactions}
            creditCards={creditCards}
            onPayBill={onPayBill}
          />
        </div>
      </div>

      {/* Transactions Container */}
      <div className="flex gap-4 flex-1">
        <div className="w-3/4 h-full overflow-y-auto rounded-lg">
          <TabNavigation tabItems={tabItems} />
        </div>

        {/* Last Transactions Wrapper */}
        <div className="w-1/4 h-full overflow-y-auto rounded-lg">
          <LastTransactions transactions={lastTransactions} />
        </div>
      </div>
    </div>
  );
}
