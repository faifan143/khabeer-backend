import { Module } from '@nestjs/common';
import { UpdateAuditService } from './update-audit.service';
import { UpdateAuditController } from './update-audit.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [UpdateAuditController],
    providers: [UpdateAuditService],
    exports: [UpdateAuditService],
})
export class UpdateAuditModule { }
