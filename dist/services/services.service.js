"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ServicesService = class ServicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.service.findMany();
    }
    async findByCategory(categoryId) {
        return this.prisma.service.findMany({
            where: { categoryId },
            include: {
                category: true
            }
        });
    }
    async findById(id) {
        return this.prisma.service.findUnique({ where: { id } });
    }
    async create(data) {
        return this.prisma.service.create({ data });
    }
    async update(id, data) {
        return this.prisma.service.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            await tx.invoice.deleteMany({
                where: {
                    order: {
                        serviceId: id
                    }
                }
            });
            await tx.order.deleteMany({
                where: { serviceId: id }
            });
            await tx.providerService.deleteMany({
                where: { serviceId: id }
            });
            await tx.offer.deleteMany({
                where: { serviceId: id }
            });
            return tx.service.delete({
                where: { id }
            });
        });
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map