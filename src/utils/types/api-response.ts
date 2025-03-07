export interface APIResponse<T> {
  statusCode: number;
  message: string;
  error?: string;
  data?: T | T[] | null;
  meta?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    sortBy: string;
    search?: string;
    sortOrder: 'ASC' | 'DESC';
  };
}
