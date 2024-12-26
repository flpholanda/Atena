import axios from "axios";
import apiConfig from "../config/config";
import { Account, AccountType } from "../schemas/account.interface";

const apiUrl = `${apiConfig.apiUrl}/accounts`;

export interface CreateAccountDto {
  institution: string;
  type: AccountType;
  description?: string;
}

export interface UpdateAccountDto {
  institution?: string;
  type?: AccountType;
  description?: string;
}

export class AccountRepository {
  static async create(createAccountDto: CreateAccountDto): Promise<Account> {
    try {
      const response = await axios.post(apiUrl, createAccountDto);
      return response.data;
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  }

  static async findAll(): Promise<Account[]> {
    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw error;
    }
  }

  static async findOne(id: string): Promise<Account | null> {
    try {
      const response = await axios.get(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching account with ID ${id}:`, error);
      throw error;
    }
  }

  static async update(
    id: string,
    updateAccountDto: UpdateAccountDto
  ): Promise<Account | null> {
    try {
      const response = await axios.put(`${apiUrl}/${id}`, updateAccountDto);
      return response.data;
    } catch (error) {
      console.error(`Error updating account with ID ${id}:`, error);
      throw error;
    }
  }

  static async remove(id: string): Promise<Account | null> {
    try {
      const response = await axios.delete(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting account with ID ${id}:`, error);
      throw error;
    }
  }
}
