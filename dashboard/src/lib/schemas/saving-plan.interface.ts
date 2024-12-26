import { Types } from "mongoose";

export type SavingPlanStatus = "ACTIVE" | "COMPLETED" | "PAUSED";

export interface SavingPlanInvestment {
  _id: Types.ObjectId;
  value: number;
  date: Date;
}

export interface SavingPlan {
  _id: Types.ObjectId;
  name: string;
  goal: number;
  status: SavingPlanStatus;
  deadline: Date;
  image?: string;
  investments?: Types.Array<SavingPlanInvestment>;
}
