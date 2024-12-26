"use client";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShoppingCartIcon,
  Plus,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Types } from "mongoose";
import { SavedItem } from "../../lib/schemas/saved-item.interface";
import { Category } from "../../lib/schemas/category.interface";
import { CategoryRepository } from "../../lib/repositories/categoriesRepository";
import {
  CreateSavedItemDto,
  SavedItemRepository,
} from "../../lib/repositories/savedItemsRepository";
import Image from "next/image";
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "../../lib/schemas/transaction.interface";
import TransactionsForm from "../../components/Transaction/TransactionForm";
import { AccountRepository } from "../../lib/repositories/accountsRepository";
import {
  CreditCard,
  CreditCardRepository,
} from "../../lib/repositories/creditCardRepository";
import { SavingPlansRepository } from "../../lib/repositories/savingPlansRepository";
import { Account } from "../../lib/schemas/account.interface";
import { SavingPlan } from "../../lib/schemas/saving-plan.interface";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function SavedItems() {
  const [SavedItemItems, setSavedItemItems] = useState<SavedItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortedItems, setSortedItems] = useState<SavedItem[]>([]);
  const [sortKey, setSortKey] = useState<keyof SavedItem>("priority");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [savingPlans, setSavingPlans] = useState<SavingPlan[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    priority: "3",
    category: "",
    link: "",
    imageUrl: "",
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [
        itemsResponse,
        categoriesResponse,
        accountResponse,
        creditCardResponse,
        savingPlansResponse,
      ] = await Promise.all([
        SavedItemRepository.findAll(),
        CategoryRepository.findAll(),
        AccountRepository.findAll(),
        CreditCardRepository.findAll(),
        SavingPlansRepository.findAll(),
      ]);

      setSavedItemItems(Array.isArray(itemsResponse) ? itemsResponse : []);
      setAccounts(accountResponse);
      setCreditCards(creditCardResponse);
      setSavingPlans(savingPlansResponse);
      setCategories(
        Array.isArray(categoriesResponse) ? categoriesResponse : []
      );
      setError(null);
    } catch (err) {
      setError("Erro ao carregar os dados. Por favor, tente novamente.");
      console.error("Error fetching data:", err);
      setSavedItemItems([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const sorted = [...SavedItemItems].sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];

      if (valueA === undefined) return 1;
      if (valueB === undefined) return -1;

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setSortedItems(sorted);
  }, [SavedItemItems, sortKey, sortDirection]);

  const handleSort = (key: keyof SavedItem) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { [key: string]: string } = {};
    if (!newItem.category) errors.category = "Selecione uma categoria";
    if (!newItem.name) errors.name = "Digite um nome";
    if (!newItem.price) errors.price = "Digite um preço";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const formData: CreateSavedItemDto = {
        ...newItem,
        category: new Types.ObjectId(newItem.category),
        price: parseFloat(newItem.price),
        priority: parseInt(newItem.priority),
        isPurchased: false,
      };

      const response = await SavedItemRepository.create(formData);
      if (response) {
        setSavedItemItems((prev) => [...prev, response]);
        setIsModalOpen(false);
        setNewItem({
          name: "",
          description: "",
          price: "",
          priority: "3",
          category: "",
          link: "",
          imageUrl: "",
        });
      }
    } catch (err) {
      console.error("Error creating item:", err);
      setFormErrors({ submit: "Erro ao criar o item. Tente novamente." });
    }
  };

  const findCategory = (categoryId: Types.ObjectId | string) => {
    const category = categories.find(
      (cat) => cat._id?.toString() === categoryId?.toString()
    );
    return category;
  };

  const handlePurchaseClick = (item: SavedItem) => {
    setSelectedItem(item);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseComplete = async (itemId: string) => {
    console.log(itemId);
    try {
      setSavedItemItems((items) =>
        items.map((item) =>
          item._id?.toString() === itemId
            ? { ...item, isPurchased: true }
            : item
        )
      );
    } catch (err) {
      console.error("Error marking item as purchased:", err);
      setError(
        "Erro ao marcar o item como comprado. Por favor, tente novamente."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-neutral-400">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  const getPriorityBadge = (priority: number) => {
    const styles: { [key: number]: string } = {
      1: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
      2: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      3: "bg-neutral-500/10 text-neutral-500 hover:bg-neutral-500/20",
    };

    const labels: { [key: number]: string } = {
      1: "Alta",
      2: "Média",
      3: "Baixa",
    };

    return (
      <Badge variant="outline" className={styles[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold"></h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" /> Novo Item
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 border-b border-neutral-800 bg-neutral-900/50">
            {[
              { label: "Nome", key: "name", cols: 4 },
              { label: "Categoria", key: "category", cols: 2 },
              { label: "Preço", key: "price", cols: 2 },
              { label: "Prioridade", key: "priority", cols: 2 },
              { label: "Ações", key: null, cols: 2 },
            ].map(({ label, key, cols }) => (
              <div key={label + Math.random()} className={`col-span-${cols}`}>
                <div
                  className={`px-4 py-3 text-sm font-medium ${
                    key ? "cursor-pointer hover:text-neutral-200" : ""
                  }`}
                  onClick={() => key && handleSort(key as keyof SavedItem)}
                >
                  <div className="flex items-center gap-2">
                    {label}
                    {key &&
                      sortKey === key &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedItems.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              Nenhum item na lista de desejos
            </div>
          ) : (
            sortedItems.map((item) => {
              const category = findCategory(item.category._id);
              return (
                <div
                  key={item._id?.toString()}
                  className="grid grid-cols-12 items-center p-4 border-b border-neutral-800 hover:bg-neutral-900/50 transition-all"
                >
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-neutral-800">
                      <Image
                        src={item.imageUrl || "/api/placeholder/64/64"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-neutral-400 line-clamp-2">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-neutral-400">
                    {category?.name || "Sem categoria"}
                  </div>
                  <div className="col-span-2 text-center font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.price)}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {item.priority !== undefined &&
                      getPriorityBadge(item.priority)}
                  </div>
                  <div className="col-span-2 flex justify-center gap-2">
                    {item.link && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePurchaseClick(item)}
                      className={item.isPurchased ? "text-emerald-500" : ""}
                    >
                      <ShoppingCartIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Item</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                required
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                name="description"
                value={newItem.description}
                onChange={handleInputChange}
                rows={3}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço</Label>
                <Input
                  type="number"
                  name="price"
                  value={newItem.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <Label>Prioridade</Label>
                <Select
                  value={newItem.priority}
                  onValueChange={(value) =>
                    setNewItem((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Alta</SelectItem>
                    <SelectItem value="2">Média</SelectItem>
                    <SelectItem value="3">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label>Categoria</Label>
              <Select
                value={newItem.category}
                onValueChange={(value) =>
                  setNewItem((prev) => ({ ...prev, category: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category._id?.toString()}
                      value={category._id?.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label>Link</Label>
              <Input
                type="url"
                name="link"
                value={newItem.link}
                onChange={handleInputChange}
                placeholder="https://"
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label>URL da Imagem</Label>
              <Input
                type="url"
                name="imageUrl"
                value={newItem.imageUrl}
                onChange={handleInputChange}
                placeholder="https://"
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Adicionar Item</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {selectedItem && (
        <TransactionsForm
          isOpen={isPurchaseModalOpen}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setSelectedItem(null);
          }}
          onSuccess={() => {
            handlePurchaseComplete(selectedItem._id.toString());
          }}
          accounts={accounts}
          creditCards={creditCards}
          categories={categories}
          savingPlans={savingPlans}
          mode="create"
          transactionType={TransactionType.EXPENSE}
          existingTransaction={{
            _id: new Types.ObjectId(),
            description: selectedItem.name,
            amount: selectedItem.price,
            type: TransactionType.EXPENSE,
            category: selectedItem.category._id,
            paymentDate: new Date(),
            status: TransactionStatus.COMPLETED,
            paymentMethod: PaymentMethod.PIX,
            account: accounts[0],
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
        />
      )}
    </div>
  );
}
