import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionRepository } from './transactions.repository';
import { Transaction, TransactionType } from './transactions.schema';
import { CreditCardRepository } from '../credit-cards/credit-cards.repository';
import { Types } from 'mongoose';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly creditCardRepository: CreditCardRepository,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionRepository.create(createTransactionDto);
  }

  async createMany(
    createTransactionDto: CreateTransactionDto[],
  ): Promise<Transaction> {
    return this.transactionRepository.createMany(createTransactionDto);
  }

  async createInstallment(
    createTransactionDto: CreateTransactionDto,
    installments: number,
    interest?: number,
  ): Promise<Transaction[]> {
    if (installments < 1) {
      throw new Error('Number of installments must be greater than 0');
    }

    const {
      account,
      amount,
      description,
      paymentMethod,
      creditCard,
      category,
      status,
    } = createTransactionDto;

    const creditCardId = creditCard.toString();
    const foundCreditCard =
      await this.creditCardRepository.findById(creditCardId);

    if (!foundCreditCard) {
      throw new Error('Credit card not found');
    }

    const finalInterest = interest ?? 1;
    const totalAmount = amount * finalInterest;
    const baseInstallmentAmount = totalAmount / installments;

    const roundedInstallmentAmount =
      Math.floor(baseInstallmentAmount * 100) / 100;
    const totalRoundedAmount = roundedInstallmentAmount * (installments - 1);
    const lastInstallmentAmount =
      Math.round((totalAmount - totalRoundedAmount) * 100) / 100;

    const firstPaymentDate = this.calculateFirstPaymentDate(
      new Date(),
      foundCreditCard.closingDate,
    );
    const transactions: Transaction[] = [];

    for (let i = 0; i < installments; i++) {
      const isLastInstallment = i === installments - 1;
      const installmentAmount = isLastInstallment
        ? lastInstallmentAmount
        : roundedInstallmentAmount;

      const paymentDate = new Date(firstPaymentDate);
      paymentDate.setMonth(firstPaymentDate.getMonth() + i);

      paymentDate.setDate(foundCreditCard.closingDate);

      const daysInMonth = new Date(
        paymentDate.getFullYear(),
        paymentDate.getMonth() + 1,
        0,
      ).getDate();

      if (foundCreditCard.closingDate > daysInMonth) {
        paymentDate.setDate(daysInMonth);
      }

      const transaction = await this.transactionRepository.create({
        account,
        description:
          installments > 1
            ? `${description} (${i + 1}/${installments})`
            : `${description}`,
        amount: installmentAmount,
        paymentMethod,
        creditCard: new Types.ObjectId(creditCardId),
        category,
        status,
        type: TransactionType.EXPENSE,
        paymentDate,
      });

      transactions.push(transaction);
    }

    return transactions;
  }

  private calculateFirstPaymentDate(today: Date, closingDate: number): Date {
    const firstPaymentDate = new Date(today);

    firstPaymentDate.setDate(closingDate);

    if (today.getDate() > closingDate) {
      firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
    }

    return firstPaymentDate;
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }

  async findOne(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findOneById(id);
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    return this.transactionRepository.update(id, updateTransactionDto);
  }

  async remove(id: string): Promise<Transaction | null> {
    return this.transactionRepository.delete(id);
  }
}
