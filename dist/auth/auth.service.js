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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const providers_service_1 = require("../providers/providers.service");
const bcrypt = require("bcryptjs");
const library_1 = require("@prisma/client/runtime/library");
let AuthService = class AuthService {
    usersService;
    providersService;
    jwtService;
    constructor(usersService, providersService, jwtService) {
        this.usersService = usersService;
        this.providersService = providersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        try {
            const [user, provider] = await Promise.all([
                this.usersService.findByEmail(email),
                this.providersService.findByEmail(email)
            ]);
            if (user && provider) {
                if (provider.password && provider.password.trim() !== '' && await bcrypt.compare(pass, provider.password)) {
                    if (!provider.isVerified) {
                        throw new common_1.UnauthorizedException('Your account is not verified. Please wait for admin verification.');
                    }
                    const { password, ...result } = provider;
                    return { ...result, role: 'PROVIDER' };
                }
                if (user.password && await bcrypt.compare(pass, user.password)) {
                    const { password, ...result } = user;
                    return { ...result, role: user.role };
                }
            }
            else if (user && await bcrypt.compare(pass, user.password)) {
                const { password, ...result } = user;
                return { ...result, role: user.role };
            }
            else if (provider && provider.password && provider.password.trim() !== '' && await bcrypt.compare(pass, provider.password)) {
                if (!provider.isVerified) {
                    throw new common_1.UnauthorizedException('Your account is not verified. Please wait for admin verification.');
                }
                const { password, ...result } = provider;
                return { ...result, role: 'PROVIDER' };
            }
            return null;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            console.error('Authentication error:', error);
            throw new common_1.InternalServerErrorException('Error validating user credentials');
        }
    }
    async login(user) {
        try {
            const payload = { username: user.email, sub: user.id, role: user.role };
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error generating authentication token');
        }
    }
    async register(data) {
        try {
            if (!data.email || !data.password || !data.name) {
                throw new common_1.BadRequestException('Email, password, and name are required');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new common_1.BadRequestException('Invalid email format');
            }
            if (data.password.length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters long');
            }
            const existingUser = await this.usersService.findByEmail(data.email);
            const existingProvider = await this.providersService.findByEmail(data.email);
            if (existingUser || existingProvider) {
                throw new common_1.ConflictException('User with this email already exists');
            }
            const hashedPassword = await bcrypt.hash(data.password, 10);
            const userData = {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                image: data.image || '',
                address: data.address || '',
                phone: data.phone || '',
                state: data.state || '',
                role: data.role || 'USER',
                isActive: data.isActive ?? true,
                officialDocuments: data.officialDocuments
            };
            if (data.role === 'PROVIDER') {
                const providerData = {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    image: data.image || '',
                    description: data.description || '',
                    state: data.state || '',
                    phone: data.phone || '',
                    isActive: data.isActive ?? false,
                    isVerified: false,
                    location: null,
                    officialDocuments: data.officialDocuments || undefined,
                    serviceIds: data.serviceIds || []
                };
                const provider = await this.providersService.registerProviderWithServices(providerData);
                const { password, ...result } = provider;
                return {
                    ...result,
                    role: 'PROVIDER',
                    message: 'Provider registered successfully. Please wait for admin verification to login.'
                };
            }
            else {
                const user = await this.usersService.create(userData);
                const { password, ...result } = user;
                return {
                    ...result,
                    role: 'USER',
                    message: 'User registered successfully'
                };
            }
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
                            throw new common_1.ConflictException('User with this email already exists');
                        }
                        break;
                    case 'P2003':
                        throw new common_1.BadRequestException('Invalid reference data provided');
                    case 'P2025':
                        throw new common_1.BadRequestException('Record not found');
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ConflictException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            console.error('Registration error:', error);
            throw new common_1.InternalServerErrorException('Registration failed. Please try again.');
        }
    }
    async upgradeToProvider(userId, providerData) {
        try {
            const user = await this.usersService.findById(userId);
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const existingProvider = await this.providersService.findByEmail(user.email);
            if (existingProvider) {
                throw new common_1.ConflictException('Provider with this email already exists');
            }
            const newProvider = await this.providersService.create({
                name: user.name,
                email: user.email,
                password: user.password,
                image: user.image,
                description: providerData.description || '',
                state: user.state,
                phone: user.phone,
                isActive: false,
                isVerified: false,
                location: null,
                officialDocuments: providerData.officialDocuments || null
            });
            return {
                ...newProvider,
                role: 'PROVIDER',
                message: 'Account upgraded to provider successfully. Please wait for admin approval.'
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error upgrading account to provider');
        }
    }
    async checkAccountStatus(email) {
        try {
            const user = await this.usersService.findByEmail(email);
            if (user) {
                if (user.role === 'ADMIN') {
                    return {
                        exists: true,
                        type: 'ADMIN',
                        isActive: true,
                        isVerified: true,
                        message: 'Admin account is active and verified.'
                    };
                }
                else {
                    return {
                        exists: true,
                        type: 'USER',
                        isActive: user.isActive,
                        isVerified: true,
                        message: 'User account is ready to use. isActive status does not affect login.'
                    };
                }
            }
            const provider = await this.providersService.findByEmail(email);
            if (provider) {
                return {
                    exists: true,
                    type: 'PROVIDER',
                    isActive: provider.isActive,
                    isVerified: provider.isVerified,
                    message: !provider.isVerified ? 'Account is not verified. Please wait for admin verification.' :
                        !provider.isActive ? 'Account is verified but currently inactive. You can activate it to accept orders.' :
                            'Account is verified and active.'
                };
            }
            return {
                exists: false,
                message: 'Account not found'
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error checking account status');
        }
    }
    async activateProviderAccount(providerId) {
        try {
            console.log('Attempting to activate provider with ID:', providerId);
            const provider = await this.providersService.findById(providerId);
            if (!provider.isVerified) {
                throw new common_1.BadRequestException('Your account must be verified by admin before you can activate it.');
            }
            const updatedProvider = await this.providersService.update(provider.id, { isActive: true });
            return {
                ...updatedProvider,
                message: 'Account activated successfully. You can now accept orders.'
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.error('Error activating provider account:', error);
            throw new common_1.InternalServerErrorException('Error activating account');
        }
    }
    async deactivateProviderAccount(providerId) {
        try {
            console.log('Attempting to deactivate provider with ID:', providerId);
            const provider = await this.providersService.findById(providerId);
            const updatedProvider = await this.providersService.update(provider.id, { isActive: false });
            return {
                ...updatedProvider,
                message: 'Account deactivated successfully. You will not receive new orders.'
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error('Error deactivating provider account:', error);
            throw new common_1.InternalServerErrorException('Error deactivating account');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        providers_service_1.ProvidersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map