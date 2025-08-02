"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./prisma/prisma.service");
const bcrypt = require("bcryptjs");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const prisma = app.get(prisma_service_1.PrismaService);
    try {
        console.log('🌱 Starting admin seed...');
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
        if (existingAdmin) {
            console.log('✅ Admin already exists:', existingAdmin.email);
            return;
        }
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
                isActive: true
            }
        });
        console.log('✅ Admin created successfully:', admin.email);
        console.log('🔑 Default password: admin123');
        console.log('⚠️  Please change the password after first login!');
    }
    catch (error) {
        console.error('❌ Error creating admin:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed-admin.js.map