import axios from "axios";
import apiConfig from "../config/config";
import { Types } from "mongoose";
import { Account } from "../schemas/account.interface";
import { Category } from "../schemas/category.interface";
import {
  PaymentMethod,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../schemas/transaction.interface";
import { CreditCard } from "../schemas/credit-card.interface";
import { SavingPlan } from "../schemas/saving-plan.interface";

const apiUrl = `${apiConfig.apiUrl}/transactions`;

export interface CreateTransactionDto {
  account: Types.ObjectId | Account;
  description?: string;
  type: TransactionType;
  category: Types.ObjectId | Category;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  paymentDate?: Date;
  fromAccount?: Types.ObjectId | Account;
  toAccount?: Types.ObjectId | Account;
  creditCard?: Types.ObjectId | CreditCard;
  savingPlan?: Types.ObjectId | SavingPlan;
}

export interface UpdateTransactionDto {
  account?: Types.ObjectId | Account;
  description?: string;
  type?: TransactionType;
  category?: Types.ObjectId | Category;
  amount?: number;
  paymentMethod?: PaymentMethod;
  status?: TransactionStatus;
  paymentDate?: Date;
  fromAccount?: Types.ObjectId | Account;
  toAccount?: Types.ObjectId | Account;
  creditCard?: Types.ObjectId | CreditCard;
  savingPlan?: Types.ObjectId | SavingPlan;
}

export class TransactionRepository {
  static async create(
    createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    try {
      console.log("created:" + createTransactionDto);
      const response = await axios.post(apiUrl, createTransactionDto);

      return response.data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  static async createInstallment(
    createTransactionDto: CreateTransactionDto,
    installment: number,
    interest?: number
  ): Promise<Transaction> {
    console.log("created:" + createTransactionDto);
    try {
      const response = await axios.post(
        `${apiUrl}/installment/${installment}/${interest || ""}`,
        createTransactionDto
      );
      return response.data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  static async createMany(
    createTransactionDtos: CreateTransactionDto[]
  ): Promise<Transaction[]> {
    try {
      const response = await axios.post(
        `${apiUrl}/batch`,
        createTransactionDtos
      );
      return response.data;
    } catch (error) {
      console.error("Error creating transactions in batch:", error);
      throw error;
    }
  }

  static async findAll(): Promise<Transaction[]> {
    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  static async findOne(id: string): Promise<Transaction> {
    try {
      const response = await axios.get(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction with ID ${id}:`, error);
      throw error;
    }
  }

  static async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto
  ): Promise<Transaction> {
    try {
      const response = await axios.patch(
        `${apiUrl}/${id}`,
        updateTransactionDto
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating transaction with ID ${id}:`, error);
      throw error;
    }
  }

  static async remove(id: string): Promise<void> {
    try {
      await axios.delete(`${apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting transaction with ID ${id}:`, error);
      throw error;
    }
  }
}
