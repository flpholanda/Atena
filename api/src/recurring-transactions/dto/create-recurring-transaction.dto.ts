import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';
import { RecurrenceType } from '../recurring-transactions.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRecurringTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  originalTransaction: string;

  @ApiProperty()
  @IsEnum(RecurrenceType)
  recurrenceType: RecurrenceType;

  @ApiProperty()
  @IsDate()
  nextPaymentDate?: Date;

  @ApiPropertyOptional()
  @IsDate()
  recurrenceEndDate?: Date;

  @ApiPropertyOptional()
  lastGeneratedDate?: Date;
}
