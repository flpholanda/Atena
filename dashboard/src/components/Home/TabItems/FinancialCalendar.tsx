"use client";

import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isValid,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Transaction } from "../../../lib/schemas/transaction.interface";
import { Category } from "../../../lib/schemas/category.interface";
import { Types } from "mongoose";

interface MonthSelectorProps {
  currentDate: Date;
  onMonthSelect: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentDate,
  onMonthSelect,
  onPrevMonth,
  onNextMonth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), i);
    return {
      value: i,
      label: format(date, "MMMM", { locale: ptBR }),
    };
  });

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={onPrevMonth}
        className="p-1.5 text-white rounded-full hover:bg-zinc-800 transition-colors duration-200"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="capitalize flex items-center space-x-2 text-xl font-bold text-white hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <Calendar className="w-6 h-6" />
          <span>{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 gap-1 p-2">
              {months.map((month) => (
                <button
                  key={month.value + month.label}
                  onClick={() => {
                    onMonthSelect(
                      new Date(currentDate.getFullYear(), month.value)
                    );
                    setIsOpen(false);
                  }}
                  className="text-left px-4 py-2 text-white hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                >
                  {month.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNextMonth}
        className="p-1.5 text-white rounded-full hover:bg-zinc-800 transition-colors duration-200"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

interface FinancialCalendarProps {
  transactions: Transaction[];
  categories: Category[];
  year: number;
  month: number;
}

const FinancialCalendar: React.FC<FinancialCalendarProps> = ({
  transactions,
  categories,
  year,
  month,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1));

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const findCategory = (categoryId: Types.ObjectId | string) => {
    const category = categories.find(
      (cat) => cat._id?.toString() === categoryId?.toString()
    );
    return category;
  };

  const handlePreviousMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1));
  };

  const safeParseDate = (date: Date | string | undefined) => {
    if (date instanceof Date) {
      return date;
    }

    if (typeof date === "string") {
      try {
        const parsed = parseISO(date);
        return isValid(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }

    return null;
  };

  const transactionsByDay = transactions.reduce(
    (
      acc: Record<
        string,
        { income: number; expenses: number; transactions: Transaction[] }
      >,
      transaction
    ) => {
      const paymentDate = safeParseDate(transaction.paymentDate);

      if (paymentDate) {
        const dayKey = format(paymentDate, "yyyy-MM-dd");

        if (!acc[dayKey]) {
          acc[dayKey] = { income: 0, expenses: 0, transactions: [] };
        }

        if (transaction.type === "INCOME") {
          acc[dayKey].income += transaction.amount;
        } else {
          acc[dayKey].expenses += transaction.amount;
        }
        acc[dayKey].transactions.push(transaction);
      }

      return acc;
    },
    {}
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const DayContent = ({
    day,
    dayData,
  }: {
    day: Date;
    dayData: {
      income: number;
      expenses: number;
      transactions: Transaction[];
    } | null;
  }) => (
    <div
      className={`
        relative p-2 rounded-xl
        hover:bg-zinc-800/20 transition-all duration-200
        flex flex-col justify-center items-center
        ${dayData ? "bg-zinc-800/10" : ""}
        group
      `}
    >
      <div className="text-sm text-zinc-300 mb-0.5">{format(day, "d")}</div>
      {dayData && (
        <div className="flex flex-col items-center gap-0.5">
          {dayData.income > 0 && (
            <div className="text-[10px] text-emerald-400 font-medium">
              {formatCurrency(dayData.income)}
            </div>
          )}
          {dayData.expenses > 0 && (
            <div className="text-[10px] text-red-400 font-medium">
              {formatCurrency(dayData.expenses)}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-center items-center mb-4 shrink-0">
        <MonthSelector
          currentDate={currentDate}
          onMonthSelect={setCurrentDate}
          onPrevMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
            (day, index) => (
              <div
                key={index}
                className="text-center font-medium text-zinc-400 text-sm"
              >
                {day}
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-7 gap-2 auto-rows-fr">
          {days.map((day, index) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayData = transactionsByDay[dayKey];

            if (!dayData || dayData.transactions.length === 0) {
              return <DayContent key={index} day={day} dayData={null} />;
            }

            return (
              <Popover key={index}>
                <PopoverTrigger asChild>
                  <button className="w-full">
                    <DayContent day={day} dayData={dayData} />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-0 bg-zinc-900 border-zinc-800 max-h-96 
                    data-[state=open]:animate-in data-[state=closed]:animate-out
                    data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
                    data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
                    data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2
                    origin-center"
                  sideOffset={5}
                  align="center"
                >
                  <div className="p-4">
                    <div className="text-xs text-zinc-400 mb-3">
                      {format(day, "dd 'de' MMMM", { locale: ptBR })}
                    </div>
                    <div
                      className="space-y-2 max-h-72 overflow-y-auto pr-2
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-lg
                        [&::-webkit-scrollbar-track]:bg-zinc-800
                        [&::-webkit-scrollbar-thumb]:rounded-lg
                        [&::-webkit-scrollbar-thumb]:bg-zinc-700
                        hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600
                        transition-colors"
                    >
                      {dayData.transactions.map((transaction, idx) => (
                        <div
                          key={idx}
                          className="pb-2 border-b border-zinc-800 last:border-b-0 last:pb-0"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium truncate text-white">
                              {transaction.description}
                            </span>
                            <span
                              className={
                                transaction.type === "INCOME"
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }
                            >
                              {transaction.type === "INCOME" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                          {transaction.description && (
                            <div className="text-xs text-zinc-500 mt-1 line-clamp-2">
                              {findCategory(transaction.category.toString())
                                ?.name || "Unknown Category"}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinancialCalendar;
