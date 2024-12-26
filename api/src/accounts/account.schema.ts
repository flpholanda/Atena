import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  SPORTSBOOKS = 'SPORTSBOOKS',
}

@Schema({ timestamps: true, collection: 'accounts' })
export class Account extends Document {
  @Prop({ required: true })
  institution: string;

  @Prop({ required: true, enum: AccountType })
  type: AccountType;

  @Prop()
  description?: string;
}

export const AccountsSchema = SchemaFactory.createForClass(Account);
