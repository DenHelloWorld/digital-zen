/**
 * Generic interface for backend API responses
 */
export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
