import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsMongoId,
  IsDate,
} from 'class-validator';
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '../transactions.schema';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsMongoId()
  @ApiProperty()
  account: Types.ObjectId;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description: string;

  @IsEnum(TransactionType)
  @ApiProperty()
  type: TransactionType;

  @IsMongoId()
  @ApiProperty()
  category: Types.ObjectId;

  @IsNumber()
  @ApiProperty()
  amount: number;

  @IsEnum(PaymentMethod)
  @ApiProperty()
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiPropertyOptional()
  paymentDate?: Date;

  @IsEnum(TransactionStatus)
  @ApiProperty()
  status: TransactionStatus;

  @IsOptional()
  @IsMongoId()
  @ApiPropertyOptional()
  creditCard?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  @ApiPropertyOptional()
  savingPlan?: string;
}
