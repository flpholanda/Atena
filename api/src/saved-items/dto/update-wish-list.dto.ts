import { PartialType } from '@nestjs/mapped-types';
import { CreateSavedItemDto } from './create-wish-list.dto';

export class UpdateSavedItemDto extends PartialType(CreateSavedItemDto) {}
