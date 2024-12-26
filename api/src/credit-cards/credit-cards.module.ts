import { Module } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditCard, CreditCardSchema } from './credit-cards.schema';
import { CreditCardRepository } from './credit-cards.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CreditCard.name, schema: CreditCardSchema },
    ]),
    MongooseModule,
  ],
  controllers: [CreditCardsController],
  providers: [CreditCardsService, CreditCardRepository],
})
export class CreditCardsModule {}
