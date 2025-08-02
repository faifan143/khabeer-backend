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
const sms_service_1 = require("../sms/sms.service");
const bcrypt = require("bcryptjs");
const library_1 = require("@prisma/client/runtime/library");
let AuthService = class AuthService {
    usersService;
    providersService;
    smsService;
    jwtService;
    constructor(usersService, providersService, smsService, jwtService) {
        this.usersService = usersService;
        this.providersService = providersService;
        this.smsService = smsService;
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
    async sendPhoneLoginOtp(phoneLoginDto) {
        try {
            const { phoneNumber, purpose = 'registration' } = phoneLoginDto;
            if (purpose === 'registration') {
                const existingUser = await this.usersService.findByPhone(phoneNumber);
                const existingProvider = await this.providersService.findByPhone(phoneNumber);
                if (existingUser || existingProvider) {
                    return {
                        success: false,
                        message: 'Phone number is already registered'
                    };
                }
            }
            const result = await this.smsService.sendOtp({ phoneNumber, purpose });
            return {
                success: result.success,
                message: result.message,
                expiresIn: result.expiresIn
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to send OTP'
            };
        }
    }
    async phoneLogin(directPhoneLoginDto) {
        try {
            const { phoneNumber, password } = directPhoneLoginDto;
            const user = await this.usersService.findByPhone(phoneNumber);
            const provider = await this.providersService.findByPhone(phoneNumber);
            if (!user && !provider) {
                return {
                    success: false,
                    message: 'No account found with this phone number'
                };
            }
            let userData;
            let role = 'USER';
            if (user) {
                if (!user.isActive && user.role !== 'ADMIN') {
                    return {
                        success: false,
                        message: 'Account is not active'
                    };
                }
                userData = user;
                role = user.role;
            }
            else if (provider) {
                if (!provider.isVerified) {
                    return {
                        success: false,
                        message: 'Provider account is not verified'
                    };
                }
                userData = provider;
                role = 'PROVIDER';
            }
            if (password && userData.password) {
                const isPasswordValid = await bcrypt.compare(password, userData.password);
                if (!isPasswordValid) {
                    return {
                        success: false,
                        message: 'Invalid password'
                    };
                }
            }
            const payload = {
                username: userData.email || phoneNumber,
                sub: userData.id,
                role: role,
                phone: phoneNumber
            };
            const access_token = this.jwtService.sign(payload);
            return {
                success: true,
                message: 'Login successful',
                access_token,
                user: {
                    id: userData.id,
                    phone: phoneNumber,
                    role: role
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Login failed. Please try again.'
            };
        }
    }
    async registerWithPhone(data) {
        try {
            const { phoneNumber, otp, ...registerData } = data;
            if (otp) {
                const otpResult = await this.smsService.verifyOtp({
                    phoneNumber,
                    otp,
                    purpose: 'registration'
                });
                if (!otpResult.success) {
                    throw new common_1.BadRequestException(otpResult.message);
                }
            }
            const existingUser = await this.usersService.findByPhone(phoneNumber);
            const existingProvider = await this.providersService.findByPhone(phoneNumber);
            if (existingUser || existingProvider) {
                throw new common_1.ConflictException('Phone number is already registered');
            }
            const registrationData = {
                ...registerData,
                phone: phoneNumber
            };
            return this.register(registrationData);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Registration failed');
        }
    }
    async resetPasswordWithPhone(phoneNumber, otp, newPassword) {
        try {
            const otpResult = await this.smsService.verifyOtp({
                phoneNumber,
                otp,
                purpose: 'password_reset'
            });
            if (!otpResult.success) {
                return {
                    success: false,
                    message: otpResult.message
                };
            }
            const user = await this.usersService.findByPhone(phoneNumber);
            const provider = await this.providersService.findByPhone(phoneNumber);
            if (!user && !provider) {
                return {
                    success: false,
                    message: 'No account found with this phone number'
                };
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            if (user) {
                await this.usersService.update(user.id, { password: hashedPassword });
            }
            else if (provider) {
                await this.providersService.update(provider.id, { password: hashedPassword });
            }
            return {
                success: true,
                message: 'Password reset successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Password reset failed'
            };
        }
    }
    async initiateRegistration(data) {
        try {
            const { phoneNumber, ...registerData } = data;
            if (!registerData.email || !registerData.password || !registerData.name) {
                throw new common_1.BadRequestException('Email, password, and name are required');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(registerData.email)) {
                throw new common_1.BadRequestException('Invalid email format');
            }
            if (registerData.password.length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters long');
            }
            const existingUser = await this.usersService.findByEmail(registerData.email);
            const existingProvider = await this.providersService.findByEmail(registerData.email);
            if (existingUser || existingProvider) {
                throw new common_1.ConflictException('User with this email already exists');
            }
            const existingUserByPhone = await this.usersService.findByPhone(phoneNumber);
            const existingProviderByPhone = await this.providersService.findByPhone(phoneNumber);
            if (existingUserByPhone || existingProviderByPhone) {
                throw new common_1.ConflictException('Phone number is already registered');
            }
            const otpResult = await this.smsService.sendOtp({
                phoneNumber,
                purpose: 'registration'
            });
            return {
                success: otpResult.success,
                message: otpResult.message,
                expiresIn: otpResult.expiresIn
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Registration initiation failed');
        }
    }
    async completeRegistration(data) {
        try {
            const { phoneNumber, otp, ...registerData } = data;
            const otpResult = await this.smsService.verifyOtp({
                phoneNumber,
                otp,
                purpose: 'registration'
            });
            if (!otpResult.success) {
                throw new common_1.BadRequestException(otpResult.message);
            }
            if (!registerData.email || !registerData.password || !registerData.name) {
                throw new common_1.BadRequestException('Email, password, and name are required');
            }
            const existingUser = await this.usersService.findByEmail(registerData.email);
            const existingProvider = await this.providersService.findByEmail(registerData.email);
            if (existingUser || existingProvider) {
                throw new common_1.ConflictException('User with this email already exists');
            }
            const existingUserByPhone = await this.usersService.findByPhone(phoneNumber);
            const existingProviderByPhone = await this.providersService.findByPhone(phoneNumber);
            if (existingUserByPhone || existingProviderByPhone) {
                throw new common_1.ConflictException('Phone number is already registered');
            }
            const hashedPassword = await bcrypt.hash(registerData.password, 10);
            const userData = {
                name: registerData.name,
                email: registerData.email,
                password: hashedPassword,
                image: registerData.image || '',
                address: registerData.address || '',
                phone: phoneNumber,
                state: registerData.state || '',
                role: registerData.role || 'USER',
                isActive: registerData.isActive ?? true,
                officialDocuments: registerData.officialDocuments
            };
            if (registerData.role === 'PROVIDER') {
                const providerData = {
                    name: registerData.name,
                    email: registerData.email,
                    password: hashedPassword,
                    image: registerData.image || '',
                    description: registerData.description || '',
                    state: registerData.state || '',
                    phone: phoneNumber,
                    isActive: registerData.isActive ?? false,
                    isVerified: false,
                    location: null,
                    officialDocuments: registerData.officialDocuments || undefined,
                    serviceIds: registerData.serviceIds || []
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
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Registration completion failed');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        providers_service_1.ProvidersService,
        sms_service_1.SmsService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map