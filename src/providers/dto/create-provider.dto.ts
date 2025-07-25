export class CreateProviderDto {
  name: string;
  image: string;
  description: string;
  state: string;
  phone: string;
  isActive?: boolean;
  officialDocuments?: string;
  serviceIds: number[]; // IDs of services the provider offers
}
