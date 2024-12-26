import { Types } from "mongoose";
import { Category } from "./category.interface";

export interface SavedItem {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category: Types.ObjectId | Category;
  link?: string;
  isPurchased: boolean;
  priority?: number;
  imageUrl?: string;
}
