"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function seedSystemSettings() {
    try {
        console.log('🌱 Seeding system settings...');
        const socialSettings = [
            {
                key: 'facebook',
                value: 'https://facebook.com/khabeer',
                description: 'Facebook page URL',
                category: 'social'
            },
            {
                key: 'twitter',
                value: 'https://twitter.com/khabeer',
                description: 'Twitter profile URL',
                category: 'social'
            },
            {
                key: 'instagram',
                value: 'https://instagram.com/khabeer',
                description: 'Instagram profile URL',
                category: 'social'
            },
            {
                key: 'linkedin',
                value: 'https://linkedin.com/company/khabeer',
                description: 'LinkedIn company page URL',
                category: 'social'
            },
            {
                key: 'youtube',
                value: 'https://youtube.com/@khabeer',
                description: 'YouTube channel URL',
                category: 'social'
            }
        ];
        const legalSettings = [];
        const supportSettings = [];
        const allSettings = [...socialSettings, ...legalSettings, ...supportSettings];
        for (const setting of allSettings) {
            await prisma.systemSettings.upsert({
                where: { key: setting.key },
                update: {
                    value: setting.value,
                    description: setting.description,
                    category: setting.category
                },
                create: setting
            });
        }
        console.log('✅ System settings seeded successfully!');
        console.log(`📊 Created ${allSettings.length} system settings`);
    }
    catch (error) {
        console.error('❌ Error seeding system settings:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
seedSystemSettings()
    .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-system-settings.js.map