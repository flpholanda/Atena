import { Injectable } from '@nestjs/common';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { Investment } from './investments.schema';
import { InvestmentRepository } from './investments.repository';

@Injectable()
export class InvestmentService {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async create(createInvestmentDto: CreateInvestmentDto): Promise<Investment> {
    return this.investmentRepository.create(createInvestmentDto);
  }

  async findAll(): Promise<Investment[]> {
    return this.investmentRepository.findAll();
  }

  async findOne(id: string): Promise<Investment | null> {
    return this.investmentRepository.findOneById(id);
  }

  async update(
    id: string,
    updateInvestmentDto: UpdateInvestmentDto,
  ): Promise<Investment | null> {
    return this.investmentRepository.update(id, updateInvestmentDto);
  }

  async remove(id: string): Promise<Investment | null> {
    return this.investmentRepository.delete(id);
  }
}
