"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const offers_module_1 = require("./offers/offers.module");
const users_module_1 = require("./users/users.module");
const orders_module_1 = require("./orders/orders.module");
const invoices_module_1 = require("./invoices/invoices.module");
const services_module_1 = require("./services/services.module");
const providers_module_1 = require("./providers/providers.module");
const categories_module_1 = require("./categories/categories.module");
const provider_ratings_module_1 = require("./provider-ratings/provider-ratings.module");
const provider_service_module_1 = require("./provider-service/provider-service.module");
const provider_join_requests_module_1 = require("./provider-join-requests/provider-join-requests.module");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const files_module_1 = require("./files/files.module");
const health_module_1 = require("./health/health.module");
const search_module_1 = require("./search/search.module");
const admin_module_1 = require("./admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            prisma_module_1.PrismaModule,
            offers_module_1.OffersModule,
            users_module_1.UsersModule,
            orders_module_1.OrdersModule,
            invoices_module_1.InvoicesModule,
            services_module_1.ServicesModule,
            providers_module_1.ProvidersModule,
            categories_module_1.CategoriesModule,
            provider_ratings_module_1.ProviderRatingsModule,
            provider_service_module_1.ProviderServiceModule,
            provider_join_requests_module_1.ProviderJoinRequestsModule,
            auth_module_1.AuthModule,
            files_module_1.FilesModule,
            health_module_1.HealthModule,
            search_module_1.SearchModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map