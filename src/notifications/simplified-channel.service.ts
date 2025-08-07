import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FCMService } from './fcm.service';
import { ChannelType } from './dto/channel.dto';

@Injectable()
export class SimplifiedChannelService {
  private readonly logger = new Logger(SimplifiedChannelService.name);

  constructor(
    private fcmService: FCMService,
    private configService: ConfigService,
  ) { }

  /**
   * Send notification to a specific topic
   */
  async sendNotificationToTopic(
    topic: string,
    title: string,
    message: string,
    data?: Record<string, string>,
    imageUrl?: string,
  ): Promise<boolean> {
    try {
      // Convert relative image URL to absolute URL if needed
      let absoluteImageUrl = imageUrl;
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Get base URL from config or use default
        const baseUrl = this.configService.get<string>('APP_URL') ||
          (process.env.NODE_ENV === 'production'
            ? 'http://31.97.71.187:3000'
            : 'http://localhost:3001');
        absoluteImageUrl = `${baseUrl}${imageUrl}`;
      }

      const payload = {
        title,
        body: message,
        imageUrl: absoluteImageUrl, // Use absolute URL
        data: {
          topic,
          ...(imageUrl && { imageUrl: absoluteImageUrl }), // Only include imageUrl if it exists
          ...data,
        },
      };

      const result = await this.fcmService.sendToTopic(topic, payload);
      return result.success;
    } catch (error) {
      this.logger.error(`Error sending to topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Send notification to multiple topics
   */
  async sendNotificationToTopics(
    topics: string[],
    title: string,
    message: string,
    data?: Record<string, string>,
    imageUrl?: string,
  ): Promise<{ success: boolean; results: boolean[] }> {
    const results = await Promise.all(
      topics.map((topic) =>
        this.sendNotificationToTopic(topic, title, message, data, imageUrl),
      ),
    );

    return {
      success: results.every((r) => r),
      results,
    };
  }

  /**
   * Get topic name for a channel type
   */
  getTopicForChannel(channel: ChannelType): string {
    return `channel_${channel}`;
  }

  /**
   * Get all available topics
   */
  getAllTopics(): string[] {
    return [
      this.getTopicForChannel(ChannelType.USERS),
      this.getTopicForChannel(ChannelType.PROVIDERS),
    ];
  }

  /**
   * Send notification to users channel
   */
  async sendToUsers(title: string, message: string, data?: Record<string, string>, imageUrl?: string): Promise<boolean> {
    return this.sendNotificationToTopic(
      this.getTopicForChannel(ChannelType.USERS),
      title,
      message,
      data,
      imageUrl,
    );
  }

  /**
   * Send notification to providers channel
   */
  async sendToProviders(title: string, message: string, data?: Record<string, string>, imageUrl?: string): Promise<boolean> {
    return this.sendNotificationToTopic(
      this.getTopicForChannel(ChannelType.PROVIDERS),
      title,
      message,
      data,
      imageUrl,
    );
  }


} 