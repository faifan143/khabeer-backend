import { Module } from '@nestjs/common';
import { ProviderServiceController } from './provider-service.controller';
import { ProviderServiceService } from './provider-service.service';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [ServicesModule],
  controllers: [ProviderServiceController],
  providers: [ProviderServiceService]
})
export class ProviderServiceModule { }
