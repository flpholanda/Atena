import { Types } from "mongoose";
import { Account } from "./account.interface";
import { Category } from "./category.interface";
import { CreditCard } from "./credit-card.interface";
import { SavingPlan } from "./saving-plan.interface";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
  INVESTMENT = "INVESTMENT",
}

export enum PaymentMethod {
  CASH = "CASH",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  PIX = "PIX",
  OTHER = "OTHER",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export interface Transaction {
  _id: Types.ObjectId;
  account: Types.ObjectId | Account;
  description: string;
  type: TransactionType;
  category: Types.ObjectId | Category;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  paymentDate: Date;
  fromAccount?: Types.ObjectId | Account;
  toAccount?: Types.ObjectId | Account;
  creditCard?: Types.ObjectId | CreditCard;
  savingPlan?: Types.ObjectId | SavingPlan;
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
}
