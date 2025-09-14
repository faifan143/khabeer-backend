import { PrismaClient } from '../generated/prisma/index'; // 🔥 CRITICAL FIX: Correct import path
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '1234567890',
      address: 'Admin Address',
      state: 'Admin State',
      isActive: true,
      image: ''
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
      phone: '1234567890',
      address: 'Test Address',
      state: 'Test State',
      isActive: true,
      image: ''
    },
  });
  console.log('✅ Test user created:', user.email);

  // Create test provider
  const providerPassword = await bcrypt.hash('provider123', 10);
  const provider = await prisma.provider.create({
    data: {
      name: 'Test Provider',
      email: 'provider@example.com',
      password: providerPassword,
      phone: '0987654321',
      state: 'Test State',
      description: 'Test provider description',
      image: '',
      isActive: true,
      isVerified: true
    },
  });
  console.log('✅ Test provider created:', provider.email);

  // Create test categories
  const cleaningCategory = await prisma.category.create({
    data: {
      titleAr: 'تنظيف',
      titleEn: 'Cleaning',
      state: 'Riyadh',
      image: ''
    },
  });
  console.log('✅ Cleaning category created');

  const maintenanceCategory = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      titleAr: 'صيانة',
      titleEn: 'Maintenance',
      state: 'Jeddah',
      image: ''
    },
  });
  console.log('✅ Maintenance category created');

  // Create test services
  const cleaningService = await prisma.service.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      titleAr: 'تنظيف المنزل',
      titleEn: 'House Cleaning',
      description: 'Professional house cleaning service',
      commission: 10.0,
      whatsapp: '+966501234567',
      categoryId: 1,
      image: ''
    },
  });
  console.log('✅ Cleaning service created');

  const maintenanceService = await prisma.service.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      titleAr: 'خدمة السباكة',
      titleEn: 'Plumbing Service',
      description: 'Professional plumbing maintenance',
      commission: 15.0,
      whatsapp: '+966501234568',
      categoryId: 2,
      image: ''
    },
  });
  console.log('✅ Maintenance service created');

  // Link provider to services
  await prisma.providerService.create({
    data: {
      providerId: provider.id,
      serviceId: cleaningService.id,
      price: 100.0,
      isActive: true
    },
  });
  console.log('✅ Provider linked to cleaning service');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('User: user@example.com / user123');
  console.log('Provider: provider@example.com / provider123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });