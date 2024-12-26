// src/recurring-transactions/

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RecurringTransactionsService } from './recurring-transactions.service';

@Injectable()
export class RecurringTransactionsScheduler {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Cron('*/1 * * * *')
  async handleRecurringTransactions() {
    const recurringTransactions =
      await this.recurringTransactionsService.findAll();

    for (const recurringTransaction of recurringTransactions) {
      await this.recurringTransactionsService.generateNewTransactions(
        recurringTransaction,
      );
    }
  }
}
