import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
export class FCMService {
    private readonly logger = new Logger(FCMService.name);
    private firebaseApp: admin.app.App;

    constructor(private configService: ConfigService) {
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

    async sendToToken(token: string, payload: FCMNotificationPayload): Promise<FCMResult> {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }

            const message: admin.messaging.Message = {
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
        } catch (error) {
            this.logger.error(`Failed to send message to token ${token}:`, error);

            return {
                success: false,
                error: error.message,
            };
        }
    }

    async sendToMultipleTokens(tokens: string[], payload: FCMNotificationPayload): Promise<FCMResult[]> {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }

            if (tokens.length === 0) {
                return [];
            }

            // Remove duplicates and invalid tokens
            const uniqueTokens = [...new Set(tokens)].filter(token => token && token.trim() !== '');

            if (uniqueTokens.length === 0) {
                return [];
            }

            const message: admin.messaging.MulticastMessage = {
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

            const results: FCMResult[] = [];

            response.responses.forEach((resp, idx) => {
                if (resp.success) {
                    results.push({
                        success: true,
                        messageId: resp.messageId,
                    });
                } else {
                    results.push({
                        success: false,
                        error: resp.error?.message || 'Unknown error',
                    });
                }
            });

            return results;
        } catch (error) {
            this.logger.error('Failed to send multicast message:', error);

            return tokens.map(() => ({
                success: false,
                error: error.message,
            }));
        }
    }

    async sendToTopic(topic: string, payload: FCMNotificationPayload): Promise<FCMResult> {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }

            const message: admin.messaging.Message = {
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

            this.logger.log(`✅ Topic message sent successfully to topic: ${topic}, Message ID: ${response}`);
            this.logger.log(`📱 Topic: ${topic} | Title: ${payload.title} | Body: ${payload.body}`);

            return {
                success: true,
                messageId: response,
            };
        } catch (error) {
            this.logger.error(`❌ Failed to send message to topic ${topic}:`, error);
            this.logger.error(`📱 Failed Topic: ${topic} | Title: ${payload.title} | Error: ${error.message}`);

            return {
                success: false,
                error: error.message,
            };
        }
    }

    async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }

            const response = await this.firebaseApp.messaging().subscribeToTopic(tokens, topic);

            this.logger.log(`Subscribed ${tokens.length} tokens to topic ${topic}. Success: ${response.successCount}, Failure: ${response.failureCount}`);

            return response.successCount > 0;
        } catch (error) {
            this.logger.error(`Failed to subscribe tokens to topic ${topic}:`, error);
            return false;
        }
    }

    async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }

            const response = await this.firebaseApp.messaging().unsubscribeFromTopic(tokens, topic);

            this.logger.log(`Unsubscribed ${tokens.length} tokens from topic ${topic}. Success: ${response.successCount}, Failure: ${response.failureCount}`);

            return response.successCount > 0;
        } catch (error) {
            this.logger.error(`Failed to unsubscribe tokens from topic ${topic}:`, error);
            return false;
        }
    }

    /**
     * Get topic information and statistics
     */
    async getTopicInfo(topic: string): Promise<{
        topic: string;
        exists: boolean;
        lastMessageSent?: string;
        estimatedSubscribers?: number;
    }> {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase Admin SDK not initialized');
            }

            // Note: Firebase Admin SDK doesn't provide direct topic info
            // This is a placeholder for future implementation
            // You can implement this by tracking topic usage in your database
            
            this.logger.log(`📊 Topic info requested for: ${topic}`);
            
            return {
                topic,
                exists: true,
                lastMessageSent: new Date().toISOString(),
                estimatedSubscribers: 0, // Would need to track this in your database
            };
        } catch (error) {
            this.logger.error(`Failed to get topic info for ${topic}:`, error);
            return {
                topic,
                exists: false,
            };
        }
    }

    /**
     * Get all available topics (from your system)
     */
    getAllTopics(): string[] {
        return [
            'channel_users',
            'channel_providers',
        ];
    }

    /**
     * Log topic statistics
     */
    async logTopicStats(): Promise<void> {
        const topics = this.getAllTopics();
        this.logger.log(`📊 Available FCM Topics: ${topics.join(', ')}`);
        
        for (const topic of topics) {
            const info = await this.getTopicInfo(topic);
            this.logger.log(`📱 Topic: ${topic} | Exists: ${info.exists} | Last Message: ${info.lastMessageSent || 'Never'}`);
        }
    }
} 