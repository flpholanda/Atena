import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface SavingPlanInvestment {
  _id: Types.ObjectId;
  value: number;
  date: Date;
}

@Schema({ timestamps: true })
export class SavingPlan extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  goal: number;

  @Prop({ required: true, enum: ['ACTIVE', 'COMPLETED', 'PAUSED'] })
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';

  @Prop({ required: true })
  deadline: Date;

  @Prop({ type: String, required: false })
  image?: string;

  @Prop({
    default: [],
  })
  investments: Types.Array<SavingPlanInvestment>;
}

export const SavingPlanSchema = SchemaFactory.createForClass(SavingPlan);
