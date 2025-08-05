import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { ProvidersService } from './providers/providers.service';
import { CategoriesService } from './categories/categories.service';
import { ServicesService } from './services/services.service';
import { AuthService } from './auth/auth.service';
import { FilesService } from './files/files.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const providersService = app.get(ProvidersService);
  const categoriesService = app.get(CategoriesService);
  const servicesService = app.get(ServicesService);
  const authService = app.get(AuthService);
  const filesService = app.get(FilesService);

  // Seed a category
  const category = await categoriesService.create({
    image: 'http://localhost:3000/uploads/category.png',
    titleAr: 'تصنيف',
    titleEn: 'Category',
    state: 'Riyadh',
  });

  // Seed a service
  const service = await servicesService.create({
    image: 'http://localhost:3000/uploads/service.png',
    title: 'Test Service',
    description: 'Service Desc',
    commission: 10,
    whatsapp: '123456789',
    categoryId: category.id,
  });

  // Seed a user (using AuthService for hashing)
  await authService.register({
    name: 'Seed User',
    email: 'seeduser@example.com',
    password: 'password',
    image: 'http://localhost:3000/uploads/user.png',
    address: 'Seed Address',
    phone: '1234567890',
    state: 'active',
  });

  // Seed a provider with services
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
