// src/recurring-transactions/recurring-transactions.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { RecurringTransaction } from './recurring-transactions.schema';

@Injectable()
export class RecurringTransactionRepository {
  constructor(
    @InjectModel(RecurringTransaction.name)
    private readonly recurringTransactionModel: Model<RecurringTransaction>,
  ) {}

  async create(
    createRecurringTransactionDto: CreateRecurringTransactionDto,
  ): Promise<RecurringTransaction> {
    const recurringTransaction = new this.recurringTransactionModel(
      createRecurringTransactionDto,
    );
    return recurringTransaction.save();
  }

  async findAll(): Promise<RecurringTransaction[]> {
    return this.recurringTransactionModel.find().exec();
  }

  async findById(id: string): Promise<RecurringTransaction | null> {
    return this.recurringTransactionModel.findById(id).exec();
  }

  async update(
    id: string,
    updateDto: Partial<CreateRecurringTransactionDto>,
  ): Promise<RecurringTransaction | null> {
    return this.recurringTransactionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<RecurringTransaction | null> {
    return this.recurringTransactionModel.findByIdAndDelete(id).exec();
  }
}
