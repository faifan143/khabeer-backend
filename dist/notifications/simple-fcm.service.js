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
var SimpleFCMService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleFCMService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const admin = require("firebase-admin");
let SimpleFCMService = SimpleFCMService_1 = class SimpleFCMService {
    configService;
    prisma;
    logger = new common_1.Logger(SimpleFCMService_1.name);
    firebaseApp;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.initializeFirebase();
    }
    initializeFirebase() {
        try {
            if (admin.apps.length === 0) {
                const serviceAccount = this.configService.get('FIREBASE_SERVICE_ACCOUNT');
                if (!serviceAccount) {
                    this.logger.error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
                    return;
                }
                const serviceAccountJson = JSON.parse(serviceAccount);
                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccountJson),
                    projectId: serviceAccountJson.project_id,
                });
                this.logger.log('Firebase Admin SDK initialized successfully');
            }
            else {
                this.firebaseApp = admin.app();
                this.logger.log('Firebase Admin SDK already initialized');
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase Admin SDK:', error);
        }
    }
    async sendToUser(userId, payload) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { fcm: true, name: true }
            });
            if (!user || !user.fcm) {
                return {
                    success: false,
                    error: 'User not found or no FCM token available'
                };
            }
            const message = {
                token: user.fcm,
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data,
                android: {
                    notification: {
                        sound: 'default',
                        priority: 'high',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };
            const response = await this.firebaseApp.messaging().send(message);
            this.logger.log(`Message sent successfully to user ${user.name} (ID: ${userId}), Message ID: ${response}`);
            return {
                success: true,
                messageId: response,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send message to user ${userId}:`, error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async sendToProvider(providerId, payload) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const provider = await this.prisma.provider.findUnique({
                where: { id: providerId },
                select: { fcm: true, name: true }
            });
            if (!provider || !provider.fcm) {
                return {
                    success: false,
                    error: 'Provider not found or no FCM token available'
                };
            }
            const message = {
                token: provider.fcm,
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data,
                android: {
                    notification: {
                        sound: 'default',
                        priority: 'high',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };
            const response = await this.firebaseApp.messaging().send(message);
            this.logger.log(`Message sent successfully to provider ${provider.name} (ID: ${providerId}), Message ID: ${response}`);
            return {
                success: true,
                messageId: response,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send message to provider ${providerId}:`, error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async sendToAllUsers(payload) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const users = await this.prisma.user.findMany({
                where: { fcm: { not: null } },
                select: { id: true, fcm: true, name: true }
            });
            if (users.length === 0) {
                return { success: false, sentCount: 0, totalCount: 0 };
            }
            const tokens = users.map(user => user.fcm).filter((token) => token !== null);
            const message = {
                tokens,
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data,
                android: {
                    notification: {
                        sound: 'default',
                        priority: 'high',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };
            const response = await this.firebaseApp.messaging().sendEachForMulticast(message);
            this.logger.log(`Multicast message sent to users. Success: ${response.successCount}, Failure: ${response.failureCount}`);
            return {
                success: response.successCount > 0,
                sentCount: response.successCount,
                totalCount: tokens.length
            };
        }
        catch (error) {
            this.logger.error('Failed to send multicast message to users:', error);
            return { success: false, sentCount: 0, totalCount: 0 };
        }
    }
    async sendToAllProviders(payload) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const providers = await this.prisma.provider.findMany({
                where: { fcm: { not: null } },
                select: { id: true, fcm: true, name: true }
            });
            if (providers.length === 0) {
                return { success: false, sentCount: 0, totalCount: 0 };
            }
            const tokens = providers.map(provider => provider.fcm).filter((token) => token !== null);
            const message = {
                tokens,
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data,
                android: {
                    notification: {
                        sound: 'default',
                        priority: 'high',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };
            const response = await this.firebaseApp.messaging().sendEachForMulticast(message);
            this.logger.log(`Multicast message sent to providers. Success: ${response.successCount}, Failure: ${response.failureCount}`);
            return {
                success: response.successCount > 0,
                sentCount: response.successCount,
                totalCount: tokens.length
            };
        }
        catch (error) {
            this.logger.error('Failed to send multicast message to providers:', error);
            return { success: false, sentCount: 0, totalCount: 0 };
        }
    }
};
exports.SimpleFCMService = SimpleFCMService;
exports.SimpleFCMService = SimpleFCMService = SimpleFCMService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], SimpleFCMService);
//# sourceMappingURL=simple-fcm.service.js.map