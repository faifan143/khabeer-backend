const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin seed...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@khabeer.com',
        password: hashedPassword,
        role: 'ADMIN',
        image: '',
        address: '',
        phone: '+966500000000',
        state: 'Riyadh',
        isActive: true,
      },
    });

    console.log('✅ Admin created successfully:', admin.email);
    console.log('🔑 Default password: admin123');
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
