import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ptBR } from "date-fns/locale";
import {
  CreditCard,
  Repeat,
  AlertCircle,
  CalendarIcon,
  Calendar,
} from "lucide-react";
import { BiMoney } from "react-icons/bi";
import { BsBank } from "react-icons/bs";
import { HiCreditCard } from "react-icons/hi";
import { PiX } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  PaymentMethod,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../lib/schemas/transaction.interface";
import { Account } from "../../lib/schemas/account.interface";
import {
  SavingPlan,
  SavingPlanInvestment,
} from "../../lib/schemas/saving-plan.interface";
import { Category } from "../../lib/schemas/category.interface";
import { CreditCard as CreditCardType } from "../../lib/repositories/creditCardRepository";
import {
  CreateTransactionDto,
  TransactionRepository,
} from "../../lib/repositories/transactionsRepository";
import { Types } from "mongoose";
import {
  InvestmentOperationType,
  InvestmentRepository,
  InvestmentType,
} from "../../lib/repositories/investmentsRepository";
import { RecurringTransactionRepository } from "../../lib/repositories/reccuringTransactions";
import { RecurrenceType } from "../../lib/schemas/reccuring-transactions.interface";
import { SavingPlansRepository } from "../../lib/repositories/savingPlansRepository";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useTransactionsStore } from "../../store/useTransactionsStore";
import { Alert, AlertDescription } from "../ui/alert";

interface TransactionsFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  isOpen: boolean;
  accounts: Account[];
  creditCards: CreditCardType[];
  categories: Category[];
  savingPlans: SavingPlan[];
  mode: "create" | "edit";
  transactionType: TransactionType;
  existingTransaction?: Transaction;
}

interface ValidationErrors {
  description?: string;
  amount?: string;
  category?: string;
  submit?: string;
}

const TransactionsForm = ({
  isOpen,
  onClose,
  accounts,
  creditCards,
  categories,
  savingPlans,
  mode,
  transactionType,
  existingTransaction,
  onSuccess,
}: TransactionsFormProps) => {
  const { transactions, fetchTransactions, addTransactions } =
    useTransactionsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecurringPanelOpen, setIsRecurringPanelOpen] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState<string | null>();
  const [selectedAccount, setSelectedAccount] = useState<Account>(accounts[0]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [paymentDate, setPaymentDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return today;
  });

  const TIMEZONE = "America/Sao_Paulo";

  const calculateCurrentMonthCategoryTotal = useCallback(
    (categoryId: string) => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      return transactions
        .filter(
          (t) =>
            t.category?.toString() === categoryId &&
            new Date(t.paymentDate) >= firstDayOfMonth &&
            new Date(t.paymentDate) <= lastDayOfMonth
        )
        .reduce((sum, t) => sum + t.amount, 0);
    },
    [transactions]
  );

  const formatDateForDisplay = (date: Date): string => {
    const brazilDate = toZonedTime(date, TIMEZONE);
    console.log(brazilDate);
    brazilDate.setHours(12, 0, 0, 0);
    return format(brazilDate, "yyyy-MM-dd");
  };

  const getCurrentDate = (): string => {
    const today = toZonedTime(new Date(), TIMEZONE);
    today.setHours(12, 0, 0, 0);
    console.log(format(today, "yyyy-MM-dd"));
    return format(today, "yyyy-MM-dd");
  };

  const initialFormData = useMemo(
    () => ({
      type: transactionType,
      description: "",
      category: "",
      amount: "",
      paymentMethod: "PIX",
      status: "COMPLETED",
      fromAccount: "",
      toAccount: "",
      savingPlan: "",
      creditCard: "",
      installments: 1,
      transferType: "account",
      investmentType: "CRYPTO",
      symbol: "",
      quantity: 0,
      purchasePrice: 0,
      fees: 0,
      notes: "",
      isRecurring: false,
      recurrenceType: "MONTHLY",
      recurrenceEndDate: "",
    }),
    [transactionType]
  );
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (formData.category && formData.amount) {
      const selectedCategory = categories.find(
        (cat) => cat._id.toString() === formData.category
      );

      if (selectedCategory?.monthlyBudgetAmount) {
        const currentTotal = calculateCurrentMonthCategoryTotal(
          formData.category
        );
        const newTotal = currentTotal + parseFloat(formData.amount);

        if (newTotal > selectedCategory.monthlyBudgetAmount) {
          setBudgetWarning(
            `This transaction will exceed your monthly budget for ${
              selectedCategory.name
            } by ${formatCurrency(
              newTotal - selectedCategory.monthlyBudgetAmount
            )}`
          );
        } else {
          setBudgetWarning(null);
        }
      }
    } else {
      setBudgetWarning(null);
    }
  }, [
    formData.category,
    formData.amount,
    calculateCurrentMonthCategoryTotal,
    categories,
  ]);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts, selectedAccount]);

  useEffect(() => {
    if (existingTransaction) {
      const transactionDate = new Date(existingTransaction.paymentDate);
      transactionDate.setHours(12, 0, 0, 0);
      setPaymentDate(transactionDate);
      setFormData({
        ...initialFormData,
        ...existingTransaction,
        amount: existingTransaction.amount.toString(),
        category: existingTransaction.category?.toString() || "",
        fromAccount: existingTransaction.fromAccount?.toString() || "",
        toAccount: existingTransaction.toAccount?.toString() || "",
        savingPlan: existingTransaction.savingPlan?.toString() || "",
        creditCard: existingTransaction.creditCard?.toString() || "",
      });
    }
  }, [mode, existingTransaction, initialFormData]);

  const formatCurrency = (value: string | number) => {
    if (!value) return "R$ 0,00";
    const number = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(number)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
  };

  const parseCurrencyInput = (value: string) => {
    return value.replace(/[^0-9]/g, "");
  };

  const getInitialPaymentDate = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return today;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setPaymentDate(getInitialPaymentDate());
    setValidationErrors({});
    setIsRecurringPanelOpen(false);
  };

  const handleAmountChange = (e: { target: { value: string } }) => {
    const rawValue = parseCurrencyInput(e.target.value);
    const numericValue = (parseInt(rawValue) / 100).toString();
    setFormData((prev) => ({
      ...prev,
      amount: numericValue,
      purchasePrice: parseFloat(numericValue) || 0,
    }));
  };

  const validateForm = () => {
    const errors: ValidationErrors = {};
    if (!formData.description) errors.description = "Description is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      errors.amount = "Valid amount is required";
    if (!formData.category) errors.category = "Category is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formattedData: CreateTransactionDto = {
        account: new Types.ObjectId(selectedAccount._id),
        description: formData.description,
        type: transactionType,
        category: new Types.ObjectId(formData.category),
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod as PaymentMethod,
        status:
          (formData.paymentMethod as PaymentMethod) ===
            PaymentMethod.CREDIT_CARD || paymentDate > new Date()
            ? TransactionStatus.PENDING
            : (formData.status as TransactionStatus),
        paymentDate: paymentDate,
        fromAccount: formData.fromAccount
          ? new Types.ObjectId(formData.fromAccount)
          : undefined,
        toAccount: formData.toAccount
          ? new Types.ObjectId(formData.toAccount)
          : undefined,
        creditCard:
          formData.paymentMethod === PaymentMethod.CREDIT_CARD ||
          formData.paymentMethod === PaymentMethod.DEBIT_CARD
            ? new Types.ObjectId(formData.creditCard)
            : undefined,
        savingPlan: formData.savingPlan
          ? new Types.ObjectId(formData.savingPlan)
          : undefined,
      };

      if (mode === "create") {
        let transactionId: string;
        let createdTransaction: Transaction[];

        if (formData.paymentMethod === PaymentMethod.CREDIT_CARD) {
          const results = await TransactionRepository.createInstallment(
            formattedData,
            formData.installments
          );

          createdTransaction = Array.isArray(results) ? results : [results];

          transactionId = Array.isArray(results)
            ? results[0]._id.toString()
            : results._id.toString();
        } else {
          const result = await TransactionRepository.create(formattedData);
          transactionId = result._id.toString();

          createdTransaction = [result];

          if (transactionType === TransactionType.INVESTMENT) {
            await InvestmentRepository.create({
              account: new Types.ObjectId(selectedAccount._id),
              type: formData.investmentType as InvestmentType,
              symbol: formData.symbol!,
              quantity: formData.quantity!,
              purchasePrice: formData.purchasePrice!,
              fees: formData.fees,
              notes: formData.notes,
              operationDate: paymentDate,
              operationType: InvestmentOperationType.BUY,
            });
          }
        }

        addTransactions(createdTransaction);

        if (
          formData.transferType === "savingPlan" &&
          formData.status === "COMPLETED"
        ) {
          const existingInvestments =
            savingPlans.find(
              (plan) => plan._id.toString() === formData.savingPlan
            )?.investments || [];

          const newInvestment: SavingPlanInvestment = {
            _id: new Types.ObjectId(transactionId),
            value: Number(formData.amount),
            date: new Date(),
          };

          await SavingPlansRepository.update(formData.savingPlan.toString(), {
            investments: [...existingInvestments, newInvestment],
          });
        }

        if (formData.isRecurring) {
          await RecurringTransactionRepository.create({
            originalTransaction: new Types.ObjectId(transactionId),
            recurrenceType: formData.recurrenceType as RecurrenceType,
            recurrenceEndDate: formData.recurrenceEndDate
              ? new Date(formData.recurrenceEndDate)
              : undefined,
            isActive: true,
          });
        }
        resetForm();
        onSuccess?.();
      } else {
        if (!existingTransaction?._id) {
          throw new Error("No transaction ID provided for edit");
        }
        await TransactionRepository.update(
          existingTransaction._id.toString(),
          formattedData
        );
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        setValidationErrors({ submit: error.message });
      } else {
        setValidationErrors({ submit: "An unknown error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethodIcons = {
    PIX: <PiX className="w-4 h-4" />,
    BANK_TRANSFER: <BsBank className="w-4 h-4" />,
    CREDIT_CARD: <CreditCard className="w-4 h-4" />,
    CASH: <BiMoney className="w-4 h-4" />,
    DEBIT_CARD: <HiCreditCard className="w-4 h-4" />,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle>
                {mode === "create" ? "New" : "Edit"} {transactionType}
              </DialogTitle>
              {validationErrors.submit && (
                <Badge variant="destructive" className="h-6">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {validationErrors.submit}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedAccount?._id.toString()}
                onValueChange={(value) =>
                  setSelectedAccount(
                    accounts.find((acc) => acc._id.toString() === value)!
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem
                      key={account._id.toString()}
                      value={account._id.toString()}
                    >
                      {account.institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsRecurringPanelOpen(true)}
              >
                <Repeat className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              {validationErrors.description && (
                <p className="text-sm text-destructive">
                  {validationErrors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                placeholder="R$ 0,00"
                value={formData.amount ? formatCurrency(formData.amount) : ""}
                onChange={handleAmountChange}
              />
              {validationErrors.amount && (
                <p className="text-sm text-destructive">
                  {validationErrors.amount}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category._id.toString()}
                      value={category._id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {budgetWarning && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{budgetWarning}</AlertDescription>
                </Alert>
              )}
              {validationErrors.category && (
                <p className="text-sm text-destructive">
                  {validationErrors.category}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(paymentDate, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={paymentDate}
                    onSelect={(date) => {
                      if (date) {
                        const selectedDate = new Date(date);
                        selectedDate.setHours(12, 0, 0, 0);
                        setPaymentDate(selectedDate);
                      }
                    }}
                    initialFocus
                  />
                  <Separator />
                  <div className="p-3 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          paymentDate: getCurrentDate(),
                        }));
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        setFormData((prev) => ({
                          ...prev,
                          paymentDate: formatDateForDisplay(yesterday),
                        }));
                      }}
                    >
                      Yesterday
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {transactionType === "EXPENSE" && (
              <div className="space-y-4">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(paymentMethodIcons).map(([method, icon]) => (
                    <Button
                      key={method}
                      type="button"
                      size="sm"
                      variant={
                        formData.paymentMethod === method
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethod: method,
                        }))
                      }
                      className="flex-1"
                    >
                      {icon}
                    </Button>
                  ))}
                </div>

                {formData.paymentMethod === "CREDIT_CARD" && (
                  <div className="space-y-4 animate-in fade-in">
                    <Select
                      value={formData.creditCard}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          creditCard: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit card" />
                      </SelectTrigger>
                      <SelectContent>
                        {creditCards.map((card) => (
                          <SelectItem
                            key={card._id.toString()}
                            value={card._id.toString()}
                          >
                            {card.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {mode === "create" && (
                      <Select
                        value={formData.installments.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            installments: parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select installments" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}x{" "}
                              {i > 0 &&
                                formatCurrency(
                                  parseFloat(formData.amount || "0") / (i + 1)
                                )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>
            )}

            {transactionType === "TRANSFER" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={
                      formData.transferType === "account"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        transferType: "account",
                      }))
                    }
                    className="flex-1"
                  >
                    To Account
                  </Button>
                  <Button
                    type="button"
                    variant={
                      formData.transferType === "savingPlan"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        transferType: "savingPlan",
                      }))
                    }
                    className="flex-1"
                  >
                    To Saving Plan
                  </Button>
                </div>

                {formData.transferType === "account" ? (
                  <Select
                    value={formData.toAccount}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        toAccount: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter(
                          (account) => account._id !== selectedAccount?._id
                        )
                        .map((account) => (
                          <SelectItem
                            key={account._id.toString()}
                            value={account._id.toString()}
                          >
                            {account.institution}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={formData.savingPlan}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        savingPlan: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select saving plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {savingPlans.map((plan) => (
                        <SelectItem
                          key={plan._id.toString()}
                          value={plan._id.toString()}
                        >
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {transactionType === "INVESTMENT" && (
              <div className="space-y-4">
                <Select
                  value={formData.investmentType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      investmentType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STOCK">Stock</SelectItem>
                    <SelectItem value="ETF">ETF</SelectItem>
                    <SelectItem value="REIT">REIT</SelectItem>
                    <SelectItem value="CRYPTO">Crypto</SelectItem>
                    <SelectItem value="FIXED_INCOME">Fixed Income</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Symbol/Ticker"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      symbol: e.target.value,
                    }))
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: parseFloat(e.target.value) || 0,
                      }))
                    }
                    step="0.000000001"
                    min="0"
                  />
                  <Input
                    placeholder="Price"
                    value={
                      formData.purchasePrice
                        ? formatCurrency(formData.purchasePrice)
                        : ""
                    }
                    onChange={(e) => {
                      const rawValue = parseCurrencyInput(e.target.value);
                      const numericValue = parseInt(rawValue) / 100 || 0;
                      setFormData((prev) => ({
                        ...prev,
                        purchasePrice: numericValue,
                      }));
                    }}
                  />
                </div>

                <Input
                  placeholder="Fees"
                  value={formData.fees ? formatCurrency(formData.fees) : ""}
                  onChange={(e) => {
                    const rawValue = parseCurrencyInput(e.target.value);
                    const numericValue = parseInt(rawValue) / 100 || 0;
                    setFormData((prev) => ({
                      ...prev,
                      fees: numericValue,
                    }));
                  }}
                />

                <Textarea
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Processing...
              </>
            ) : (
              `${mode === "create" ? "Create" : "Update"} Transaction`
            )}
          </Button>
        </form>
      </DialogContent>

      <Sheet open={isRecurringPanelOpen} onOpenChange={setIsRecurringPanelOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Recurring Settings</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isRecurring: checked,
                  }))
                }
              />
              <Label htmlFor="recurring">Enable recurring transaction</Label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-2">
                  <Label>Recurrence Type</Label>
                  <Select
                    value={formData.recurrenceType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        recurrenceType: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.recurrenceEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.recurrenceEndDate ? (
                          format(
                            new Date(formData.recurrenceEndDate),
                            "dd/MM/yyyy"
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={
                          formData.recurrenceEndDate
                            ? new Date(formData.recurrenceEndDate)
                            : undefined
                        }
                        onSelect={(date: Date | undefined) =>
                          setFormData((prev) => ({
                            ...prev,
                            recurrenceEndDate: date
                              ? formatDateForDisplay(date)
                              : "",
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </Dialog>
  );
};

export default TransactionsForm;
