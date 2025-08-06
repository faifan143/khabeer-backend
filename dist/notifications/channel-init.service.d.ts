import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelService } from './channel.service';
export declare class ChannelInitService implements OnModuleInit {
    private prisma;
    private channelService;
    private readonly logger;
    constructor(prisma: PrismaService, channelService: ChannelService);
    onModuleInit(): Promise<void>;
    private initializeChannelSubscriptions;
    reinitializeChannels(): Promise<{
        success: boolean;
        message: string;
    }>;
}
