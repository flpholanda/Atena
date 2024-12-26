import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { Investment } from './investments.schema';
import { InvestmentService } from './investments.service';

@Controller('investments')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  async create(
    @Body() createInvestmentDto: CreateInvestmentDto,
  ): Promise<Investment> {
    return this.investmentService.create(createInvestmentDto);
  }

  @Get()
  async findAll(): Promise<Investment[]> {
    return this.investmentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Investment | null> {
    return this.investmentService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInvestmentDto: UpdateInvestmentDto,
  ): Promise<Investment | null> {
    return this.investmentService.update(id, updateInvestmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Investment | null> {
    return this.investmentService.remove(id);
  }
}
