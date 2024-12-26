import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investment } from './investments.schema';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

@Injectable()
export class InvestmentRepository {
  constructor(
    @InjectModel(Investment.name)
    private readonly investmentModel: Model<Investment>,
  ) {}

  async create(createInvestmentDto: CreateInvestmentDto): Promise<Investment> {
    const createdInvestment = new this.investmentModel(createInvestmentDto);
    return createdInvestment.save();
  }

  async findAll(): Promise<Investment[]> {
    return this.investmentModel.find().exec();
  }

  async findOneById(id: string): Promise<Investment | null> {
    return this.investmentModel.findById(id).exec();
  }

  async update(
    id: string,
    updateInvestmentDto: UpdateInvestmentDto,
  ): Promise<Investment | null> {
    return this.investmentModel
      .findByIdAndUpdate(id, updateInvestmentDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Investment | null> {
    return this.investmentModel.findByIdAndDelete(id).exec();
  }
}
