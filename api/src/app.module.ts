import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { SavingPlansModule } from './saving-plans/saving-plans.module';
import { SavedItemsModule } from './saved-items/saved-items.module';
import { InvestmentsRepository } from './investments/investments.module';
import { AccountsModule } from './accounts/accounts.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    CategoriesModule,
    TransactionsModule,
    CreditCardsModule,
    CreditCardsModule,
    SavingPlansModule,
    SavedItemsModule,
    InvestmentsRepository,
    AccountsModule,
    RecurringTransactionsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
