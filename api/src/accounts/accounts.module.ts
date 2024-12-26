import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountsSchema } from './account.schema';
import { AccountsController } from './accounts.controller';
import { AccountService } from './accounts.service';
import { AccountsRepository } from './accounts.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountsSchema }]),
    MongooseModule,
  ],
  controllers: [AccountsController],
  providers: [AccountService, AccountsRepository],
})
export class AccountsModule {}
