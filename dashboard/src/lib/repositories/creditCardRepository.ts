import axios from "axios";
import apiConfig from "../config/config";
import { Types } from "mongoose";

const apiUrl = `${apiConfig.apiUrl}/credit-cards`;

export interface LimitRecord {
  date: Date;
  limit: number;
}

export interface CreateCreditCardDto {
  name: string;
  limit: number;
  closingDate: number;
  dueDate: number;
  limitHistory?: LimitRecord[];
}

export interface UpdateCreditCardDto {
  name?: string;
  limit?: number;
  closingDate?: number;
  dueDate?: number;
  limitHistory?: LimitRecord[];
}

export interface CreditCard {
  _id: Types.ObjectId;
  name: string;
  limit: number;
  closingDate: number;
  dueDate: number;
  limitHistory: LimitRecord[];
}

export class CreditCardRepository {
  static async create(
    createCreditCardDto: CreateCreditCardDto
  ): Promise<CreditCard> {
    try {
      const response = await axios.post(apiUrl, createCreditCardDto);
      return response.data;
    } catch (error) {
      console.error("Error creating credit card:", error);
      throw error;
    }
  }

  static async findAll(): Promise<CreditCard[]> {
    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching credit cards:", error);
      throw error;
    }
  }

  static async findOne(id: string): Promise<CreditCard | null> {
    try {
      const response = await axios.get(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching credit card with ID ${id}:`, error);
      throw error;
    }
  }

  static async update(
    id: string,
    updateCreditCardDto: UpdateCreditCardDto
  ): Promise<CreditCard | null> {
    try {
      const response = await axios.patch(
        `${apiUrl}/${id}`,
        updateCreditCardDto
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating credit card with ID ${id}:`, error);
      throw error;
    }
  }

  static async remove(id: string): Promise<void> {
    try {
      await axios.delete(`${apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting credit card with ID ${id}:`, error);
      throw error;
    }
  }
}
