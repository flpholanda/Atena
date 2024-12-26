import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../categories/categories.schema';
import { CreditCard } from '../credit-cards/credit-cards.schema';
import { Account } from '../accounts/account.schema';
import { SavingPlan } from '../saving-plans/saving-plans.schema';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  INVESTMENT = 'INVESTMENT',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PIX = 'PIX',
  OTHER = 'OTHER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId;

  @Prop()
  description: string;

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;

  @Prop({ required: true, type: Types.ObjectId, ref: Category.name })
  category: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: Object.values(PaymentMethod) })
  paymentMethod: PaymentMethod;

  @Prop({ required: true, enum: Object.values(TransactionStatus) })
  status: TransactionStatus;

  @Prop({ required: true })
  paymentDate?: Date;

  @Prop({ type: Types.ObjectId, ref: Account.name })
  fromAccount?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Account.name })
  toAccount?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: CreditCard.name })
  creditCard?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: SavingPlan.name })
  savingPlan: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
