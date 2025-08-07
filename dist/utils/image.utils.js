"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUtils = void 0;
class ImageUtils {
    static toAbsoluteUrl(imageUrl, configService) {
        if (!imageUrl) {
            return undefined;
        }
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        const baseUrl = configService.get('APP_URL') ||
            configService.get('PUBLIC_URL') ||
            (process.env.NODE_ENV === 'production'
                ? configService.get('PRODUCTION_URL') || 'https://api.khabeer.com'
                : 'http://localhost:3001');
        const normalizedImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        return `${baseUrl}${normalizedImageUrl}`;
    }
    static isValidImageUrl(url) {
        if (!url)
            return false;
        try {
            const parsedUrl = new URL(url);
            const validProtocols = ['http:', 'https:'];
            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
            if (!validProtocols.includes(parsedUrl.protocol)) {
                return false;
            }
            const hasValidExtension = validExtensions.some(ext => parsedUrl.pathname.toLowerCase().endsWith(ext));
            return hasValidExtension;
        }
        catch {
            return false;
        }
    }
    static getFilenameFromUrl(imageUrl) {
        if (!imageUrl)
            return null;
        try {
            const url = new URL(imageUrl);
            const pathname = url.pathname;
            const filename = pathname.split('/').pop();
            return filename || null;
        }
        catch {
            const parts = imageUrl.split('/');
            return parts[parts.length - 1] || null;
        }
    }
}
exports.ImageUtils = ImageUtils;
//# sourceMappingURL=image.utils.js.map