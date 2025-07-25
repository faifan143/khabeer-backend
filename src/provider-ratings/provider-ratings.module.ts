import { Module } from '@nestjs/common';
import { ProviderRatingsController } from './provider-ratings.controller';
import { ProviderRatingsService } from './provider-ratings.service';

@Module({
  controllers: [ProviderRatingsController],
  providers: [ProviderRatingsService]
})
export class ProviderRatingsModule {}
