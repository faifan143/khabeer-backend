import { Module } from '@nestjs/common';
import { ProviderServiceController } from './provider-service.controller';
import { ProviderServiceService } from './provider-service.service';

@Module({
  controllers: [ProviderServiceController],
  providers: [ProviderServiceService]
})
export class ProviderServiceModule {}
