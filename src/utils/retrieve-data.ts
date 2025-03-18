import { APIResponse } from './types/api-response';

export function retrieveData<T>(response: APIResponse<T>): T {
  if (Array.isArray(response.data)) {
    if (response.data.length === 0) {
      throw new Error('Data not found');
    }
    return response.data[0];
  }

  if (!response.data) {
    throw new Error('Data not found');
  }

  return response.data;
}
