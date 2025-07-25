import { Module } from '@nestjs/common';
import { ProviderJoinRequestsController } from './provider-join-requests.controller';
import { ProviderJoinRequestsService } from './provider-join-requests.service';

@Module({
  controllers: [ProviderJoinRequestsController],
  providers: [ProviderJoinRequestsService]
})
export class ProviderJoinRequestsModule {}
