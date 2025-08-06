import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OffersModule } from './offers/offers.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ServicesModule } from './services/services.module';
import { ProvidersModule } from './providers/providers.module';
import { CategoriesModule } from './categories/categories.module';
import { ProviderRatingsModule } from './provider-ratings/provider-ratings.module';
import { ProviderServiceModule } from './provider-service/provider-service.module';
import { ProviderJoinRequestsModule } from './provider-join-requests/provider-join-requests.module';
import { ProviderVerificationModule } from './provider-verification/provider-verification.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { HealthModule } from './health/health.module';
import { SearchModule } from './search/search.module';
import { AdminModule } from './admin/admin.module';
import { LocationTrackingModule } from './location-tracking/location-tracking.module';
import { SmsModule } from './sms/sms.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    OffersModule,
    UsersModule,
    OrdersModule,
    InvoicesModule,
    ServicesModule,
    ProvidersModule,
    CategoriesModule,
    ProviderRatingsModule,
    ProviderServiceModule,
    ProviderJoinRequestsModule,
    ProviderVerificationModule,
    AuthModule,
    FilesModule,
    HealthModule,
    SearchModule,
    AdminModule,
    LocationTrackingModule,
    SmsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
