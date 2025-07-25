import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { AdminController } from './admin.controller';
import { UsersService } from 'src/users/users.service';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    ConfigModule,
    FilesModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'supersecret'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1d')
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard, UsersService],
  controllers: [AuthController, AdminController],
  exports: [AuthService],
})
export class AuthModule { }
