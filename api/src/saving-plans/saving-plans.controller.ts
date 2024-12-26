import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SavingPlansService } from './saving-plans.service';
import { CreateSavingPlanDto } from './dto/create-saving-plan.dto';
import { UpdateSavingPlanDto } from './dto/update-saving-plan.dto';

@Controller('saving-plans')
export class SavingPlansController {
  constructor(private readonly savingPlansService: SavingPlansService) {}

  @Post()
  create(@Body() createSavingPlanDto: CreateSavingPlanDto) {
    return this.savingPlansService.create(createSavingPlanDto);
  }

  @Get()
  findAll() {
    return this.savingPlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savingPlansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSavingPlanDto: UpdateSavingPlanDto,
  ) {
    console.log(id, updateSavingPlanDto);
    return this.savingPlansService.update(id, updateSavingPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savingPlansService.remove(id);
  }
}
