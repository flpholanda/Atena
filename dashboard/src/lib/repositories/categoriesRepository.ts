import axios from "axios";
import apiConfig from "../config/config";
const apiUrl = apiConfig.apiUrl + "/categories";

export interface CreateCategoryDto {
  name: string;
  icon?: string;
  color: string;
  type: "INCOME" | "EXPENSE";
  monthlyLimit?: number;
}

export interface updateCategoryDto {
  name?: string;
  icon?: string;
  color?: string;
  type?: "INCOME" | "EXPENSE";
  monthlyLimit?: number;
}

export class CategoryRepository {
  static async create(createCategoryDto: CreateCategoryDto) {
    try {
      const response = await axios.post(apiUrl, createCategoryDto);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  static async findOne(id: string) {
    try {
      const response = await axios.get(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw error;
    }
  }

  static async update(id: string, updateCategoryDto: updateCategoryDto) {
    try {
      const response = await axios.patch(`${apiUrl}/${id}`, updateCategoryDto);
      return response.data;
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error);
      throw error;
    }
  }

  static async remove(id: string) {
    try {
      const response = await axios.delete(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      throw error;
    }
  }
}
