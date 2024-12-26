import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Post()
  create(@Body() createRecurringTransactionDto: CreateRecurringTransactionDto) {
    return this.recurringTransactionsService.create(
      createRecurringTransactionDto,
    );
  }

  @Get()
  findAll() {
    return this.recurringTransactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recurringTransactionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecurringTransactionDto: UpdateRecurringTransactionDto,
  ) {
    return this.recurringTransactionsService.update(
      id,
      updateRecurringTransactionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recurringTransactionsService.remove(id);
  }
}
