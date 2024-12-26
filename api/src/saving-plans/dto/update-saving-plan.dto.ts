import { PartialType } from '@nestjs/mapped-types';
import { CreateSavingPlanDto } from './create-saving-plan.dto';

export class UpdateSavingPlanDto extends PartialType(CreateSavingPlanDto) {}
