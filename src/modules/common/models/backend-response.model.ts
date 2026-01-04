/**
 * Generic interface for backend API responses
 */
export interface IBackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
