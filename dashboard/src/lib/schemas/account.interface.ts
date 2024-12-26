import { Types } from "mongoose";

export enum AccountType {
  CHECKING = "CHECKING",
  SAVINGS = "SAVINGS",
  INVESTMENT = "INVESTMENT",
  DIGITAL_WALLET = "DIGITAL_WALLET",
  SPORTSBOOKS = "SPORTSBOOKS",
}

export interface Account {
  _id: Types.ObjectId;
  institution: string;
  type: AccountType;
  description?: string;
}
