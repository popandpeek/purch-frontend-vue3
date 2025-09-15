import { BaseEntity } from './BaseEntity';

export type UnitType = 'each' | 'pound' | 'gallon' | 'dozen' | 'case' | 'box' | 'bag' | 'bottle';

/**
 * Product Entity
 * Represents a house item/product with business logic
 */
export class Product extends BaseEntity {
  private _name: string;
  private _price: number;
  private _active: boolean;
  private _storageLocation: string;
  private _inventoryCategory: string;
  private _trackingUnit: UnitType;
  private _parLevel: number;
  private _currentCount: number;
  private _defaultVendorItemId?: number;

  constructor(
    id: string | number,
    name: string,
    price: number,
    storageLocation: string,
    inventoryCategory: string,
    trackingUnit: UnitType,
    parLevel: number,
    currentCount: number = 0,
    active: boolean = true,
    defaultVendorItemId?: number,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._name = name;
    this._price = price;
    this._active = active;
    this._storageLocation = storageLocation;
    this._inventoryCategory = inventoryCategory;
    this._trackingUnit = trackingUnit;
    this._parLevel = parLevel;
    this._currentCount = currentCount;
    this._defaultVendorItemId = defaultVendorItemId;
    
    this.validate();
  }

  // Getters
  get name(): string { return this._name; }
  get price(): number { return this._price; }
  get active(): boolean { return this._active; }
  get storageLocation(): string { return this._storageLocation; }
  get inventoryCategory(): string { return this._inventoryCategory; }
  get trackingUnit(): UnitType { return this._trackingUnit; }
  get parLevel(): number { return this._parLevel; }
  get currentCount(): number { return this._currentCount; }
  get defaultVendorItemId(): number | undefined { return this._defaultVendorItemId; }

  // Business Logic Methods
  public updateName(name: string): void {
    if (!name.trim()) {
      throw new Error('Product name cannot be empty');
    }
    this._name = name;
    this.updateTimestamp();
  }

  public updatePrice(price: number): void {
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }
    this._price = price;
    this.updateTimestamp();
  }

  public updateStorageLocation(location: string): void {
    if (!location.trim()) {
      throw new Error('Storage location cannot be empty');
    }
    this._storageLocation = location;
    this.updateTimestamp();
  }

  public updateParLevel(parLevel: number): void {
    if (parLevel < 0) {
      throw new Error('Par level cannot be negative');
    }
    this._parLevel = parLevel;
    this.updateTimestamp();
  }

  public updateCurrentCount(count: number): void {
    if (count < 0) {
      throw new Error('Current count cannot be negative');
    }
    this._currentCount = count;
    this.updateTimestamp();
  }

  public adjustCount(adjustment: number): void {
    const newCount = this._currentCount + adjustment;
    this.updateCurrentCount(newCount);
  }

  public activate(): void {
    this._active = true;
    this.updateTimestamp();
  }

  public deactivate(): void {
    this._active = false;
    this.updateTimestamp();
  }

  public setDefaultVendorItem(vendorItemId: number): void {
    this._defaultVendorItemId = vendorItemId;
    this.updateTimestamp();
  }

  // Stock Status Methods
  public isLowStock(): boolean {
    return this._currentCount < this._parLevel && this._currentCount > 0;
  }

  public isOutOfStock(): boolean {
    return this._currentCount === 0;
  }

  public isOverstocked(): boolean {
    return this._currentCount > (this._parLevel * 2);
  }

  public isCriticalStock(): boolean {
    return this._currentCount < (this._parLevel * 0.5) && this._currentCount > 0;
  }

  public getStockStatus(): 'normal' | 'low_stock' | 'out_of_stock' | 'critical' | 'overstocked' {
    if (this.isOutOfStock()) return 'out_of_stock';
    if (this.isCriticalStock()) return 'critical';
    if (this.isLowStock()) return 'low_stock';
    if (this.isOverstocked()) return 'overstocked';
    return 'normal';
  }

  public getStockPercentage(): number {
    if (this._parLevel === 0) return 0;
    return Math.min(100, Math.round((this._currentCount / this._parLevel) * 100));
  }

  public needsReorder(): boolean {
    return this._active && this.isLowStock();
  }

  public calculateReorderQuantity(): number {
    return Math.max(0, this._parLevel - this._currentCount);
  }

  // Display Methods
  public getDisplayName(): string {
    return this._name;
  }

  public getFormattedPrice(): string {
    return `$${this._price.toFixed(2)}`;
  }

  public getStockDisplayText(): string {
    const status = this.getStockStatus();
    switch (status) {
      case 'out_of_stock': return 'Out of Stock';
      case 'critical': return 'Critical Stock';
      case 'low_stock': return 'Low Stock';
      case 'overstocked': return 'Overstocked';
      default: return 'In Stock';
    }
  }

  // Validation
  protected validate(): void {
    if (!this._name.trim()) {
      throw new Error('Product name is required');
    }
    if (this._price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (!this._storageLocation.trim()) {
      throw new Error('Storage location is required');
    }
    if (!this._inventoryCategory.trim()) {
      throw new Error('Inventory category is required');
    }
    if (this._parLevel < 0) {
      throw new Error('Par level cannot be negative');
    }
    if (this._currentCount < 0) {
      throw new Error('Current count cannot be negative');
    }
  }

  // JSON Serialization
  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      name: this._name,
      price: this._price,
      active: this._active,
      storage_location: this._storageLocation,
      inventory_category: this._inventoryCategory,
      tracking_unit: this._trackingUnit,
      par_level: this._parLevel,
      current_count: this._currentCount,
      default_vendor_item_id: this._defaultVendorItemId
    };
  }

  // Factory method for creating from API data
  public static fromAPI(data: any): Product {
    return new Product(
      data.id,
      data.name,
      parseFloat(data.current_price_per_unit || data.price || '0'),
      data.storage_location,
      data.inventory_category,
      data.tracking_unit,
      data.par_level,
      data.current_count,
      data.active !== false,
      data.default_vendor_item_id,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}
