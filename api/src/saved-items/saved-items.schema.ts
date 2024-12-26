import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Category } from '../categories/categories.schema';

@Schema({
  timestamps: true,
  collection: 'saved-items',
})
export class SavedItem extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  category: Category;

  @Prop()
  link?: string;

  @Prop({ default: false })
  isPurchased: boolean;

  @Prop()
  priority?: number;

  @Prop()
  imageUrl?: string;
}

export const SavedItemSchema = SchemaFactory.createForClass(SavedItem);
