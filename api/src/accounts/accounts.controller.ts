import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './account.schema';
import { AccountService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  async findAll(): Promise<Account[]> {
    return this.accountService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Account | null> {
    return this.accountService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account | null> {
    return this.accountService.update(id, updateAccountDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Account | null> {
    return this.accountService.remove(id);
  }
}
