import { Injectable } from '@nestjs/common';
import { CreateSavingPlanDto } from './dto/create-saving-plan.dto';
import { UpdateSavingPlanDto } from './dto/update-saving-plan.dto';
import { SavingPlan } from './saving-plans.schema';
import { SavingPlanRepository } from './saving-plans.repository';

@Injectable()
export class SavingPlansService {
  constructor(private readonly savingPlanRepository: SavingPlanRepository) {}

  async create(createSavingPlanDto: CreateSavingPlanDto): Promise<SavingPlan> {
    return this.savingPlanRepository.create(createSavingPlanDto);
  }

  async findAll(): Promise<SavingPlan[]> {
    return this.savingPlanRepository.findAll();
  }

  async findOne(id: string): Promise<SavingPlan | null> {
    return this.savingPlanRepository.findById(id);
  }

  async update(
    id: string,
    updateSavingPlanDto: UpdateSavingPlanDto,
  ): Promise<SavingPlan | null> {
    return this.savingPlanRepository.update(id, updateSavingPlanDto);
  }

  async remove(id: string): Promise<SavingPlan | null> {
    return this.savingPlanRepository.delete(id);
  }

  async findByStatus(
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED',
  ): Promise<SavingPlan[]> {
    return this.savingPlanRepository.findByStatus(status);
  }

  async addInvestment(
    savingPlanId: string,
    transactionId: string,
  ): Promise<SavingPlan | null> {
    return this.savingPlanRepository.addInvestment(savingPlanId, transactionId);
  }
}
