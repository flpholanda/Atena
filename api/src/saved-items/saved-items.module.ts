import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedItem, SavedItemSchema } from './saved-items.schema';
import { SavedItemsController } from './saved-items.controller';
import { SavedItemsService } from './saved-items.service';
import { SavedItemsRepository } from './saved-items.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedItem.name, schema: SavedItemSchema },
    ]),
    MongooseModule,
  ],
  controllers: [SavedItemsController],
  providers: [SavedItemsService, SavedItemsRepository],
})
export class SavedItemsModule {}
