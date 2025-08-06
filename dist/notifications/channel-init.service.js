"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ChannelInitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelInitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const channel_service_1 = require("./channel.service");
const channel_dto_1 = require("./dto/channel.dto");
let ChannelInitService = ChannelInitService_1 = class ChannelInitService {
    prisma;
    channelService;
    logger = new common_1.Logger(ChannelInitService_1.name);
    constructor(prisma, channelService) {
        this.prisma = prisma;
        this.channelService = channelService;
    }
    async onModuleInit() {
        this.logger.log('Initializing channel subscriptions...');
        await this.initializeChannelSubscriptions();
    }
    async initializeChannelSubscriptions() {
        try {
            const usersResult = await this.channelService.subscribeAllUsersToChannel(channel_dto_1.ChannelType.USERS);
            this.logger.log(`Channel initialization - Users: ${usersResult.count} subscribed to users channel`);
            const providersResult = await this.channelService.subscribeAllProvidersToChannel(channel_dto_1.ChannelType.PROVIDERS);
            this.logger.log(`Channel initialization - Providers: ${providersResult.count} subscribed to providers channel`);
            const allUsersResult = await this.channelService.subscribeAllUsersToChannel(channel_dto_1.ChannelType.ALL);
            const allProvidersResult = await this.channelService.subscribeAllProvidersToChannel(channel_dto_1.ChannelType.ALL);
            this.logger.log(`Channel initialization - All channel: ${allUsersResult.count + allProvidersResult.count} total subscribers`);
            this.logger.log('Channel subscriptions initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize channel subscriptions:', error);
        }
    }
    async reinitializeChannels() {
        this.logger.log('Manually reinitializing channel subscriptions...');
        await this.initializeChannelSubscriptions();
        return { success: true, message: 'Channel subscriptions reinitialized' };
    }
};
exports.ChannelInitService = ChannelInitService;
exports.ChannelInitService = ChannelInitService = ChannelInitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        channel_service_1.ChannelService])
], ChannelInitService);
//# sourceMappingURL=channel-init.service.js.map