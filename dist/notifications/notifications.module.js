"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const notifications_controller_1 = require("./notifications.controller");
const channel_controller_1 = require("./channel.controller");
const notifications_service_1 = require("./notifications.service");
const channel_service_1 = require("./channel.service");
const channel_init_service_1 = require("./channel-init.service");
const fcm_service_1 = require("./fcm.service");
const notification_integration_service_1 = require("./notification-integration.service");
const prisma_module_1 = require("../prisma/prisma.module");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, prisma_module_1.PrismaModule],
        controllers: [notifications_controller_1.NotificationsController, channel_controller_1.ChannelController],
        providers: [notifications_service_1.NotificationsService, channel_service_1.ChannelService, channel_init_service_1.ChannelInitService, fcm_service_1.FCMService, notification_integration_service_1.NotificationIntegrationService],
        exports: [notifications_service_1.NotificationsService, channel_service_1.ChannelService, fcm_service_1.FCMService, notification_integration_service_1.NotificationIntegrationService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map