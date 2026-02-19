export interface CreatePackageDto {
  name: string;
  slug?: string;
  description?: string;
  summary?: string;
  imageUrl?: string;
  cityId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDesc?: string;
}

export interface UpdatePackageDto {
  name?: string;
  slug?: string;
  description?: string;
  summary?: string;
  imageUrl?: string;
  cityId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDesc?: string;
}

export interface CreateVariantDto {
  name: string;
  description?: string;
  basePrice: number;
  currency?: string;
  durationDays?: number;
  maxTravelers?: number;
  isDefault?: boolean;
}

export interface CreateItineraryDto {
  dayNumber: number;
  title: string;
  description?: string;
  activities?: string;
}

export interface CreateScheduleDto {
  startDate: string;
  endDate: string;
  availableSeats?: number;
}

export interface ListPackagesQueryDto {
  page?: number;
  limit?: number;
  cityId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
}
