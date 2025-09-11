import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateUpdateAuditDto {
    @IsString()
    version: string;

    @IsBoolean()
    @IsOptional()
    requiresUpdate?: boolean = false;

    @IsString()
    @IsOptional()
    description?: string;
}
