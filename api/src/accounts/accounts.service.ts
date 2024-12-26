import { Injectable } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './account.schema';

@Injectable()
export class AccountService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountsRepository.create(createAccountDto);
  }

  async findAll(): Promise<Account[]> {
    return this.accountsRepository.findAll();
  }

  async findOne(id: string): Promise<Account | null> {
    return this.accountsRepository.findById(id);
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account | null> {
    return this.accountsRepository.update(id, updateAccountDto);
  }

  async remove(id: string): Promise<Account | null> {
    return this.accountsRepository.delete(id);
  }
}
