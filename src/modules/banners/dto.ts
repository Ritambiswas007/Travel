export interface CreateBannerDto {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position?: string;
  sortOrder?: number;
  startAt?: string;
  endAt?: string;
}

export interface UpdateBannerDto {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  position?: string;
  sortOrder?: number;
  isActive?: boolean;
  startAt?: string;
  endAt?: string;
}
