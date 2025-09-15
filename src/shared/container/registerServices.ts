import { container, SERVICE_TOKENS } from './Container';
import { ApiClient } from '@/infrastructure/api/ApiClient';
import { ProductRepository } from '@/infrastructure/repositories/ProductRepository';
import { VendorSelectionRepository } from '@/infrastructure/repositories/VendorSelectionRepository';
import { ProductService } from '@/application/services/ProductService';
import { VendorSelectionService } from '@/application/services/VendorSelectionService';

/**
 * Register all services in the dependency injection container
 */
export function registerServices(): void {
  // Infrastructure services
  container.registerSingleton(SERVICE_TOKENS.API_CLIENT, () => {
    return new ApiClient();
  });

  // Repositories
  container.register(SERVICE_TOKENS.PRODUCT_REPOSITORY, () => {
    const apiClient = container.resolve<ApiClient>(SERVICE_TOKENS.API_CLIENT);
    return new ProductRepository(apiClient);
  });

  container.register(SERVICE_TOKENS.VENDOR_SELECTION_REPOSITORY, () => {
    const apiClient = container.resolve<ApiClient>(SERVICE_TOKENS.API_CLIENT);
    return new VendorSelectionRepository(apiClient);
  });

  // Application services
  container.register(SERVICE_TOKENS.PRODUCT_SERVICE, () => {
    const productRepository = container.resolve<ProductRepository>(SERVICE_TOKENS.PRODUCT_REPOSITORY);
    // const vendorSelectionRepository = container.resolve<VendorSelectionRepository>(SERVICE_TOKENS.VENDOR_SELECTION_REPOSITORY);
    return new ProductService(productRepository);
  });

  container.register(SERVICE_TOKENS.VENDOR_SELECTION_SERVICE, () => {
    const vendorSelectionRepository = container.resolve<VendorSelectionRepository>(SERVICE_TOKENS.VENDOR_SELECTION_REPOSITORY);
    // const productRepository = container.resolve<ProductRepository>(SERVICE_TOKENS.PRODUCT_REPOSITORY);
    return new VendorSelectionService(vendorSelectionRepository);
  });

  // Additional services can be registered here
  // container.registerSingleton(SERVICE_TOKENS.NOTIFICATION_SERVICE, () => new NotificationService());
  // container.registerSingleton(SERVICE_TOKENS.LOGGING_SERVICE, () => new LoggingService());
}

/**
 * Initialize services with configuration
 */
export function initializeServices(config: {
  apiBaseUrl?: string;
  authToken?: string;
}): void {
  // Register all services
  registerServices();

  // Configure API client
  if (config.apiBaseUrl) {
    // const apiClient = container.resolve<ApiClient>(SERVICE_TOKENS.API_CLIENT);
    // Update base URL if needed
    // apiClient.setBaseUrl(config.apiBaseUrl);
  }

  if (config.authToken) {
    const apiClient = container.resolve<ApiClient>(SERVICE_TOKENS.API_CLIENT);
    apiClient.setAuthToken(config.authToken);
  }
}
