import React from "react";
import { Transaction } from "../../lib/schemas/transaction.interface";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LastTransactionsProps {
  transactions: Transaction[];
}

const LastTransactions: React.FC<LastTransactionsProps> = ({
  transactions,
}) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.paymentDate!);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey = "";

      if (date.toDateString() === today.toDateString()) {
        dateKey = "Hoje";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Ontem";
      } else {
        dateKey = date.toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return groups;
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div className="h-[calc(100vh-25rem)]">
      <CardHeader>
        <CardTitle>Últimas transações</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-32rem)] px-6">
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(
              ([date, dateTransactions]) => (
                <div key={date} className="space-y-4">
                  <h3 className="text-muted-foreground text-sm font-medium sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
                    {date}
                  </h3>
                  <div className="space-y-4">
                    {dateTransactions.slice(0, 9).map((transaction) => (
                      <div
                        key={transaction._id.toString()}
                        className="flex justify-between items-center hover:bg-accent rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            {transaction.type === "INCOME" ? (
                              <ArrowUpCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <ArrowDownCircle className="h-6 w-6 text-red-500" />
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {transaction.description}
                            </span>
                            <Badge variant="secondary" className="w-fit">
                              {transaction.paymentMethod}
                            </Badge>
                          </div>
                        </div>
                        <span
                          className={`font-medium ${
                            transaction.type === "INCOME"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
};

export default LastTransactions;
