export interface CreateFormDto {
  name: string;
  code: string;
  description?: string;
}

export interface CreateFieldDto {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: Record<string, unknown>;
  sortOrder?: number;
}

export interface SubmitFormDto {
  data: Record<string, unknown>;
}
