export interface CreateVisaApplicationDto {
  country: string;
  type: string;
}

export interface UpdateVisaApplicationDto {
  country?: string;
  type?: string;
  status?: string;
}

export interface AddVisaDocumentDto {
  type: string;
  fileUrl: string;
  storagePath?: string;
}
