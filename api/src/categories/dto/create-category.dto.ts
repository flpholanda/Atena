import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  icon?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  color: string;

  @IsEnum(['INCOME', 'EXPENSE'])
  @ApiProperty()
  type: 'INCOME' | 'EXPENSE';

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  monthlyBudgetAmount?: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  monthlyBudgetPercentage?: number;
}
