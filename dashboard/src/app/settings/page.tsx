"use client";
import React, { useState, useEffect } from "react";
import { CreditCard as CreditCardIcon, Pencil, Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Category } from "@/lib/schemas/category.interface";
import { Account, AccountType } from "@/lib/schemas/account.interface";
import { CategoryRepository } from "@/lib/repositories/categoriesRepository";
import { AccountRepository } from "@/lib/repositories/accountsRepository";
import { Types } from "mongoose";
import { CreditCard } from "@/lib/schemas/credit-card.interface";
import { CreditCardRepository } from "@/lib/repositories/creditCardRepository";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const SettingsPage = () => {
  const FIXED_BUDGET = 6000;
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [editingDialogState, setEditingDialogState] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null,
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#000000",
    type: "EXPENSE",
    monthlyBudgetPercentage: 0,
    monthlyBudgetAmount: 0,
  });
  const [remainingExpenseBudget, setRemainingExpenseBudget] =
    useState(FIXED_BUDGET);
  const [remainingIncomeBudget, setRemainingIncomeBudget] =
    useState(FIXED_BUDGET);

  const [newAccount, setNewAccount] = useState({
    institution: "",
    type: AccountType.CHECKING,
    description: "",
  });

  const [newCreditCard, setNewCreditCard] = React.useState({
    name: "",
    limit: "",
    closingDate: "",
    dueDate: "",
    limitHistory: "",
  });
  const [editingId, setEditingId] = React.useState<Types.ObjectId | null>(null);

  const [salary, setSalary] = useState("5000");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    calculateRemainingBudgets();
  }, [categories]);

  const calculateRemainingBudgets = () => {
    const expenseTotal = categories
      .filter((cat) => cat.type === "EXPENSE")
      .reduce((sum, cat) => sum + (cat.monthlyBudgetAmount || 0), 0);

    const incomeTotal = categories
      .filter((cat) => cat.type === "INCOME")
      .reduce((sum, cat) => sum + (cat.monthlyBudgetAmount || 0), 0);

    setRemainingExpenseBudget(FIXED_BUDGET - expenseTotal);
    setRemainingIncomeBudget(FIXED_BUDGET - incomeTotal);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCategories, fetchedAccounts, fetchedCreditCards] =
          await Promise.all([
            CategoryRepository.findAll(),
            AccountRepository.findAll(),
            CreditCardRepository.findAll(),
          ]);

        setCategories(fetchedCategories);
        setAccounts(fetchedAccounts);
        setCreditCards(fetchedCreditCards);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    setMounted(true);
    fetchData();

    const savedSalary = localStorage.getItem("salary");
    const savedTheme = localStorage.getItem("theme");

    if (savedSalary) setSalary(savedSalary);
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  if (!mounted) return null;

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const floatValue = parseFloat(numericValue) / 100;
    return floatValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setNewCreditCard({
      ...newCreditCard,
      limit: rawValue,
    });
  };

  const handleSalaryChange = (value: string) => {
    setSalary(value);
    localStorage.setItem("salary", value);
  };

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.name && newCategory.monthlyBudgetPercentage) {
      const budgetAmount =
        (newCategory.monthlyBudgetPercentage / 100) * FIXED_BUDGET;
      const remaining =
        newCategory.type === "EXPENSE"
          ? remainingExpenseBudget
          : remainingIncomeBudget;

      if (budgetAmount > remaining) {
        alert(
          `Orçamento excede o valor disponível (R$${remaining.toFixed(2)})`
        );
        return;
      }

      try {
        const categoryToAdd = {
          ...newCategory,
          type: newCategory.type as "EXPENSE" | "INCOME",
          monthlyBudgetAmount: budgetAmount,
        };

        const created = await CategoryRepository.create(categoryToAdd);
        setCategories([...categories, created]);
        setNewCategory({
          name: "",
          color: "#000000",
          type: "EXPENSE",
          monthlyBudgetPercentage: 0,
          monthlyBudgetAmount: 0,
        });
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };

  const handleEditCategory = async () => {
    try {
      if (!editingDialogState.category?._id) return;

      const updated = await CategoryRepository.update(
        editingDialogState.category._id.toString(),
        editingDialogState.category
      );

      if (updated) {
        setCategories(
          categories.map((cat) => (cat._id === updated._id ? updated : cat))
        );
        setEditingDialogState({ isOpen: false, category: null });
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: Types.ObjectId) => {
    try {
      await CategoryRepository.remove(id.toString());
      setCategories(categories.filter((cat) => cat._id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleAddAccount = async () => {
    if (newAccount.institution && newAccount.type) {
      try {
        const created = await AccountRepository.create(newAccount);
        setAccounts([...accounts, created]);
        setNewAccount({
          institution: "",
          type: AccountType.CHECKING,
          description: "",
        });
      } catch (error) {
        console.error("Error adding account:", error);
      }
    }
  };

  const handleDeleteAccount = async (id: Types.ObjectId) => {
    try {
      await AccountRepository.remove(id.toString());
      setAccounts(accounts.filter((account) => account._id !== id));
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleAddCreditCard = async () => {
    if (
      newCreditCard.name &&
      newCreditCard.limit &&
      newCreditCard.closingDate &&
      newCreditCard.dueDate
    ) {
      try {
        if (editingId) {
          setEditingId(null);
        } else {
          const created = await CreditCardRepository.create({
            name: newCreditCard.name,
            limit: Number(newCreditCard.limit),
            closingDate: Number(newCreditCard.closingDate),
            dueDate: Number(newCreditCard.dueDate),
            limitHistory: [
              { date: new Date(), limit: Number(newCreditCard.limit) },
            ],
          });
          setCreditCards([...creditCards, created]);
        }
        setNewCreditCard({
          name: "",
          limit: "",
          closingDate: "",
          dueDate: "",
          limitHistory: "",
        });
      } catch (error) {
        console.error("Error adding credit card:", error);
      }
    }
  };

  const handleEdit = (card: CreditCard) => {
    setNewCreditCard({
      name: card.name,
      limit: card.limit.toString(),
      closingDate: card.closingDate.toString(),
      dueDate: card.dueDate.toString(),
      limitHistory: "",
    });
    setEditingId(card._id);
  };

  const handleDeleteCreditCard = async (id: Types.ObjectId) => {
    try {
      await CreditCardRepository.remove(id.toString());
      setCreditCards(creditCards.filter((creditCard) => creditCard._id !== id));
    } catch (error) {
      console.error("Error deleting credit card:", error);
    }
  };

  const CategoryColumn = ({
    type,
    title,
  }: {
    type: "EXPENSE" | "INCOME";
    title: string;
  }) => {
    const filteredCategories = categories.filter((cat) => cat.type === type);
    const remainingBudget =
      type === "EXPENSE" ? remainingExpenseBudget : remainingIncomeBudget;

    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Orçamento Disponível:{" "}
            {remainingBudget.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div className="space-y-2">
          {filteredCategories.map((category) => (
            <div
              key={category._id.toString()}
              className="flex items-center justify-between rounded-lg border bg-card p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <span className="dark:text-white font-medium">
                    {category.name}
                  </span>
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-300">
                    <span>
                      {(category.monthlyBudgetAmount ?? 0).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )}
                    </span>
                    <span>
                      {(
                        ((category.monthlyBudgetAmount ?? 0) / FIXED_BUDGET) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEditingDialogState({
                      isOpen: true,
                      category: { ...category },
                    })
                  }
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(category._id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Configurações</h1>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="categories" className="flex-1">
            Categorias
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex-1">
            Salário
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex-1">
            Aparência
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex-1">
            Contas
          </TabsTrigger>
          <TabsTrigger value="credit-cards" className="flex-1">
            Cartão de Crédito
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">
                Gerenciar Categorias e Orçamento
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Distribua seu orçamento de{" "}
                {FIXED_BUDGET.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}{" "}
                entre as categorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Input form for new category */}
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Nome da categoria"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, color: e.target.value })
                    }
                    className="w-20"
                  />
                  <Select
                    value={newCategory.type}
                    onValueChange={(value: "INCOME" | "EXPENSE") =>
                      setNewCategory({ ...newCategory, type: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPENSE">Despesa</SelectItem>
                      <SelectItem value="INCOME">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="% do orçamento"
                    value={newCategory.monthlyBudgetPercentage}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        monthlyBudgetPercentage: Number(e.target.value),
                      })
                    }
                    className="w-32"
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {/* Split view for expenses and income */}
                <div className="grid grid-cols-2 gap-8">
                  <CategoryColumn type="EXPENSE" title="Despesas" />
                  <CategoryColumn type="INCOME" title="Receitas" />
                </div>

                <Dialog
                  open={editingDialogState.isOpen}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) {
                      setEditingDialogState({ isOpen: false, category: null });
                    }
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Categoria</DialogTitle>
                    </DialogHeader>
                    {editingDialogState.category && (
                      <div className="space-y-4">
                        <Input
                          placeholder="Nome da categoria"
                          value={editingDialogState.category.name}
                          onChange={(e) =>
                            setEditingDialogState({
                              ...editingDialogState,
                              category: {
                                ...editingDialogState.category!,
                                name: e.target.value,
                              },
                            })
                          }
                        />
                        <Input
                          type="color"
                          value={editingDialogState.category.color}
                          onChange={(e) =>
                            setEditingDialogState({
                              ...editingDialogState,
                              category: {
                                ...editingDialogState.category!,
                                color: e.target.value,
                              },
                            })
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Porcentagem do orçamento"
                          value={
                            ((editingDialogState.category.monthlyBudgetAmount ??
                              0) /
                              FIXED_BUDGET) *
                            100
                          }
                          onChange={(e) => {
                            const percentage = Number(e.target.value);
                            const amount = (percentage / 100) * FIXED_BUDGET;
                            setEditingDialogState({
                              ...editingDialogState,
                              category: {
                                ...editingDialogState.category!,
                                monthlyBudgetAmount: amount,
                              },
                            });
                          }}
                        />
                        <Button onClick={handleEditCategory}>
                          Salvar Alterações
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">
                Configurar Salário
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Define seu salário mensal para melhor controle financeiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="salary" className="dark:text-white">
                  Salário Mensal
                </Label>
                <Input
                  id="salary"
                  type="number"
                  value={salary}
                  onChange={(e) => handleSalaryChange(e.target.value)}
                  placeholder="Digite seu salário"
                  className="dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Este valor será usado para cálculos e relatórios mensais
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Aparência</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Personalize a aparência do seu aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="dark:text-white">Tema Escuro</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    Alterne entre tema claro e escuro
                  </p>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleThemeChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">
                Gerenciar Contas
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Adicione e gerencie suas contas financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Nome da instituição"
                    value={newAccount.institution}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        institution: e.target.value,
                      })
                    }
                    className="flex-1 dark:text-white"
                  />
                  <Select
                    value={newAccount.type}
                    onValueChange={(value: AccountType) =>
                      setNewAccount({ ...newAccount, type: value })
                    }
                  >
                    <SelectTrigger className="w-40 dark:text-white">
                      <SelectValue placeholder="Tipo de conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AccountType.CHECKING}>
                        Conta Corrente
                      </SelectItem>
                      <SelectItem value={AccountType.SAVINGS}>
                        Poupança
                      </SelectItem>
                      <SelectItem value={AccountType.INVESTMENT}>
                        Investimento
                      </SelectItem>
                      <SelectItem value={AccountType.DIGITAL_WALLET}>
                        Carteira Digital
                      </SelectItem>
                      <SelectItem value={AccountType.SPORTSBOOKS}>
                        Casa de Apostas
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Descrição (opcional)"
                    value={newAccount.description || ""}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        description: e.target.value,
                      })
                    }
                    className="flex-1 dark:text-white"
                  />
                  <Button onClick={handleAddAccount}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div
                      key={account._id.toString()}
                      className="p-4 border rounded-lg dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium dark:text-white">
                            {account.institution}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            {account.type}
                          </p>
                          {account.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                              {account.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccount(account._id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit-cards">
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">
                Gerenciar cartões de créditos
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Adicione e gerencie seus cartões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Input Form */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="name" className="mb-2 block">
                      Nome do Cartão
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Nubank"
                      value={newCreditCard.name}
                      onChange={(e) =>
                        setNewCreditCard({
                          ...newCreditCard,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="limit" className="mb-2 block">
                      Limite
                    </Label>
                    <Input
                      id="limit"
                      placeholder="R$ 0,00"
                      value={formatCurrency(newCreditCard.limit)}
                      onChange={handleLimitChange}
                    />
                  </div>
                  <div className="w-[120px]">
                    <Label htmlFor="closingDate" className="mb-2 block">
                      Fechamento
                    </Label>
                    <Input
                      id="closingDate"
                      type="number"
                      placeholder="Dia"
                      min="1"
                      max="31"
                      value={newCreditCard.closingDate}
                      onChange={(e) =>
                        setNewCreditCard({
                          ...newCreditCard,
                          closingDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="w-[120px]">
                    <Label htmlFor="dueDate" className="mb-2 block">
                      Vencimento
                    </Label>
                    <Input
                      id="dueDate"
                      type="number"
                      placeholder="Dia"
                      min="1"
                      max="31"
                      value={newCreditCard.dueDate}
                      onChange={(e) =>
                        setNewCreditCard({
                          ...newCreditCard,
                          dueDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddCreditCard} className="h-10">
                      <Plus className="w-4 h-4 mr-2" />
                      {editingId ? "Atualizar" : "Adicionar"}
                    </Button>
                  </div>
                </div>

                {/* Credit Cards List */}
                <div className="space-y-3 mt-6">
                  {creditCards.map((card) => (
                    <div
                      key={card._id.toString()}
                      className="flex items-center justify-between p-4 rounded-lg border   hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full ">
                          <CreditCardIcon className="w-6 h-6 " />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {card.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Limite: {formatCurrency(card.limit.toString())} |
                            Fecha dia {card.closingDate} | Vence dia{" "}
                            {card.dueDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(card)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCreditCard(card._id)}
                          className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
