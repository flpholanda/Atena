import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class LimitRecord {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  limit: number;
}

@Schema({ timestamps: true, collection: 'credit-cards' })
export class CreditCard extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  limit: number;

  @Prop({ required: true })
  closingDate: number;

  @Prop({ required: true })
  dueDate: number;

  @Prop({ type: [LimitRecord], default: [] })
  limitHistory: LimitRecord[];
}

export const CreditCardSchema = SchemaFactory.createForClass(CreditCard);
