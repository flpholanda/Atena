import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/base.repository';
import { SavingPlan } from './saving-plans.schema';

@Injectable()
export class SavingPlanRepository extends BaseRepository<SavingPlan> {
  constructor(
    @InjectModel(SavingPlan.name)
    private readonly savingPlanModel: Model<SavingPlan>,
  ) {
    super(savingPlanModel);
  }

  async findByStatus(
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED',
  ): Promise<SavingPlan[]> {
    return this.savingPlanModel.find({ status }).exec();
  }

  async findByGoal(goal: number): Promise<SavingPlan[]> {
    return this.savingPlanModel.find({ goal }).exec();
  }

  async addInvestment(
    savingPlanId: string,
    transactionId: string,
  ): Promise<SavingPlan | null> {
    return this.savingPlanModel
      .findByIdAndUpdate(
        savingPlanId,
        { $push: { investments: transactionId } },
        { new: true },
      )
      .exec();
  }
}
