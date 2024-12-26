"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListChecks,
  PiggyBank,
  LayoutDashboard,
  Wallet,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import TransactionsForm from "../Transaction/TransactionForm";
import { Account } from "../../lib/schemas/account.interface";
import { CreditCard } from "../../lib/schemas/credit-card.interface";
import { Category } from "../../lib/schemas/category.interface";
import { SavingPlan } from "../../lib/schemas/saving-plan.interface";
import { TransactionType } from "../../lib/schemas/transaction.interface";
import { AccountRepository } from "../../lib/repositories/accountsRepository";
import { CreditCardRepository } from "../../lib/repositories/creditCardRepository";
import { CategoryRepository } from "../../lib/repositories/categoriesRepository";
import { SavingPlansRepository } from "../../lib/repositories/savingPlansRepository";
import { useTransactionsStore } from "../../store/useTransactionsStore";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const transactionLabels = {
  [TransactionType.EXPENSE]: {
    label: "Despesa",
    variant: "destructive" as const,
    icon: <Wallet className="h-4 w-4" />,
  },
  [TransactionType.INCOME]: {
    label: "Receita",
    variant: "success" as const,
    icon: <Wallet className="h-4 w-4" />,
  },
  [TransactionType.TRANSFER]: {
    label: "Transferência",
    variant: "secondary" as const,
    icon: <Wallet className="h-4 w-4" />,
  },
  [TransactionType.INVESTMENT]: {
    label: "Investimento",
    variant: "secondary" as const,
    icon: <PiggyBank className="h-4 w-4" />,
  },
};

const NavItem: React.FC<NavItemProps> = ({ to, children, icon }) => {
  const pathname = usePathname();
  const isActive = pathname === to;
  const { fetchTransactions, getPendingTransactionsBeforeToday } =
    useTransactionsStore();
  const pendingTransactions = getPendingTransactionsBeforeToday();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const showPendingIndicator =
    to === "/transactions" && pendingTransactions.length > 0;

  return (
    <Link href={to}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "flex items-center gap-2 relative",
          showPendingIndicator && "pr-7"
        )}
      >
        {icon}
        {children}
        {showPendingIndicator && (
          <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse opacity-50" />
            <span className="relative px-1.5 py-0.5 text-[10px] font-medium leading-none text-white">
              {pendingTransactions.length}
            </span>
          </div>
        )}
      </Button>
    </Link>
  );
};

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransactionType, setCurrentTransactionType] =
    useState<TransactionType | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savingPlans, setSavingPlans] = useState<SavingPlan[]>([]);
  const [, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [
          fetchedAccounts,
          fetchedCreditCards,
          fetchedCategories,
          fetchedSavingPlans,
        ] = await Promise.all([
          AccountRepository.findAll(),
          CreditCardRepository.findAll(),
          CategoryRepository.findAll(),
          SavingPlansRepository.findAll(),
        ]);

        setAccounts(fetchedAccounts);
        setCreditCards(fetchedCreditCards);
        setCategories(fetchedCategories);
        setSavingPlans(fetchedSavingPlans);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError(
          "Ocorreu um erro ao buscar os dados. Tente novamente mais tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenModal = (type: TransactionType) => {
    setCurrentTransactionType(type);
    setIsModalOpen(true);
  };

  return (
    <nav className="w-full py-4 border-b">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NavItem to="/" icon={<LayoutDashboard className="h-4 w-4" />}>
            Home
          </NavItem>
          <NavItem to="/transactions" icon={<Wallet className="h-4 w-4" />}>
            Transações
          </NavItem>
          <NavItem to="/saving-plans" icon={<PiggyBank className="h-4 w-4" />}>
            Cofrinho
          </NavItem>
          <NavItem to="/investments" icon={<ListChecks className="h-4 w-4" />}>
            Investimentos
          </NavItem>
          <NavItem to="/saved-items" icon={<ListChecks className="h-4 w-4" />}>
            Lista de Desejos
          </NavItem>
          <NavItem to="/settings" icon={<Settings className="h-4 w-4" />}>
            Configurações
          </NavItem>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Nova Transação</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {Object.entries(transactionLabels).map(
              ([type, { label, icon }]) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleOpenModal(type as TransactionType)}
                  className="flex items-center gap-2"
                >
                  {icon}
                  <span>{label}</span>
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <TransactionsForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          accounts={accounts}
          creditCards={creditCards}
          categories={categories}
          savingPlans={savingPlans}
          mode="create"
          transactionType={currentTransactionType || TransactionType.EXPENSE}
        />
      </div>
    </nav>
  );
};

export default Navbar;
