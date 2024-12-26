import { Types } from "mongoose";

export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  _id: Types.ObjectId;
  name: string;
  icon?: string;
  color: string;
  type: CategoryType;
  monthlyBudgetAmount?: number;
  monthlyBudgetPercentage?: number;
}
