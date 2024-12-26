import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account } from './account.schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsRepository {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const createdAccount = new this.accountModel(createAccountDto);
    return createdAccount.save();
  }

  async findAll(): Promise<Account[]> {
    return this.accountModel.find().exec();
  }

  async findById(id: string): Promise<Account | null> {
    return this.accountModel.findById(id).exec();
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account | null> {
    return this.accountModel
      .findByIdAndUpdate(id, updateAccountDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Account | null> {
    return this.accountModel.findByIdAndDelete(id).exec();
  }
}
