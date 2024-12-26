import axios from "axios";
import apiConfig from "../config/config";
import {
  SavingPlan,
  SavingPlanInvestment,
  SavingPlanStatus,
} from "../schemas/saving-plan.interface";
import { Types } from "mongoose";

const apiUrl = apiConfig.apiUrl + "/saving-plans";

export interface CreateSavingPlanDto {
  name: string;
  goal: number;
  status: SavingPlanStatus;
  deadline: Date;
  image?: string;
  investments?: Types.Array<SavingPlanInvestment>;
}

export interface UpdateSavingPlanDto {
  name?: string;
  goal?: number;
  status?: SavingPlanStatus;
  deadline?: Date;
  image?: string;
  investments?: SavingPlanInvestment[];
}

export class SavingPlansRepository {
  static async create(
    createSavingPlanDto: CreateSavingPlanDto
  ): Promise<SavingPlan> {
    try {
      const response = await axios.post(apiUrl, createSavingPlanDto);
      return response.data;
    } catch (error) {
      console.error("Error creating saving plan:", error);
      throw error;
    }
  }

  static async findAll(): Promise<SavingPlan[]> {
    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching saving plans:", error);
      throw error;
    }
  }

  static async findOne(id: string): Promise<SavingPlan> {
    try {
      const response = await axios.get(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching saving plan with ID ${id}:`, error);
      throw error;
    }
  }

  static async update(
    id: string,
    updateSavingPlanDto: UpdateSavingPlanDto
  ): Promise<SavingPlan> {
    try {
      const response = await axios.patch(
        `${apiUrl}/${id}`,
        updateSavingPlanDto
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating saving plan with ID ${id}:`, error);
      throw error;
    }
  }

  static async remove(id: string): Promise<SavingPlan> {
    try {
      const response = await axios.delete(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting saving plan with ID ${id}:`, error);
      throw error;
    }
  }
}
