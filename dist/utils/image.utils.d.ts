import { ConfigService } from '@nestjs/config';
export declare class ImageUtils {
    static toAbsoluteUrl(imageUrl: string | null | undefined, configService: ConfigService): string | undefined;
    static isValidImageUrl(url: string): boolean;
    static getFilenameFromUrl(imageUrl: string): string | null;
}
