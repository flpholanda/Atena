import React, { useState, useMemo } from "react";
import {
  Calendar,
  ChevronDown,
  CreditCard as CreditCardIcon,
  Receipt,
} from "lucide-react";
import {
  Transaction,
  TransactionStatus,
} from "../../lib/schemas/transaction.interface";
import { CreditCard } from "../../lib/schemas/credit-card.interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "../../hooks/use-toast";
import { isBefore, isEqual, startOfDay } from "date-fns";

interface CreditCardSpendingProps {
  transactions: Transaction[];
  creditCards: CreditCard[];
  onPayBill: (transactionsToComplete: Transaction[]) => Promise<void>;
}

const getCardTransactions = (
  transactions: Transaction[],
  cardId: string,
  status: TransactionStatus = TransactionStatus.PENDING
) => {
  if (!cardId) return [];

  return transactions.filter(
    (transaction) =>
      transaction.status === status &&
      transaction.type === "EXPENSE" &&
      transaction.creditCard?.toString() === cardId
  );
};

const getLastDayOfFebruary = (year: number) => {
  return new Date(year, 2, 0).getDate();
};

const CreditCardSpending = ({
  transactions,
  creditCards,
  onPayBill,
}: CreditCardSpendingProps) => {
  const [selectedCard, setSelectedCard] = useState(
    creditCards[0]?._id.toString()
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentCard, setCurrentCard] = useState<CreditCard>();

  useMemo(() => {
    setCurrentCard(
      creditCards.find((card) => card._id.toString() === selectedCard)
    );
  }, [creditCards, selectedCard]);

  const pendingTransactions = useMemo(() => {
    return getCardTransactions(transactions, selectedCard);
  }, [transactions, selectedCard]);

  const currentClosingDate = useMemo(() => {
    if (!currentCard) return null;

    const today = new Date();
    const currentMonth = today.getMonth();

    // Special handling for February
    if (currentMonth === 1) {
      // February is month 1 (0-based)
      const lastDayOfFeb = getLastDayOfFebruary(today.getFullYear());
      return new Date(today.getFullYear(), 1, lastDayOfFeb);
    }

    const closingDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      currentCard.closingDate
    );

    if (today.getDate() > currentCard.closingDate) {
      closingDate.setMonth(closingDate.getMonth() + 1);
    }

    return closingDate;
  }, [currentCard]);

  const {
    totalSpent,
    billTransactions,
    availableLimit,
    usedPercentage,
    nextStatementTotal,
  } = useMemo(() => {
    const total = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);

    const billToPay = pendingTransactions.filter((t) => {
      if (!currentClosingDate || !t.paymentDate) return false;
      const paymentDate = new Date(t.paymentDate);
      return paymentDate <= currentClosingDate;
    });

    const nextStatement = pendingTransactions.filter((t) => {
      if (!currentClosingDate || !t.paymentDate) return false;

      const paymentDate = startOfDay(new Date(t.paymentDate));
      const closingDate = startOfDay(new Date(currentClosingDate));

      return (
        isBefore(paymentDate, closingDate) || isEqual(paymentDate, closingDate)
      );
    });

    const nextStatementAmount = nextStatement.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const availableLimit = currentCard ? currentCard.limit - total : 0;
    const usedPercentage = currentCard ? (total / currentCard.limit) * 100 : 0;

    return {
      totalSpent: total,
      billTransactions: billToPay,
      availableLimit,
      usedPercentage,
      nextStatementTotal: nextStatementAmount,
    };
  }, [pendingTransactions, currentClosingDate, currentCard]);

  const billTotal = useMemo(
    () => billTransactions.reduce((sum, t) => sum + t.amount, 0),
    [billTransactions]
  );

  const isPaymentPeriod = useMemo(() => {
    if (!currentCard) return false;

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Special handling for February
    if (currentMonth === 1) {
      const lastDayOfFeb = getLastDayOfFebruary(currentYear);
      const closingDate = new Date(currentYear, 1, lastDayOfFeb);
      const dueDate = new Date(currentYear, 2, currentCard.dueDate); // March due date

      const todayDate = new Date(currentYear, currentMonth, currentDay);
      return todayDate >= closingDate && todayDate <= dueDate;
    }

    // Regular months logic
    const closingDate = new Date(
      currentYear,
      currentMonth,
      currentCard.closingDate
    );
    let dueDate = new Date(currentYear, currentMonth, currentCard.dueDate);

    if (currentCard.dueDate < currentCard.closingDate) {
      dueDate = new Date(currentYear, currentMonth + 1, currentCard.dueDate);
    }

    if (
      currentDay < currentCard.dueDate &&
      currentDay < currentCard.closingDate
    ) {
      closingDate.setMonth(closingDate.getMonth() - 1);
    }

    const todayDate = new Date(currentYear, currentMonth, currentDay);

    return todayDate >= closingDate && todayDate <= dueDate;
  }, [currentCard]);

  const handlePayBill = async () => {
    if (!currentCard || !billTransactions.length) return;

    try {
      setIsProcessing(true);
      await onPayBill(billTransactions);
      toast({
        title: "Success",
        description: `Bill payment of R$ ${billTotal.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })} processed successfully`,
      });
      setShowPaymentDialog(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to process bill payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="bg-background text-foreground">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 p-2">
                <span className="text-sm font-medium">{currentCard?.name}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {creditCards.map((card) => (
                <DropdownMenuItem
                  key={card._id.toString()}
                  onClick={() => setSelectedCard(card._id.toString())}
                >
                  {card.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {currentCard && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <div>
                  <span className="text-muted-foreground">Close: </span>
                  {currentCard.closingDate}
                  <span className="mx-1">•</span>
                  <span className="text-muted-foreground">Due: </span>
                  {currentCard.dueDate}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span>
                  R${" "}
                  {nextStatementTotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="text-center mb-4">
            <div className="text-2xl font-bold">
              R$
              {availableLimit.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-sm text-muted-foreground">Available Limit</div>
          </div>

          <div className="space-y-4">
            <div className="relative pt-2">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300 bg-primary"
                  style={{
                    width: `${Math.min(usedPercentage, 100)}%`,
                    opacity:
                      usedPercentage > 90
                        ? "0.9"
                        : usedPercentage > 75
                          ? "0.7"
                          : "0.5",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>
                  Used: R$
                  {totalSpent.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span>
                  Limit: R$
                  {currentCard?.limit.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {isPaymentPeriod && billTransactions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground text-center">
                  Current Bill Due: R$
                  {billTotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <Button
                  className="w-full"
                  onClick={() => setShowPaymentDialog(true)}
                >
                  Review Bill Payment ({billTransactions.length} transactions)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Current Bill Transactions</DialogTitle>
            <DialogDescription>
              Review the transactions that will be paid in this bill
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[300px] w-full pr-4">
            <div className="space-y-4">
              {billTransactions.map((transaction, i) => (
                <div key={transaction._id?.toString()}>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.paymentDate).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                    <p className="font-medium text-right">
                      R$
                      {transaction.amount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  {i < billTransactions.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" />
              <span className="font-medium">{currentCard?.name}</span>
            </div>
            <div className="text-lg font-bold">
              R$
              {billTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handlePayBill} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreditCardSpending;
