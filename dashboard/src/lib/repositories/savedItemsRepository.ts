import axios from "axios";
import apiConfig from "../config/config";
import { Types } from "mongoose";
import { Category } from "../schemas/category.interface";

const apiUrl = apiConfig.apiUrl + "/saved-items";

export interface CreateSavedItemDto {
  name: string;
  description?: string;
  price: number;
  category: Types.ObjectId | Category;
  link?: string;
  isPurchased: boolean;
  priority?: number;
  imageUrl?: string;
}

export interface UpdateSavedItemDto {
  name?: string;
  description?: string;
  price?: number;
  category?: Types.ObjectId | Category;
  link?: string;
  isPurchased?: boolean;
  priority?: number;
  imageUrl?: string;
}

export class SavedItemRepository {
  static async create(createSavedItemDto: CreateSavedItemDto) {
    try {
      console.log(createSavedItemDto);
      const response = await axios.post(apiUrl, createSavedItemDto);
      return response.data;
    } catch (error) {
      console.error("Error creating wishlist item:", error);
      throw error;
    }
  }

  static async createMany(createWishlistItemsDto: CreateSavedItemDto[]) {
    try {
      const response = await axios.post(
        apiUrl + "/many",
        createWishlistItemsDto
      );
      return response.data;
    } catch (error) {
      console.error("Error creating multiple wishlist items:", error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const response = await axios.get(apiUrl);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      throw error;
    }
  }

  static async findOne(id: string) {
    try {
      const response = await axios.get(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching wishlist item with ID ${id}:`, error);
      throw error;
    }
  }

  static async update(id: string, updateSavedItemDto: UpdateSavedItemDto) {
    try {
      const response = await axios.patch(`${apiUrl}/${id}`, updateSavedItemDto);
      return response.data;
    } catch (error) {
      console.error(`Error updating wishlist item with ID ${id}:`, error);
      throw error;
    }
  }

  static async remove(id: string) {
    try {
      const response = await axios.delete(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting wishlist item with ID ${id}:`, error);
      throw error;
    }
  }

  static async findByCategory(categoryId: string) {
    try {
      const response = await axios.get(`${apiUrl}/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching wishlist items by category with ID ${categoryId}:`,
        error
      );
      throw error;
    }
  }

  static async markAsPurchased(id: string) {
    try {
      const response = await axios.patch(`${apiUrl}/${id}/mark-purchased`);
      return response.data;
    } catch (error) {
      console.error(
        `Error marking wishlist item with ID ${id} as purchased:`,
        error
      );
      throw error;
    }
  }
}
