/**
 * API Client
 * Handles all HTTP requests to the backend API with authentication and error handling
 */
export class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = 'http://localhost:8000/api/v1') {
    this.baseURL = baseURL;
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  public clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Get default headers for requests
   */
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.getDefaultHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new ApiError(response.status, response.statusText, await response.text());
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new ApiError(0, 'Network Error', errorMessage);
    }
  }

  /**
   * GET request
   */
  public async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  public async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  public async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  public async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // House Items API
  public async getHouseItems(): Promise<any[]> {
    return this.get<any[]>('/house-items/');
  }

  public async getHouseItem(id: string | number): Promise<any> {
    return this.get<any>(`/house-items/${id}`);
  }

  public async createHouseItem(data: any): Promise<any> {
    return this.post<any>('/house-items/', data);
  }

  public async updateHouseItem(id: string | number, data: any): Promise<any> {
    return this.put<any>(`/house-items/${id}`, data);
  }

  public async deleteHouseItem(id: string | number): Promise<void> {
    return this.delete<void>(`/house-items/${id}`);
  }

  // Inventory API
  public async getInventories(): Promise<any[]> {
    return this.get<any[]>('/inventories/');
  }

  public async getInventoryLocations(): Promise<any[]> {
    return this.get<any[]>('/inventories/locations/');
  }

  public async getInventoryByLocation(location: string): Promise<any[]> {
    return this.get<any[]>(`/inventories/location/${location}`);
  }

  public async getInventorySummary(): Promise<any> {
    return this.get<any>('/inventories/summary/');
  }

  // House Orders API
  public async getHouseOrders(): Promise<any[]> {
    return this.get<any[]>('/house-orders/');
  }

  public async getHouseOrder(id: string | number): Promise<any> {
    return this.get<any>(`/house-orders/${id}`);
  }

  public async createHouseOrder(data: any): Promise<any> {
    return this.post<any>('/house-orders/', data);
  }

  public async updateHouseOrder(id: string | number, data: any): Promise<any> {
    return this.put<any>(`/house-orders/${id}`, data);
  }

  public async deleteHouseOrder(id: string | number): Promise<void> {
    return this.delete<void>(`/house-orders/${id}`);
  }

  // Vendor Selection API (NEW FEATURES)
  public async getVendorSelections(orderId: string | number): Promise<any[]> {
    return this.get<any[]>(`/house-orders/${orderId}/vendor-selections`);
  }

  public async overrideVendorSelection(itemId: string | number, vendorItemId: number): Promise<any> {
    return this.post<any>(`/house-orders/items/${itemId}/override-vendor-selection`, {
      vendor_item_id: vendorItemId
    });
  }

  public async getConfigInheritance(itemId: string | number): Promise<any> {
    return this.get<any>(`/house-orders/items/${itemId}/config-inheritance`);
  }

  public async updateVendorSelectionConfig(level: string, id: string | number, data: any): Promise<any> {
    return this.put<any>(`/vendor-selection-config/${level}/${id}`, data);
  }

  // Vendors API
  public async getVendors(): Promise<any[]> {
    return this.get<any[]>('/vendors/');
  }

  public async getVendor(id: string | number): Promise<any> {
    return this.get<any>(`/vendors/${id}`);
  }

  public async createVendor(data: any): Promise<any> {
    return this.post<any>('/vendors/', data);
  }

  public async updateVendor(id: string | number, data: any): Promise<any> {
    return this.put<any>(`/vendors/${id}`, data);
  }

  public async deleteVendor(id: string | number): Promise<void> {
    return this.delete<void>(`/vendors/${id}`);
  }

  // Vendor Items API
  public async getVendorItems(): Promise<any[]> {
    return this.get<any[]>('/vendor-items/');
  }

  public async getVendorItem(id: string | number): Promise<any> {
    return this.get<any>(`/vendor-items/${id}`);
  }

  public async createVendorItem(data: any): Promise<any> {
    return this.post<any>('/vendor-items/', data);
  }

  public async updateVendorItem(id: string | number, data: any): Promise<any> {
    return this.put<any>(`/vendor-items/${id}`, data);
  }

  public async deleteVendorItem(id: string | number): Promise<void> {
    return this.delete<void>(`/vendor-items/${id}`);
  }
}

/**
 * API Error Class
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public response: string;

  constructor(status: number, statusText: string, response: string) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }

  public isUnauthorized(): boolean {
    return this.status === 401;
  }

  public isForbidden(): boolean {
    return this.status === 403;
  }

  public isNotFound(): boolean {
    return this.status === 404;
  }

  public isValidationError(): boolean {
    return this.status === 422;
  }

  public isServerError(): boolean {
    return this.status >= 500;
  }

  public getValidationErrors(): any[] {
    if (this.isValidationError()) {
      try {
        return JSON.parse(this.response);
      } catch {
        return [];
      }
    }
    return [];
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
