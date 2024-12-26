import { Types } from "mongoose";

export enum RecurrenceType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export interface RecurringTransaction {
  originalTransaction: Types.ObjectId;
  recurrenceType: RecurrenceType;
  recurrenceEndDate?: Date;
  nextPaymentDate?: Date;
  isActive: boolean;
  lastGeneratedDate?: Date;
}
