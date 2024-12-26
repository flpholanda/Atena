import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { Types } from 'mongoose';
import { InvestmentOperationType, InvestmentType } from '../investments.schema';

export class CreateInvestmentDto {
  @IsMongoId()
  @IsNotEmpty()
  account: Types.ObjectId;

  @IsEnum(InvestmentType)
  @IsNotEmpty()
  type: InvestmentType;

  @IsEnum(InvestmentOperationType)
  @IsNotEmpty()
  operationType: InvestmentOperationType;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  purchasePrice: number;

  @IsOptional()
  @IsNumber()
  currentPrice?: number;

  @IsOptional()
  @IsNumber()
  fees?: number;

  @IsDate()
  @IsNotEmpty()
  operationDate: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
