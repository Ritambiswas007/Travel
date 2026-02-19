export interface CreateCityDto {
  name: string;
  slug?: string;
  country?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface UpdateCityDto {
  name?: string;
  slug?: string;
  country?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}
