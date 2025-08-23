"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidersByServiceResponseDto = exports.ProviderByServiceDto = exports.ProviderServiceInfoDto = void 0;
class ProviderServiceInfoDto {
    price;
    isActive;
}
exports.ProviderServiceInfoDto = ProviderServiceInfoDto;
class ProviderByServiceDto {
    id;
    name;
    image;
    description;
    state;
    phone;
    location;
    isActive;
    isVerified;
    createdAt;
    providerServices;
}
exports.ProviderByServiceDto = ProviderByServiceDto;
class ProvidersByServiceResponseDto {
    providers;
    total;
    serviceId;
}
exports.ProvidersByServiceResponseDto = ProvidersByServiceResponseDto;
//# sourceMappingURL=providers-by-service-response.dto.js.map