"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  AlertCircle,
  Search,
  Calendar,
  ChevronDown,
} from "lucide-react";
import {
  PaymentMethod,
  Transaction,
  TransactionStatus,
} from "../../lib/schemas/transaction.interface";
import { TransactionRepository } from "../../lib/repositories/transactionsRepository";
import { useTransactionsStore } from "../../store/useTransactionsStore";
import { findCategory, getPaymentMethodLabel } from "../../components/utils";
import { useCategoriesStore } from "../../store/useCategoriesStore";
import TransactionListSkeleton from "../../components/Skeleton/TransactionListSkeleton";

const TransactionList: React.FC = () => {
  const { transactions, fetchTransactions, deleteTransaction } =
    useTransactionsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [sortKey, setSortKey] = useState<keyof Transaction>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [, setShowFilterMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    show: boolean;
    transactionId: string | null;
  }>({ show: false, transactionId: null });
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    paymentMethod: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  useEffect(() => {
    setLoading(true);
    setSortKey("createdAt");
    fetchCategories();
    fetchTransactions();
    setLoading(false);
  }, [fetchTransactions, fetchCategories]);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions, sortKey, sortDirection, searchTerm]);

  if (loading) {
    return <TransactionListSkeleton />;
  }

  const applyFilters = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(searchLower) ||
          t.category.toString().toLowerCase().includes(searchLower)
      );
    }

    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }
    if (filters.category) {
      filtered = filtered.filter(
        (t) => t.category.toString() === filters.category
      );
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter(
        (t) => t.paymentMethod === filters.paymentMethod
      );
    }
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortKey] ?? "";
      let bValue = b[sortKey] ?? "";

      if (sortKey === "amount") {
        aValue = a.type === "EXPENSE" ? -a.amount : a.amount;
        bValue = b.type === "EXPENSE" ? -b.amount : b.amount;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    filterTransactionsByMonth(filtered, currentMonth);
  };

  const filterTransactionsByMonth = (
    transactions: Transaction[],
    date: Date
  ) => {
    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.paymentDate!);
      return (
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear()
      );
    });
    setFilteredTransactions(filtered);
  };

  const handleSort = (key: keyof Transaction) => {
    setSortDirection(
      sortKey === key && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortKey(key);
  };

  const handleStatusChange = async (
    transactionId: string,
    newStatus: string
  ) => {
    try {
      await TransactionRepository.update(transactionId, {
        status: newStatus as TransactionStatus,
      });
      const updatedTransactions = transactions.map((t) =>
        t._id.toString() === transactionId
          ? { ...t, status: newStatus as TransactionStatus }
          : t
      );
      useTransactionsStore.setState({ transactions: updatedTransactions });
    } catch (error) {
      console.error("Error updating transaction status:", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmModal({ show: true, transactionId: id });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmModal.transactionId) {
      try {
        await TransactionRepository.remove(deleteConfirmModal.transactionId);
        deleteTransaction(deleteConfirmModal.transactionId);
        filterTransactionsByMonth(transactions, currentMonth);
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
    setDeleteConfirmModal({ show: false, transactionId: null });
  };

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-[1920px] mx-auto p-8">
        {/* Header Section */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex flex-col gap-8">
              {/* Title and Month Navigation */}
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 w-full max-w-md mx-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(currentMonth);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCurrentMonth(newDate);
                      filterTransactionsByMonth(transactions, newDate);
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <Select
                    value={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
                    onValueChange={(value) => {
                      const [month, year] = value.split("-");
                      const newDate = new Date(parseInt(year), parseInt(month));
                      setCurrentMonth(newDate);
                      filterTransactionsByMonth(transactions, newDate);
                    }}
                  >
                    <SelectTrigger className="flex-1 text-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <SelectValue>
                          {months[currentMonth.getMonth()]}{" "}
                          {currentMonth.getFullYear()}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem
                          key={index}
                          value={`${index}-${currentMonth.getFullYear()}`}
                        >
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(currentMonth);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setCurrentMonth(newDate);
                      filterTransactionsByMonth(transactions, newDate);
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 max-w-4xl mx-auto w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 px-6">
                      <Filter className="mr-2 h-5 w-5" />
                      Filtros
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72">
                    <DropdownMenuLabel>Tipo de Transação</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={filters.type}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <DropdownMenuRadioItem value="INCOME">
                        Entrada
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="EXPENSE">
                        Saída
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={filters.status}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <DropdownMenuRadioItem value="COMPLETED">
                        Completado
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="PENDING">
                        Pendente
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="CANCELED">
                        Cancelado
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Método de Pagamento</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={filters.paymentMethod}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          paymentMethod: value,
                        }))
                      }
                    >
                      {Object.values(PaymentMethod).map((method) => (
                        <DropdownMenuRadioItem key={method} value={method}>
                          {method}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>

                    <DropdownMenuSeparator />

                    <div className="p-2">
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          setFilters({
                            type: "",
                            category: "",
                            paymentMethod: "",
                            status: "",
                          });
                          setShowFilterMenu(false);
                        }}
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="w-[100px] text-center">
                    Status
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      Data
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortDirection === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction._id.toString()}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            transaction.type === "INCOME"
                              ? "bg-emerald-500/10"
                              : "bg-red-500/10"
                          }`}
                        >
                          {transaction.type === "INCOME" ? (
                            <ArrowUpRight
                              className="text-emerald-500"
                              size={20}
                            />
                          ) : (
                            <ArrowDownLeft className="text-red-500" size={20} />
                          )}
                        </div>
                        <span>
                          {transaction.type === "INCOME" ? "Entrada" : "Saída"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.description || "-"}</TableCell>
                    <TableCell>
                      {findCategory(categories, transaction.category.toString())
                        ?.name || "Unknown Category"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          transaction.type === "INCOME"
                            ? "text-emerald-500"
                            : "text-red-500"
                        }
                      >
                        R${" "}
                        {transaction.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getPaymentMethodLabel(transaction.paymentMethod)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={transaction.status}
                        onValueChange={(value) =>
                          handleStatusChange(transaction._id.toString(), value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              {transaction.status === "COMPLETED" && (
                                <CheckCircle2
                                  className="text-emerald-500"
                                  size={16}
                                />
                              )}
                              {transaction.status === "PENDING" && (
                                <Clock className="text-yellow-500" size={16} />
                              )}
                              {transaction.status === "CANCELED" && (
                                <XCircle className="text-red-500" size={16} />
                              )}
                              {transaction.status === "COMPLETED" &&
                                "Completado"}
                              {transaction.status === "PENDING" && "Pendente"}
                              {transaction.status === "CANCELED" && "Cancelado"}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COMPLETED">
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                className="text-emerald-500"
                                size={16}
                              />
                              Completado
                            </div>
                          </SelectItem>
                          <SelectItem value="PENDING">
                            <div className="flex items-center gap-2">
                              <Clock className="text-yellow-500" size={16} />
                              Pendente
                            </div>
                          </SelectItem>
                          <SelectItem value="CANCELED">
                            <div className="flex items-center gap-2">
                              <XCircle className="text-red-500" size={16} />
                              Cancelado
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.paymentDate).toLocaleDateString(
                        "pt-BR"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDeleteClick(transaction._id.toString())
                        }
                        className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-[400px]">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <XCircle size={24} />
                        <p>
                          Nenhuma transação encontrada para os filtros
                          selecionados.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <span className="text-sm text-muted-foreground">
                Mostrando {paginatedTransactions.length} de{" "}
                {filteredTransactions.length} transações
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmModal.show}
          onOpenChange={(open) =>
            !open && setDeleteConfirmModal({ show: false, transactionId: null })
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="text-red-500 h-5 w-5" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta transação? Esta ação não
                pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() =>
                  setDeleteConfirmModal({ show: false, transactionId: null })
                }
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TransactionList;
