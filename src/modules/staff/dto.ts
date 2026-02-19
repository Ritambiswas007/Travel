export interface CreateStaffDto {
  email: string;
  password: string;
  name: string;
  department?: string;
}

export interface UpdateStaffDto {
  name?: string;
  department?: string;
  isActive?: boolean;
}

export interface ListStaffQueryDto {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}
