import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
/**
 * Wrapper service for performing HTTP requests via Angular HttpClient.
 * Provides typed helper methods for GET, POST, PUT, PATCH and DELETE.
 */
export class ApiService {
  /**
   * Injected Angular HttpClient instance.
   * @private
   * @readonly
   */
  readonly #http: HttpClient = inject(HttpClient);

  /**
   * Perform a GET request.
   * @template T Expected response type.
   * @param {string} url Endpoint URL.
   * @param {Record<string, string | string[]>} [params={}] Query parameters (converted to HttpParams).
   * @param {Record<string, string>} [headers={}] Optional headers to include in the request.
   * @returns {Observable<T>} Observable emitting the response typed as T.
   */
  public get<T>(
    url: string,
    params: Record<string, string | string[]> = {},
    headers?: Record<string, string>
  ): Observable<T> {
    return this.#http.get<T>(url, {
      params: new HttpParams({ fromObject: params }),
      ...(headers && { headers }),
    });
  }

  /**
   * Perform a POST request.
   * @template T Expected response type.
   * @param {string} url Endpoint URL.
   * @param {unknown} body Request body.
   * @returns {Observable<T>} Observable emitting the response typed as T.
   */
  public post<T>(url: string, body: unknown): Observable<T> {
    return this.#http.post<T>(url, body);
  }

  /**
   * Perform a PUT request.
   * @template T Expected response type.
   * @param {string} url Endpoint URL.
   * @param {unknown} body Request body.
   * @returns {Observable<T>} Observable emitting the response typed as T.
   */
  public put<T>(url: string, body: unknown): Observable<T> {
    return this.#http.put<T>(url, body);
  }

  /**
   * Perform a PATCH request.
   * @template T Expected response type.
   * @param {string} url Endpoint URL.
   * @param {unknown} body Request body.
   * @returns {Observable<T>} Observable emitting the response typed as T.
   */
  public patch<T>(url: string, body: unknown): Observable<T> {
    return this.#http.patch<T>(url, body);
  }

  /**
   * Perform a DELETE request.
   * @template T Expected response type.
   * @param {string} url Endpoint URL.
   * @returns {Observable<T>} Observable emitting the response typed as T.
   */
  public delete<T>(url: string): Observable<T> {
    return this.#http.delete<T>(url);
  }
}
