// src/recurring-transactions/recurring-transactions.schema.ts

import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transaction } from '../transactions/transactions.schema';

export enum RecurrenceType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

@Schema({ timestamps: true, collection: 'recurring_transactions' })
export class RecurringTransaction extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: Transaction.name })
  originalTransaction: Types.ObjectId;

  @Prop({ required: true, enum: RecurrenceType })
  recurrenceType: RecurrenceType;

  @Prop({ required: false })
  recurrenceEndDate?: Date;

  @Prop({ required: true })
  nextPaymentDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  lastGeneratedDate?: Date;
}

export const RecurringTransactionSchema =
  SchemaFactory.createForClass(RecurringTransaction);
