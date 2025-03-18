import { APIResponse } from '@/utils/types/api-response';

export const buildPagination = (
  totalCount: number,
  currentPage: number,
  pageSize: number,
  sortField?: string,
  sortOrder?: 'asc' | 'desc',
  search?: string,
  filters?: Record<string, any>,
): APIResponse<any>['pagination'] => {
  return {
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageSize),
    pageSize,
    sorting: sortField
      ? { field: sortField, order: sortOrder || 'asc' }
      : undefined,
    search,
    filters,
  };
};

export const buildLinks = (
  baseUrl: string,
  currentPage: number,
  totalPages: number,
  pageSize: number,
): APIResponse<any>['links'] => {
  const links: APIResponse<any>['links'] = {};

  if (currentPage > 1) {
    links.prev = `${baseUrl}?page=${currentPage - 1}&limit=${pageSize}`;
    links.first = `${baseUrl}?page=1&limit=${pageSize}`;
  }

  if (currentPage < totalPages) {
    links.next = `${baseUrl}?page=${currentPage + 1}&limit=${pageSize}`;
    links.last = `${baseUrl}?page=${totalPages}&limit=${pageSize}`;
  }

  return links;
};
