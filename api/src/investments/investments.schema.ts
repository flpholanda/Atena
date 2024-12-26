import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Account } from '../accounts/account.schema';

export enum InvestmentType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  BOND = 'BOND',
  REAL_ESTATE = 'REAL_ESTATE',
  MUTUAL_FUND = 'MUTUAL_FUND',
}

export enum InvestmentOperationType {
  BUY = 'BUY',
  SELL = 'SELL',
}

@Schema({ timestamps: true })
export class Investment extends Document {
  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId;

  @Prop({ required: true, enum: InvestmentType })
  type: InvestmentType;

  @Prop({ required: true, enum: InvestmentOperationType })
  operationType: InvestmentOperationType;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  purchasePrice: number;

  @Prop()
  currentPrice?: number;

  @Prop()
  fees?: number;

  @Prop({ required: true })
  operationDate: Date;

  @Prop()
  notes?: string;
}

export const InvestmentsSchema = SchemaFactory.createForClass(Investment);
