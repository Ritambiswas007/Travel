export interface CreateReviewDto {
  packageId?: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  title?: string;
  comment?: string;
  isPublic?: boolean;
}

export interface ListReviewsQueryDto {
  page?: number;
  limit?: number;
  packageId?: string;
  rating?: number;
}
