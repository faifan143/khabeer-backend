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
exports.TrackOrderDto = exports.StopTrackingDto = exports.StartTrackingDto = exports.LocationUpdateDto = void 0;
const class_validator_1 = require("class-validator");
class LocationUpdateDto {
    latitude;
    longitude;
    accuracy;
    orderId;
    isActive;
}
exports.LocationUpdateDto = LocationUpdateDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LocationUpdateDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LocationUpdateDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LocationUpdateDto.prototype, "accuracy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationUpdateDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LocationUpdateDto.prototype, "isActive", void 0);
class StartTrackingDto {
    orderId;
    updateInterval;
}
exports.StartTrackingDto = StartTrackingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartTrackingDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StartTrackingDto.prototype, "updateInterval", void 0);
class StopTrackingDto {
    orderId;
}
exports.StopTrackingDto = StopTrackingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StopTrackingDto.prototype, "orderId", void 0);
class TrackOrderDto {
    orderId;
}
exports.TrackOrderDto = TrackOrderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackOrderDto.prototype, "orderId", void 0);
//# sourceMappingURL=location-update.dto.js.map