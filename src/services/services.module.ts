import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { FilesModule } from '../files/files.module';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [FilesModule]
})
export class ServicesModule { }
