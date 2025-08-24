"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderOrdersResponseDto = exports.ProviderOrderResponseDto = void 0;
class ProviderOrderResponseDto {
    id;
    status;
    orderDate;
    scheduledDate;
    location;
    locationDetails;
    quantity;
    totalAmount;
    providerAmount;
    commissionAmount;
    bookingId;
    user;
    service;
    duration;
}
exports.ProviderOrderResponseDto = ProviderOrderResponseDto;
class ProviderOrdersResponseDto {
    orders;
    total;
    status;
}
exports.ProviderOrdersResponseDto = ProviderOrdersResponseDto;
//# sourceMappingURL=provider-orders-response.dto.js.map