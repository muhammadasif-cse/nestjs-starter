export interface APIResponse<T> {
  statusCode: number;
  message: string;
  error?: string;
  data?: T[] | T;
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

export const createSuccessResponse = <T>(
  statusCode: number,
  message: string,
  data?: T[] | T,
  meta?: APIResponse<T>['meta'],
): APIResponse<T> => ({
  statusCode,
  message,
  data,
  meta,
});

export const createErrorResponse = <T>(
  statusCode: number,
  message: string,
  error: string,
): APIResponse<T> => ({
  statusCode,
  message,
  error,
});
