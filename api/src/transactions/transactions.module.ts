import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction, TransactionSchema } from './transactions.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionRepository } from './transactions.repository';
import {
  CreditCard,
  CreditCardSchema,
} from '../credit-cards/credit-cards.schema';
import { CreditCardRepository } from '../credit-cards/credit-cards.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: CreditCard.name, schema: CreditCardSchema },
    ]),
    MongooseModule,
  ],
  controllers: [TransactionsController],
  exports: [TransactionsService],
  providers: [TransactionsService, TransactionRepository, CreditCardRepository],
})
export class TransactionsModule {}
