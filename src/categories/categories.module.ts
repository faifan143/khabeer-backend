import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { FilesModule } from '../files/files.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [FilesModule]
})
export class CategoriesModule { }
