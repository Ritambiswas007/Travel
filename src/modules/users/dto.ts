export interface UpdateProfileDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ListUsersQueryDto {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}
