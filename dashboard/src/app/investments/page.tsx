"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Investment,
  InvestmentOperationType,
  InvestmentRepository,
  InvestmentType,
} from "../../lib/repositories/investmentsRepository";

const InvestmentList = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterOperation, setFilterOperation] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const data = await InvestmentRepository.findAll();
      setInvestments(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch investments. Please try again later.");
      console.error("Error fetching investments:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeColor = (type: InvestmentType) => {
    const colors = {
      [InvestmentType.STOCK]: "bg-blue-500",
      [InvestmentType.CRYPTO]: "bg-yellow-500",
      [InvestmentType.BOND]: "bg-green-500",
      [InvestmentType.REAL_ESTATE]: "bg-purple-500",
      [InvestmentType.MUTUAL_FUND]: "bg-orange-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const getOperationBadgeColor = (operation: InvestmentOperationType) => {
    return operation === InvestmentOperationType.BUY
      ? "bg-green-500"
      : "bg-red-500";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US").format(new Date(date));
  };

  const filteredInvestments = investments.filter((investment) => {
    const matchesType = filterType === "ALL" || investment.type === filterType;
    const matchesOperation =
      filterOperation === "ALL" || investment.operationType === filterOperation;
    const matchesSearch =
      investment.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesOperation && matchesSearch;
  });

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Investments</CardTitle>
        <div className="flex gap-4 mt-4">
          <Input
            placeholder="Search by symbol or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {Object.values(InvestmentType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterOperation} onValueChange={setFilterOperation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Operations</SelectItem>
              {Object.values(InvestmentOperationType).map((operation) => (
                <SelectItem key={operation} value={operation}>
                  {operation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvestments.map((investment) => (
              <TableRow key={investment._id.toString()}>
                <TableCell>
                  <Badge className={`${getTypeBadgeColor(investment.type)}`}>
                    {investment.type.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${getOperationBadgeColor(investment.operationType)}`}
                  >
                    {investment.operationType}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {investment.symbol}
                </TableCell>
                <TableCell>{investment.quantity}</TableCell>
                <TableCell>
                  {formatCurrency(investment.purchasePrice)}
                </TableCell>
                <TableCell>
                  {investment.currentPrice
                    ? formatCurrency(investment.currentPrice)
                    : "-"}
                </TableCell>
                <TableCell>
                  {investment.fees ? formatCurrency(investment.fees) : "-"}
                </TableCell>
                <TableCell>{formatDate(investment.operationDate)}</TableCell>
                <TableCell>{investment.notes || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InvestmentList;
