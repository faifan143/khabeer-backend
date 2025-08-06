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
var FCMService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCMService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
let FCMService = FCMService_1 = class FCMService {
    configService;
    logger = new common_1.Logger(FCMService_1.name);
    firebaseApp;
    constructor(configService) {
        this.configService = configService;
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
    async sendToToken(token, payload) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const message = {
                token,
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
            this.logger.log(`Message sent successfully to token: ${token}, Message ID: ${response}`);
            return {
                success: true,
                messageId: response,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send message to token ${token}:`, error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async sendToMultipleTokens(tokens, payload) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            if (tokens.length === 0) {
                return [];
            }
            const uniqueTokens = [...new Set(tokens)].filter(token => token && token.trim() !== '');
            if (uniqueTokens.length === 0) {
                return [];
            }
            const message = {
                tokens: uniqueTokens,
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
            this.logger.log(`Multicast message sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
            const results = [];
            response.responses.forEach((resp, idx) => {
                if (resp.success) {
                    results.push({
                        success: true,
                        messageId: resp.messageId,
                    });
                }
                else {
                    results.push({
                        success: false,
                        error: resp.error?.message || 'Unknown error',
                    });
                }
            });
            return results;
        }
        catch (error) {
            this.logger.error('Failed to send multicast message:', error);
            return tokens.map(() => ({
                success: false,
                error: error.message,
            }));
        }
    }
    async sendToTopic(topic, payload) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const message = {
                topic,
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
            this.logger.log(`Topic message sent successfully to topic: ${topic}, Message ID: ${response}`);
            return {
                success: true,
                messageId: response,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send message to topic ${topic}:`, error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async subscribeToTopic(tokens, topic) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const response = await this.firebaseApp.messaging().subscribeToTopic(tokens, topic);
            this.logger.log(`Subscribed ${tokens.length} tokens to topic ${topic}. Success: ${response.successCount}, Failure: ${response.failureCount}`);
            return response.successCount > 0;
        }
        catch (error) {
            this.logger.error(`Failed to subscribe tokens to topic ${topic}:`, error);
            return false;
        }
    }
    async unsubscribeFromTopic(tokens, topic) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            const response = await this.firebaseApp.messaging().unsubscribeFromTopic(tokens, topic);
            this.logger.log(`Unsubscribed ${tokens.length} tokens from topic ${topic}. Success: ${response.successCount}, Failure: ${response.failureCount}`);
            return response.successCount > 0;
        }
        catch (error) {
            this.logger.error(`Failed to unsubscribe tokens from topic ${topic}:`, error);
            return false;
        }
    }
};
exports.FCMService = FCMService;
exports.FCMService = FCMService = FCMService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FCMService);
//# sourceMappingURL=fcm.service.js.map