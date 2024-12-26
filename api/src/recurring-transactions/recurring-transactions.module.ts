import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RecurringTransactionsService } from './recurring-transactions.service';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { RecurringTransactionRepository } from './recurring-transactions.repository';
import {
  RecurringTransaction,
  RecurringTransactionSchema,
} from './recurring-transactions.schema';
import { TransactionsModule } from '../transactions/transactions.module';
import { RecurringTransactionsScheduler } from './recurring-transactions.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecurringTransaction.name, schema: RecurringTransactionSchema },
    ]),
    TransactionsModule,
  ],
  providers: [
    RecurringTransactionsService,
    RecurringTransactionRepository,
    RecurringTransactionsScheduler,
  ],
  controllers: [RecurringTransactionsController],
})
export class RecurringTransactionsModule {}
