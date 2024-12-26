import { Module } from '@nestjs/common';
import { SavingPlansService } from './saving-plans.service';
import { SavingPlansController } from './saving-plans.controller';
import { SavingPlan, SavingPlanSchema } from './saving-plans.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SavingPlanRepository } from './saving-plans.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavingPlan.name, schema: SavingPlanSchema },
    ]),
    MongooseModule,
  ],
  controllers: [SavingPlansController],
  providers: [SavingPlansService, SavingPlanRepository],
})
export class SavingPlansModule {}
