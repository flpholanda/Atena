import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './transactions.schema';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'The transaction has been successfully created.',
    type: Transaction,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid transaction data',
  })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple transactions' })
  @ApiBody({ type: [CreateTransactionDto] })
  @ApiResponse({
    status: 201,
    description: 'The transactions have been successfully created.',
    type: [Transaction],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid transaction data',
  })
  createMany(@Body() createTransactionDto: CreateTransactionDto[]) {
    return this.transactionsService.createMany(createTransactionDto);
  }

  @Post('installment/:installment/:interest?')
  @ApiOperation({ summary: 'Create an installment transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiParam({
    name: 'installment',
    type: 'number',
    description: 'Number of installments',
  })
  @ApiParam({
    name: 'interest',
    type: 'number',
    description: 'Interest rate (optional)',
    required: false,
  })
  @ApiResponse({
    status: 201,
    description: 'The installment transaction has been successfully created.',
    type: Transaction,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: Invalid transaction data or installment parameters',
  })
  createInstallment(
    @Body() createTransactionDto: CreateTransactionDto,
    @Param('installment') installment: number,
    @Param('interest') interest?: number,
  ) {
    return this.transactionsService.createInstallment(
      createTransactionDto,
      installment,
      interest,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of all transactions',
    type: [Transaction],
  })
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific transaction by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Transaction ID',
  })
  @ApiResponse({
    status: 200,
    description: 'The found transaction',
    type: Transaction,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific transaction' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Transaction ID',
  })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({
    status: 200,
    description: 'The updated transaction',
    type: Transaction,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific transaction' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Transaction ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
