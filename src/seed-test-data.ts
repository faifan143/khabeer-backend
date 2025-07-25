import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function seedTestData() {
    console.log('🌱 Seeding test data for Phase 1...');

    try {
        // Create test category
        const category = await prisma.category.create({
            data: {
                image: 'https://example.com/category.jpg',
                titleAr: 'تنظيف',
                titleEn: 'Cleaning',
                state: 'active'
            }
        });
        console.log('✅ Created category:', category.titleEn);

        // Create test service
        const service = await prisma.service.create({
            data: {
                image: 'https://example.com/service.jpg',
                title: 'House Cleaning',
                description: 'Professional house cleaning service',
                commission: 10.0,
                whatsapp: '+1234567890',
                categoryId: category.id
            }
        });
        console.log('✅ Created service:', service.title);

        // Create test user
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: 'user@test.com',
                password: '$2a$10$rQZ8N3YqG8K9L2M1N0O9P8Q7R6S5T4U3V2W1X0Y9Z8A7B6C5D4E3F2G1H0I', // password123
                role: 'USER',
                image: 'https://example.com/user.jpg',
                address: '123 Test Street',
                phone: '+1234567890',
                state: 'Test State',
                isActive: true
            }
        });
        console.log('✅ Created user:', user.name);

        // Create test provider
        const provider = await prisma.provider.create({
            data: {
                name: 'Test Provider',
                image: 'https://example.com/provider.jpg',
                description: 'Professional service provider',
                state: 'Test State',
                phone: '+1234567891',
                isActive: true,
                isVerified: true
            }
        });
        console.log('✅ Created provider:', provider.name);

        // Create provider service association
        const providerService = await prisma.providerService.create({
            data: {
                providerId: provider.id,
                serviceId: service.id,
                price: 50.0,
                isActive: true
            }
        });
        console.log('✅ Created provider service association');

        console.log('\n🎉 Test data seeded successfully!');
        console.log('\n📊 Test Data Summary:');
        console.log(`- Category ID: ${category.id}`);
        console.log(`- Service ID: ${service.id}`);
        console.log(`- User ID: ${user.id}`);
        console.log(`- Provider ID: ${provider.id}`);
        console.log(`- Provider Service ID: ${providerService.id}`);

    } catch (error) {
        console.error('❌ Error seeding test data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedTestData(); 