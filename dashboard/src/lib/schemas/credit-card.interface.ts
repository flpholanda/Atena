import { Types } from "mongoose";

export class LimitRecord {
  date: Date;
  limit: number;

  constructor(date: Date, limit: number) {
    this.date = date;
    this.limit = limit;
  }
}

export interface CreditCard {
  _id: Types.ObjectId;
  name: string;
  limit: number;
  closingDate: number;
  dueDate: number;
  limitHistory: LimitRecord[];
}
