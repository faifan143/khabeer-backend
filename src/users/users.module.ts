import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FilesModule } from '../files/files.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [FilesModule]
})
export class UsersModule { }
