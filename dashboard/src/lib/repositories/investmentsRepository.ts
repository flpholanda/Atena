import axios from "axios";
import apiConfig from "../config/config";
import { Types } from "mongoose";

const apiUrl = `${apiConfig.apiUrl}/investments`;

export enum InvestmentType {
  STOCK = "STOCK",
  CRYPTO = "CRYPTO",
  BOND = "BOND",
  REAL_ESTATE = "REAL_ESTATE",
  MUTUAL_FUND = "MUTUAL_FUND",
}

export enum InvestmentOperationType {
  BUY = "BUY",
  SELL = "SELL",
}

export interface CreateInvestmentDto {
  account: Types.ObjectId;
  type: InvestmentType;
  operationType: InvestmentOperationType;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
  fees?: number;
  operationDate: Date;
  notes?: string;
}

export interface UpdateInvestmentDto {
  account?: Types.ObjectId;
  type?: InvestmentType;
  operationType?: InvestmentOperationType;
  symbol?: string;
  quantity?: number;
  purchasePrice?: number;
  currentPrice?: number;
  fees?: number;
  operationDate?: Date;
  notes?: string;
}

export interface Investment {
  _id: Types.ObjectId;
  account: Types.ObjectId;
  type: InvestmentType;
  operationType: InvestmentOperationType;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
  fees?: number;
  operationDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InvestmentRepository {
  static async create(
    createInvestmentDto: CreateInvestmentDto
  ): Promise<Investment> {
    try {
      const response = await axios.post(apiUrl, createInvestmentDto);
      return response.data;
    } catch (error) {
      console.error("Error creating investment:", error);
      throw error;
    }
  }

  static async findAll(): Promise<Investment[]> {
    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching investments:", error);
      throw error;
    }
  }

  static async findOne(id: string): Promise<Investment | null> {
    try {
      const response = await axios.get(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching investment with ID ${id}:`, error);
      throw error;
    }
  }

  static async update(
    id: string,
    updateInvestmentDto: UpdateInvestmentDto
  ): Promise<Investment | null> {
    try {
      const response = await axios.put(`${apiUrl}/${id}`, updateInvestmentDto);
      return response.data;
    } catch (error) {
      console.error(`Error updating investment with ID ${id}:`, error);
      throw error;
    }
  }

  static async remove(id: string): Promise<void> {
    try {
      await axios.delete(`${apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting investment with ID ${id}:`, error);
      throw error;
    }
  }
}
