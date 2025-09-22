import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FilesModule } from '../files/files.module';
import { SmsModule } from '../sms/sms.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [FilesModule, SmsModule, PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
