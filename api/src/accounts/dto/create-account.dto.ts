import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountType } from '../account.schema';

export class CreateAccountDto {
  @IsString()
  institution: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsOptional()
  @IsString()
  description?: string;
}
