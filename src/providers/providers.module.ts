import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { FilesModule } from '../files/files.module';
import { SmsModule } from '../sms/sms.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService],
  imports: [FilesModule, SmsModule, PrismaModule],
  exports: [ProvidersService],
})
export class ProvidersModule {}
