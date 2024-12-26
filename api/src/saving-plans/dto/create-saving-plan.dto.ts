import { Types } from 'mongoose';
import { SavingPlanInvestment } from '../saving-plans.schema';

export class CreateSavingPlanDto {
  name: string;
  goal: number;
  deadline: Date;
  image?: string;
  investments: Types.Array<SavingPlanInvestment>;
}
