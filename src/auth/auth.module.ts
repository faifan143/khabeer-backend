import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ProvidersModule } from '../providers/providers.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { ActiveStatusGuard } from './active-status.guard';
import { ComprehensiveAuthGuard } from './comprehensive-auth.guard';
import { UsersService } from 'src/users/users.service';
import { FilesModule } from 'src/files/files.module';
import { SmsModule } from '../sms/sms.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    FilesModule,
    UsersModule,
    ProvidersModule,
    SmsModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'supersecret'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '30d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    ActiveStatusGuard,
    ComprehensiveAuthGuard,
    UsersService,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, ActiveStatusGuard, ComprehensiveAuthGuard],
})
export class AuthModule {}
