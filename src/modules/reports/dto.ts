export interface CreateReportDto {
  name: string;
  type: string;
  params?: Record<string, unknown>;
}

export interface ListReportsQueryDto {
  page?: number;
  limit?: number;
  type?: string;
}
