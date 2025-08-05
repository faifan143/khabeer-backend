"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const users_service_1 = require("./users/users.service");
const providers_service_1 = require("./providers/providers.service");
const categories_service_1 = require("./categories/categories.service");
const services_service_1 = require("./services/services.service");
const auth_service_1 = require("./auth/auth.service");
const files_service_1 = require("./files/files.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
    const providersService = app.get(providers_service_1.ProvidersService);
    const categoriesService = app.get(categories_service_1.CategoriesService);
    const servicesService = app.get(services_service_1.ServicesService);
    const authService = app.get(auth_service_1.AuthService);
    const filesService = app.get(files_service_1.FilesService);
    const category = await categoriesService.create({
        image: 'http://localhost:3000/uploads/category.png',
        titleAr: 'تصنيف',
        titleEn: 'Category',
        state: 'Riyadh',
    });
    const service = await servicesService.create({
        image: 'http://localhost:3000/uploads/service.png',
        title: 'Test Service',
        description: 'Service Desc',
        commission: 10,
        whatsapp: '123456789',
        categoryId: category.id,
    });
    await authService.register({
        name: 'Seed User',
        email: 'seeduser@example.com',
        password: 'password',
        image: 'http://localhost:3000/uploads/user.png',
        address: 'Seed Address',
        phone: '1234567890',
        state: 'active',
    });
    await providersService.registerProviderWithServices({
        name: 'Seed Provider',
        image: 'http://localhost:3000/uploads/provider.png',
        description: 'Seed Provider Desc',
        state: 'active',
        phone: '0987654321',
        serviceIds: [service.id],
    });
    await app.close();
    console.log('Seeding complete!');
}
bootstrap();
//# sourceMappingURL=seed.js.map