import { IsNumber, IsPositive } from 'class-validator';

export class ServiceWithPriceDto {
    @IsNumber()
    serviceId: number;

    @IsNumber()
    @IsPositive()
    price: number;
}
