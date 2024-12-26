import { Types } from "mongoose";
import { Account } from "./account.interface";

export enum InvestmentType {
  STOCK = "STOCK",
  CRYPTO = "CRYPTO",
  BOND = "BOND",
  REAL_ESTATE = "REAL_ESTATE",
  MUTUAL_FUND = "MUTUAL_FUND",
}

export enum InvestmentOperationType {
  BUY = "BUY",
  SELL = "SELL",
}

export interface Investment {
  _id?: Types.ObjectId;
  account: Types.ObjectId | Account;
  type: InvestmentType;
  operationType: InvestmentOperationType;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
  fees?: number;
  operationDate: Date;
  notes?: string;
}
