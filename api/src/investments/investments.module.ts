import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Investment, InvestmentsSchema } from './investments.schema';
import { InvestmentController } from './investments.controller';
import { InvestmentService } from './investments.service';
import { InvestmentRepository } from './investments.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investment.name, schema: InvestmentsSchema },
    ]),
    MongooseModule,
  ],
  controllers: [InvestmentController],
  providers: [InvestmentService, InvestmentRepository],
})
export class InvestmentsRepository {}
