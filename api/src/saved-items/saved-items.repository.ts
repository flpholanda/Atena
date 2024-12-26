import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedItem } from './saved-items.schema';
import { CreateSavedItemDto } from './dto/create-wish-list.dto';
import { UpdateSavedItemDto } from './dto/update-wish-list.dto';

@Injectable()
export class SavedItemsRepository {
  constructor(
    @InjectModel(SavedItem.name)
    private readonly savedItemModel: Model<SavedItem>,
  ) {}

  async create(createSavedItemDto: CreateSavedItemDto): Promise<SavedItem> {
    const createdSavedItem = new this.savedItemModel(createSavedItemDto);
    return createdSavedItem.save();
  }

  async createMany(
    createSavedItemsDto: CreateSavedItemDto[],
  ): Promise<SavedItem[]> {
    return this.savedItemModel.create(createSavedItemsDto);
  }

  async findAll(): Promise<SavedItem[]> {
    return this.savedItemModel
      .find()
      .populate('category')
      .sort({ priority: -1, addedAt: -1 })
      .exec();
  }

  async findOneById(id: string): Promise<SavedItem | null> {
    return this.savedItemModel.findById(id).populate('category').exec();
  }

  async update(
    id: string,
    updateSavedItemDto: UpdateSavedItemDto,
  ): Promise<SavedItem | null> {
    return this.savedItemModel
      .findByIdAndUpdate(id, updateSavedItemDto, { new: true })
      .populate('category')
      .exec();
  }

  async delete(id: string): Promise<SavedItem | null> {
    return this.savedItemModel.findByIdAndDelete(id).exec();
  }

  async findByCategory(categoryId: string): Promise<SavedItem[]> {
    return this.savedItemModel
      .find({ category: categoryId })
      .populate('category')
      .sort({ priority: -1, addedAt: -1 })
      .exec();
  }

  async markAsPurchased(id: string): Promise<SavedItem | null> {
    return this.savedItemModel
      .findByIdAndUpdate(id, { isPurchased: true }, { new: true })
      .populate('category')
      .exec();
  }
}
