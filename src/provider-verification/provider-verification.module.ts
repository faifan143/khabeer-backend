import { Module } from '@nestjs/common';
import { ProviderVerificationService } from './provider-verification.service';
import { ProviderVerificationController } from './provider-verification.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ProviderVerificationController],
    providers: [ProviderVerificationService],
    exports: [ProviderVerificationService]
})
export class ProviderVerificationModule { } 