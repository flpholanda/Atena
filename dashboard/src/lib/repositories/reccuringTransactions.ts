// src/recurring-transactions/recurring-transactions.repository.ts

import axios from "axios";

import apiConfig from "../config/config";
import {
  RecurrenceType,
  RecurringTransaction,
} from "../schemas/reccuring-transactions.interface";
import { Types } from "mongoose";

const apiUrl = `${apiConfig.apiUrl}/recurring-transactions`;

export interface CreateRecurringTransactionDto {
  originalTransaction: Types.ObjectId;
  recurrenceType: RecurrenceType;
  recurrenceEndDate?: Date;
  nextPaymentDate?: Date;
  isActive?: boolean;
}

export interface UpdateRecurringTransactionDto {
  originalTransaction?: Types.ObjectId;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: Date;
  nextPaymentDate?: Date;
  isActive?: boolean;
}

export class RecurringTransactionRepository {
  static async create(
    createRecurringTransactionDto: CreateRecurringTransactionDto
  ): Promise<RecurringTransaction> {
    try {
      const response = await axios.post(apiUrl, createRecurringTransactionDto);
      return response.data;
    } catch (error) {
      console.error("Error creating recurring transaction:", error);
      throw error;
    }
  }

  static async findAll(): Promise<RecurringTransaction[]> {
    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching recurring transactions:", error);
      throw error;
    }
  }

  static async findOne(id: string): Promise<RecurringTransaction | null> {
    try {
      const response = await axios.get(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching recurring transaction with ID ${id}:`,
        error
      );
      throw error;
    }
  }

  static async update(
    id: string,
    updateRecurringTransactionDto: Partial<CreateRecurringTransactionDto>
  ): Promise<RecurringTransaction | null> {
    try {
      const response = await axios.patch(
        `${apiUrl}/${id}`,
        updateRecurringTransactionDto
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating recurring transaction with ID ${id}:`,
        error
      );
      throw error;
    }
  }

  static async remove(id: string): Promise<void> {
    try {
      await axios.delete(`${apiUrl}/${id}`);
    } catch (error) {
      console.error(
        `Error deleting recurring transaction with ID ${id}:`,
        error
      );
      throw error;
    }
  }
}
