export class AdminProviderServiceDto {
  id: number;
  price: number;
  isActive: boolean;
  service: {
    id: number;
    titleAr: string;
    titleEn: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    image: string;
    commission: number | null;
    category: {
      id: number;
      titleEn: string;
      titleAr: string;
      image: string;
      state: string;
    };
  };
}

export class AdminProviderOfferDto {
  id: number;
  originalPrice: number;
  offerPrice: number;
}

export class AdminProviderOrderDto {
  id: number;
  status: string;
  orderDate: Date;
  commissionAmount: number;
  providerAmount: number;
  providerNetAmount: number;
  totalAmount: number;
}

export class AdminProviderResponseDto {
  // Basic provider information
  id: number;
  name: string;
  email?: string | null;
  phone: string;
  description: string;
  image: string;
  state: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Commission and earnings information
  totalCommission: number;
  totalEarnings: number;
  totalNetEarnings: number;

  // Order statistics
  completedOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  inProgressOrders: number;
  offeredOrders: number;

  // Related services
  providerServices: AdminProviderServiceDto[];

  // Active offers
  offers: AdminProviderOfferDto[];

  // Orders
  orders: AdminProviderOrderDto[];

  // Counts
  _count: {
    orders: number;
    providerServices: number;
    ratings: number;
  };
}

export class AdminProvidersResponseDto {
  providers: AdminProviderResponseDto[];
  total: number;
}
