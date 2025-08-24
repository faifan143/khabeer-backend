export class UserLocationResponseDto {
  id: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
