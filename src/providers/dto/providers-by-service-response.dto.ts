export class ProviderServiceInfoDto {
  price: number;
  isActive: boolean;
  offerPrice: number | null; // Add offer price field
}

export class ProviderByServiceDto {
  id: number;
  name: string;
  image: string;
  description: string;
  state: string;
  phone: string;
  location: any;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  providerServices: ProviderServiceInfoDto[];
}

export class ProvidersByServiceResponseDto {
  providers: ProviderByServiceDto[];
  total: number;
  serviceId: number;
}
