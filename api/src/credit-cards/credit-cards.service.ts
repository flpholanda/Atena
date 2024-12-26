import { Injectable } from '@nestjs/common';
import { CreateCreditCardDto } from './dto/create-credit-card.dto'; // DTO para criação
import { UpdateCreditCardDto } from './dto/update-credit-card.dto'; // DTO para atualização
import { CreditCard } from './credit-cards.schema';
import { CreditCardRepository } from './credit-cards.repository';

@Injectable()
export class CreditCardsService {
  constructor(private readonly creditCardRepository: CreditCardRepository) {}

  async create(createCreditCardDto: CreateCreditCardDto): Promise<CreditCard> {
    return this.creditCardRepository.create(createCreditCardDto);
  }

  async findAll(): Promise<CreditCard[]> {
    return this.creditCardRepository.findAll();
  }

  async findOne(id: string): Promise<CreditCard | null> {
    return this.creditCardRepository.findById(id);
  }

  async update(
    id: string,
    updateCreditCardDto: UpdateCreditCardDto,
  ): Promise<CreditCard | null> {
    return this.creditCardRepository.update(id, updateCreditCardDto);
  }

  async remove(id: string): Promise<CreditCard | null> {
    return this.creditCardRepository.delete(id);
  }
}
