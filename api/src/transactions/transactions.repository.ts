import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './transactions.schema';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const createdTransaction = new this.transactionModel(createTransactionDto);
    return createdTransaction.save();
  }

  async createMany(
    createTransactionDto: CreateTransactionDto[],
  ): Promise<Transaction> {
    const createdTransaction = new this.transactionModel(createTransactionDto);
    return createdTransaction.save();
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel.find().exec();
  }

  async findOneById(id: string): Promise<Transaction | null> {
    return this.transactionModel.findById(id).exec();
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    return this.transactionModel
      .findByIdAndUpdate(id, updateTransactionDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Transaction | null> {
    return this.transactionModel.findByIdAndDelete(id).exec();
  }
}
