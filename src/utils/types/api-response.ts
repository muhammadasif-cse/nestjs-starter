export interface APIResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  error?: string;
  data?: T | T[] | null;
  pagination?: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    sorting?: {
      field: string;
      order: 'asc' | 'desc';
    };
    search?: string;
    filters?: Record<string, string | number | boolean>;
  };
  links?: {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
  timestamp?: string;
  locale?: string;
}
