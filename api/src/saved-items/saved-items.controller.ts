import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
} from '@nestjs/common';
import { SavedItemsService } from './saved-items.service';
import { CreateSavedItemDto } from './dto/create-wish-list.dto';
import { SavedItem } from './saved-items.schema';
import { UpdateSavedItemDto } from './dto/update-wish-list.dto';

@Controller('saved-items')
export class SavedItemsController {
  constructor(private readonly savedItemsService: SavedItemsService) {}

  @Post()
  async create(
    @Body() createSavedItemsDto: CreateSavedItemDto,
  ): Promise<SavedItem> {
    return this.savedItemsService.create(createSavedItemsDto);
  }

  @Post('bulk')
  async createMany(
    @Body() createSavedItemsDto: CreateSavedItemDto[],
  ): Promise<SavedItem[]> {
    return this.savedItemsService.createMany(createSavedItemsDto);
  }

  @Get()
  async findAll(): Promise<SavedItem[]> {
    return this.savedItemsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SavedItem> {
    return this.savedItemsService.findOneById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSavedItemsDto: UpdateSavedItemDto,
  ): Promise<SavedItem> {
    return this.savedItemsService.update(id, updateSavedItemsDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<SavedItem> {
    return this.savedItemsService.delete(id);
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<SavedItem[]> {
    return this.savedItemsService.findByCategory(categoryId);
  }

  @Patch(':id/mark-purchased')
  async markAsPurchased(@Param('id') id: string): Promise<SavedItem> {
    return this.savedItemsService.markAsPurchased(id);
  }
}
