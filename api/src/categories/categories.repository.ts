import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './categories.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async create(createDto: CreateCategoryDto): Promise<Category> {
    const createdItem = new this.categoryModel(createDto);
    return createdItem.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOneById(id: string): Promise<Category | null> {
    return this.categoryModel.findById(id).exec();
  }

  async update(id: string, updateDto: any): Promise<Category | null> {
    return this.categoryModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Category | null> {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
