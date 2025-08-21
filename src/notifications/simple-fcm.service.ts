import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';

export interface FCMNotificationPayload {
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, string>;
}

export interface FCMResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

@Injectable()
export class SimpleFCMService {
    private readonly logger = new Logger(SimpleFCMService.name);
    private firebaseApp: admin.app.App;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        try {
            // Check if Firebase is already initialized
            if (admin.apps.length === 0) {
                const serviceAccount = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');

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
            } else {
                this.firebaseApp = admin.app();
                this.logger.log('Firebase Admin SDK already initialized');
            }
        } catch (error) {
            this.logger.error('Failed to initialize Firebase Admin SDK:', error);
        }
    }

    async sendToUser(userId: number, payload: FCMNotificationPayload): Promise<FCMResult> {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }

            // Get user's FCM token
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

            const message: admin.messaging.Message = {
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
        } catch (error) {
            this.logger.error(`Failed to send message to user ${userId}:`, error);

            return {
                success: false,
                error: error.message,
            };
        }
    }

    async sendToProvider(providerId: number, payload: FCMNotificationPayload): Promise<FCMResult> {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }

            // Get provider's FCM token
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

            const message: admin.messaging.Message = {
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
        } catch (error) {
            this.logger.error(`Failed to send message to provider ${providerId}:`, error);

            return {
                success: false,
                error: error.message,
            };
        }
    }

    async sendToAllUsers(payload: FCMNotificationPayload): Promise<{ success: boolean; sentCount: number; totalCount: number }> {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }

            // Get all users with FCM tokens
            const users = await this.prisma.user.findMany({
                where: { fcm: { not: null } },
                select: { id: true, fcm: true, name: true }
            });

            if (users.length === 0) {
                return { success: false, sentCount: 0, totalCount: 0 };
            }

            const tokens = users.map(user => user.fcm).filter((token): token is string => token !== null);
            const message: admin.messaging.MulticastMessage = {
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
        } catch (error) {
            this.logger.error('Failed to send multicast message to users:', error);
            return { success: false, sentCount: 0, totalCount: 0 };
        }
    }

    async sendToAllProviders(payload: FCMNotificationPayload): Promise<{ success: boolean; sentCount: number; totalCount: number }> {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }

            // Get all providers with FCM tokens
            const providers = await this.prisma.provider.findMany({
                where: { fcm: { not: null } },
                select: { id: true, fcm: true, name: true }
            });

            if (providers.length === 0) {
                return { success: false, sentCount: 0, totalCount: 0 };
            }

            const tokens = providers.map(provider => provider.fcm).filter((token): token is string => token !== null);
            const message: admin.messaging.MulticastMessage = {
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
        } catch (error) {
            this.logger.error('Failed to send multicast message to providers:', error);
            return { success: false, sentCount: 0, totalCount: 0 };
        }
    }
}
