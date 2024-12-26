// src/recurring-transactions/recurring-transactions.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { RecurringTransactionRepository } from './recurring-transactions.repository';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import {
  TransactionStatus,
  TransactionType,
} from '../transactions/transactions.schema';
import { TransactionsService } from '../transactions/transactions.service';
import {
  RecurrenceType,
  RecurringTransaction,
} from './recurring-transactions.schema';

@Injectable()
export class RecurringTransactionsService {
  constructor(
    private readonly recurringTransactionRepository: RecurringTransactionRepository,
    private readonly transactionService: TransactionsService,
  ) {}

  private calculateNextPaymentDate(
    recurrenceType: RecurrenceType,
    startDate: Date = new Date(),
  ): Date {
    const nextDate = new Date(startDate);
    nextDate.setHours(0, 0, 0, 0);

    switch (recurrenceType) {
      case RecurrenceType.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case RecurrenceType.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case RecurrenceType.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);

        const currentDay = nextDate.getDate();
        const lastDayOfMonth = new Date(
          nextDate.getFullYear(),
          nextDate.getMonth() + 1,
          0,
        ).getDate();

        if (currentDay > lastDayOfMonth) {
          nextDate.setDate(lastDayOfMonth);
        }
        break;
    }

    return nextDate;
  }

  async create(
    createRecurringTransactionDto: CreateRecurringTransactionDto,
  ): Promise<RecurringTransaction> {
    const dto = { ...createRecurringTransactionDto };

    if (!dto.nextPaymentDate) {
      dto.nextPaymentDate = this.calculateNextPaymentDate(dto.recurrenceType);
    }

    const recurringTransaction =
      await this.recurringTransactionRepository.create(dto);

    return recurringTransaction;
  }

  public async generateNewTransactions(
    recurringTransaction: RecurringTransaction,
  ) {
    const { originalTransaction, recurrenceType, nextPaymentDate } =
      recurringTransaction;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paymentDate = new Date(nextPaymentDate);
    paymentDate.setHours(0, 0, 0, 0);

    if (paymentDate.getTime() > today.getTime()) {
      return;
    }

    const transaction = await this.transactionService.findOne(
      originalTransaction.toString(),
    );

    await this.transactionService.create({
      paymentMethod: transaction.paymentMethod,
      paymentDate,
      type: TransactionType.EXPENSE,
      account: transaction.account,
      category: transaction.category,
      creditCard: transaction.creditCard,
      amount: transaction.amount,
      description: transaction.description,
      status: TransactionStatus.PENDING,
    });

    const nextPaymentDateCalc = new Date(paymentDate);

    if (paymentDate.getTime() < today.getTime()) {
      nextPaymentDateCalc.setTime(today.getTime());
    }

    switch (recurrenceType) {
      case RecurrenceType.DAILY:
        nextPaymentDateCalc.setDate(nextPaymentDateCalc.getDate() + 1);
        break;
      case RecurrenceType.WEEKLY:
        nextPaymentDateCalc.setDate(nextPaymentDateCalc.getDate() + 7);
        break;
      case RecurrenceType.MONTHLY:
        const currentDay = paymentDate.getDate();
        nextPaymentDateCalc.setMonth(nextPaymentDateCalc.getMonth() + 1);

        const lastDayOfMonth = new Date(
          nextPaymentDateCalc.getFullYear(),
          nextPaymentDateCalc.getMonth() + 1,
          0,
        ).getDate();

        if (currentDay > lastDayOfMonth) {
          nextPaymentDateCalc.setDate(lastDayOfMonth);
        } else {
          nextPaymentDateCalc.setDate(currentDay);
        }
        break;
    }

    if (nextPaymentDateCalc.getTime() <= today.getTime()) {
      switch (recurrenceType) {
        case RecurrenceType.DAILY:
          nextPaymentDateCalc.setDate(today.getDate() + 1);
          break;
        case RecurrenceType.WEEKLY:
          nextPaymentDateCalc.setDate(today.getDate() + 7);
          break;
        case RecurrenceType.MONTHLY:
          nextPaymentDateCalc.setMonth(today.getMonth() + 1);
          break;
      }
    }

    await this.recurringTransactionRepository.update(
      recurringTransaction._id.toString(),
      {
        lastGeneratedDate: paymentDate,
        nextPaymentDate: nextPaymentDateCalc,
      },
    );
  }

  async findAll(): Promise<RecurringTransaction[]> {
    return this.recurringTransactionRepository.findAll();
  }

  async findOne(id: string): Promise<RecurringTransaction> {
    const recurringTransaction =
      await this.recurringTransactionRepository.findById(id);
    if (!recurringTransaction) {
      throw new NotFoundException(
        `RecurringTransaction with ID ${id} not found`,
      );
    }
    return recurringTransaction;
  }

  async update(
    id: string,
    updateDto: Partial<CreateRecurringTransactionDto>,
  ): Promise<RecurringTransaction> {
    const recurringTransaction =
      await this.recurringTransactionRepository.update(id, updateDto);
    if (!recurringTransaction) {
      throw new NotFoundException(
        `RecurringTransaction with ID ${id} not found`,
      );
    }
    return recurringTransaction;
  }

  async remove(id: string): Promise<RecurringTransaction> {
    const recurringTransaction =
      await this.recurringTransactionRepository.remove(id);
    if (!recurringTransaction) {
      throw new NotFoundException(
        `RecurringTransaction with ID ${id} not found`,
      );
    }
    return recurringTransaction;
  }
}
