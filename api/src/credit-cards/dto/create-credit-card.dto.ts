import {
  IsDate,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class LimitRecordDto {
  @IsDate()
  date: Date;

  @IsNumber()
  limit: number;
}

export class CreateCreditCardDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber()
  @ApiProperty()
  limit: number;

  @IsNumber()
  @ApiProperty()
  closingDate: number;

  @IsNumber()
  @ApiProperty()
  dueDate: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LimitRecordDto)
  @ApiProperty()
  limitHistory: LimitRecordDto[];
}
