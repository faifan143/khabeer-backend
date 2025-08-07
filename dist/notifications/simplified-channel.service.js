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
var SimplifiedChannelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplifiedChannelService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fcm_service_1 = require("./fcm.service");
const channel_dto_1 = require("./dto/channel.dto");
let SimplifiedChannelService = SimplifiedChannelService_1 = class SimplifiedChannelService {
    fcmService;
    configService;
    logger = new common_1.Logger(SimplifiedChannelService_1.name);
    constructor(fcmService, configService) {
        this.fcmService = fcmService;
        this.configService = configService;
    }
    async sendNotificationToTopic(topic, title, message, data, imageUrl) {
        try {
            let absoluteImageUrl = imageUrl;
            if (imageUrl && !imageUrl.startsWith('http')) {
                const baseUrl = this.configService.get('APP_URL') ||
                    (process.env.NODE_ENV === 'production'
                        ? 'http://31.97.71.187:3001'
                        : 'http://localhost:3001');
                absoluteImageUrl = `${baseUrl}${imageUrl}`;
            }
            const payload = {
                title,
                body: message,
                imageUrl: absoluteImageUrl,
                data: {
                    topic,
                    ...(imageUrl && { imageUrl: absoluteImageUrl }),
                    ...data,
                },
            };
            const result = await this.fcmService.sendToTopic(topic, payload);
            return result.success;
        }
        catch (error) {
            this.logger.error(`Error sending to topic ${topic}:`, error);
            return false;
        }
    }
    async sendNotificationToTopics(topics, title, message, data, imageUrl) {
        const results = await Promise.all(topics.map((topic) => this.sendNotificationToTopic(topic, title, message, data, imageUrl)));
        return {
            success: results.every((r) => r),
            results,
        };
    }
    getTopicForChannel(channel) {
        return `channel_${channel}`;
    }
    getAllTopics() {
        return [
            this.getTopicForChannel(channel_dto_1.ChannelType.USERS),
            this.getTopicForChannel(channel_dto_1.ChannelType.PROVIDERS),
        ];
    }
    async sendToUsers(title, message, data, imageUrl) {
        return this.sendNotificationToTopic(this.getTopicForChannel(channel_dto_1.ChannelType.USERS), title, message, data, imageUrl);
    }
    async sendToProviders(title, message, data, imageUrl) {
        return this.sendNotificationToTopic(this.getTopicForChannel(channel_dto_1.ChannelType.PROVIDERS), title, message, data, imageUrl);
    }
};
exports.SimplifiedChannelService = SimplifiedChannelService;
exports.SimplifiedChannelService = SimplifiedChannelService = SimplifiedChannelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fcm_service_1.FCMService,
        config_1.ConfigService])
], SimplifiedChannelService);
//# sourceMappingURL=simplified-channel.service.js.map