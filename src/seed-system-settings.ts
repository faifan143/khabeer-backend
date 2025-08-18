import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function seedSystemSettings() {
    try {
        console.log('🌱 Seeding system settings...');

        // Social Media Settings
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

        // Legal Documents Settings
        const legalSettings = [
            {
                key: 'terms_of_service',
                value: 'https://khabeer.com/legal/terms',
                description: 'Terms of Service document URL',
                category: 'legal'
            },
            {
                key: 'privacy_policy',
                value: 'https://khabeer.com/legal/privacy',
                description: 'Privacy Policy document URL',
                category: 'legal'
            },
            {
                key: 'user_agreement',
                value: 'https://khabeer.com/legal/user-agreement',
                description: 'User Agreement document URL',
                category: 'legal'
            },
            {
                key: 'provider_agreement',
                value: 'https://khabeer.com/legal/provider-agreement',
                description: 'Provider Agreement document URL',
                category: 'legal'
            },
            {
                key: 'refund_policy',
                value: 'https://khabeer.com/legal/refund',
                description: 'Refund Policy document URL',
                category: 'legal'
            }
        ];

        // Support Settings
        const supportSettings = [
            {
                key: 'support_phone',
                value: '+966501234567',
                description: 'Main support phone number',
                category: 'support'
            },
            {
                key: 'support_whatsapp',
                value: '+966501234567',
                description: 'Support WhatsApp number',
                category: 'support'
            },
            {
                key: 'support_email',
                value: 'support@khabeer.com',
                description: 'Support email address',
                category: 'support'
            },
            {
                key: 'emergency_phone',
                value: '+966501234568',
                description: 'Emergency contact number',
                category: 'support'
            },
            {
                key: 'business_hours',
                value: '24/7',
                description: 'Business hours for support',
                category: 'support'
            }
        ];

        // Combine all settings
        const allSettings = [...socialSettings, ...legalSettings, ...supportSettings];

        // Upsert each setting
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

    } catch (error) {
        console.error('❌ Error seeding system settings:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
seedSystemSettings()
    .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    });
