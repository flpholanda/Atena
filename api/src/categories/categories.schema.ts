import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  icon?: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true, enum: ['INCOME', 'EXPENSE'] })
  type: 'INCOME' | 'EXPENSE';

  @Prop({ required: false, default: 0 })
  monthlyBudgetAmount?: number;

  @Prop({ required: false, default: 0 })
  monthlyBudgetPercentage?: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
