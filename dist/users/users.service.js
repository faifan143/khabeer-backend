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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        try {
            return await this.prisma.user.findUnique({ where: { email } });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error finding user by email');
        }
    }
    async create(data) {
        try {
            const userData = {
                ...data,
                image: data.image || '',
                address: data.address || '',
                phone: data.phone || '',
                state: data.state || '',
                isActive: data.isActive ?? true
            };
            return await this.prisma.user.create({ data: userData });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
                            throw new common_1.BadRequestException('User with this email already exists');
                        }
                        break;
                    case 'P2003':
                        throw new common_1.BadRequestException('Invalid reference data provided');
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error creating user');
        }
    }
    async findAll() {
        try {
            return await this.prisma.user.findMany();
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error fetching users');
        }
    }
    async findById(id) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error finding user');
        }
    }
    async update(id, data) {
        try {
            const user = await this.prisma.user.update({ where: { id }, data });
            return user;
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        throw new common_1.NotFoundException(`User with ID ${id} not found`);
                    case 'P2002':
                        if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
                            throw new common_1.BadRequestException('User with this email already exists');
                        }
                        break;
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error updating user');
        }
    }
    async remove(id) {
        try {
            await this.prisma.user.delete({ where: { id } });
            return { message: 'User deleted successfully' };
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        throw new common_1.NotFoundException(`User with ID ${id} not found`);
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error deleting user');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map