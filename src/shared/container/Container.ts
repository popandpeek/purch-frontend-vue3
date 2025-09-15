/**
 * Dependency Injection Container
 * Manages service instances and dependencies
 */
export class Container {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();
  private singletons = new Map<string, any>();

  /**
   * Register a factory function for a service
   */
  register<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(token: string, factory: () => T): void {
    this.singletons.set(token, factory);
  }

  /**
   * Register a service instance
   */
  registerInstance<T>(token: string, instance: T): void {
    this.services.set(token, instance);
  }

  /**
   * Resolve a service
   */
  resolve<T>(token: string): T {
    // Check if we have a registered instance
    if (this.services.has(token)) {
      return this.services.get(token);
    }

    // Check if we have a singleton factory
    if (this.singletons.has(token)) {
      const factory = this.singletons.get(token);
      const instance = factory();
      this.services.set(token, instance); // Cache the instance
      return instance;
    }

    // Check if we have a regular factory
    if (this.factories.has(token)) {
      const factory = this.factories.get(token);
      return factory!();
    }

    throw new Error(`Service ${token} not found`);
  }

  /**
   * Check if a service is registered
   */
  has(token: string): boolean {
    return this.services.has(token) || 
           this.factories.has(token) || 
           this.singletons.has(token);
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
  }

  /**
   * Get all registered service tokens
   */
  getTokens(): string[] {
    const tokens = new Set([
      ...this.services.keys(),
      ...this.factories.keys(),
      ...this.singletons.keys()
    ]);
    return Array.from(tokens);
  }
}

// Service tokens
export const SERVICE_TOKENS = {
  // Infrastructure
  API_CLIENT: 'ApiClient',
  
  // Repositories
  PRODUCT_REPOSITORY: 'ProductRepository',
  VENDOR_SELECTION_REPOSITORY: 'VendorSelectionRepository',
  
  // Services
  PRODUCT_SERVICE: 'ProductService',
  VENDOR_SELECTION_SERVICE: 'VendorSelectionService',
  
  // Other services
  NOTIFICATION_SERVICE: 'NotificationService',
  LOGGING_SERVICE: 'LoggingService'
} as const;

// Create global container instance
export const container = new Container();
