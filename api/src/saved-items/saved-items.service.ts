import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSavedItemDto } from './dto/create-wish-list.dto';
import { UpdateSavedItemDto } from './dto/update-wish-list.dto';
import { SavedItem } from './saved-items.schema';
import { SavedItemsRepository } from './saved-items.repository';

@Injectable()
export class SavedItemsService {
  constructor(private readonly savedItemsRepository: SavedItemsRepository) {}

  async create(createSavedItemsDto: CreateSavedItemDto): Promise<SavedItem> {
    return this.savedItemsRepository.create(createSavedItemsDto);
  }

  async createMany(
    createSavedItemsDto: CreateSavedItemDto[],
  ): Promise<SavedItem[]> {
    return this.savedItemsRepository.createMany(createSavedItemsDto);
  }

  async findAll(): Promise<SavedItem[]> {
    return this.savedItemsRepository.findAll();
  }

  async findOneById(id: string): Promise<SavedItem> {
    const item = await this.savedItemsRepository.findOneById(id);
    if (!item) {
      throw new NotFoundException(`Saved items with ID ${id} not found`);
    }
    return item;
  }

  async update(
    id: string,
    updateSavedItemsDto: UpdateSavedItemDto,
  ): Promise<SavedItem> {
    const updatedItem = await this.savedItemsRepository.update(
      id,
      updateSavedItemsDto,
    );
    if (!updatedItem) {
      throw new NotFoundException(`Saved items with ID ${id} not found`);
    }
    return updatedItem;
  }

  async delete(id: string): Promise<SavedItem> {
    const deletedItem = await this.savedItemsRepository.delete(id);
    if (!deletedItem) {
      throw new NotFoundException(`Saved items with ID ${id} not found`);
    }
    return deletedItem;
  }

  async findByCategory(categoryId: string): Promise<SavedItem[]> {
    return this.savedItemsRepository.findByCategory(categoryId);
  }

  async markAsPurchased(id: string): Promise<SavedItem> {
    const updatedItem = await this.savedItemsRepository.markAsPurchased(id);
    if (!updatedItem) {
      throw new NotFoundException(`Saved items with ID ${id} not found`);
    }
    return updatedItem;
  }
}
