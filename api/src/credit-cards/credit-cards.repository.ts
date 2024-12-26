import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/base.repository';
import { CreditCard } from './credit-cards.schema';

@Injectable()
export class CreditCardRepository extends BaseRepository<CreditCard> {
  constructor(
    @InjectModel(CreditCard.name)
    private readonly creditCardModel: Model<CreditCard>,
  ) {
    super(creditCardModel);
  }

  async findByName(name: string): Promise<CreditCard[]> {
    return this.creditCardModel.find({ name }).exec();
  }
}
