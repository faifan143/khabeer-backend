import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { FilesModule } from '../files/files.module';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService],
  imports: [FilesModule]
})
export class ProvidersModule { }
