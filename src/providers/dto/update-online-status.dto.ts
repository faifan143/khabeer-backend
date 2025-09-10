import { IsBoolean } from 'class-validator';

export class UpdateOnlineStatusDto {
    @IsBoolean()
    onlineStatus: boolean;
}
