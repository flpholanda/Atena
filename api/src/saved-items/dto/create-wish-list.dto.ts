import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateSavedItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  category: Types.ObjectId;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsBoolean()
  isPurchased?: boolean = false;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
