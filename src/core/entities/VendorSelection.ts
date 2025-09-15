import { BaseEntity } from './BaseEntity';

export type SelectionStrategy = 'lowest_price' | 'best_value' | 'preferred_vendor' | 'delivery_optimization';
export type QualityPreference = 'budget' | 'standard' | 'premium';

export interface SelectionReason {
  strategy: SelectionStrategy;
  reason: string;
  confidence_score: number;
}

export interface Alternative {
  vendor_item_id: number;
  cost_difference: number;
  vendor_item: {
    id: number;
    product_name: string;
    price_per_case: number;
    vendor: {
      id: number;
      name: string;
    };
  };
}

/**
 * Vendor Selection Entity
 * Represents a vendor selection for a house order item
 */
export class VendorSelection extends BaseEntity {
  private _houseOrderItemId: number;
  private _vendorItemId: number;
  private _selectionReason: SelectionReason;
  private _costSavings: number;
  private _alternatives: Alternative[];
  private _isOverridden: boolean;
  private _overriddenBy?: string;
  private _overriddenAt?: Date;

  constructor(
    id: string | number,
    houseOrderItemId: number,
    vendorItemId: number,
    selectionReason: SelectionReason,
    costSavings: number,
    alternatives: Alternative[] = [],
    isOverridden: boolean = false,
    overriddenBy?: string,
    overriddenAt?: Date,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._houseOrderItemId = houseOrderItemId;
    this._vendorItemId = vendorItemId;
    this._selectionReason = selectionReason;
    this._costSavings = costSavings;
    this._alternatives = alternatives;
    this._isOverridden = isOverridden;
    this._overriddenBy = overriddenBy;
    this._overriddenAt = overriddenAt;
    
    this.validate();
  }

  // Getters
  get houseOrderItemId(): number { return this._houseOrderItemId; }
  get vendorItemId(): number { return this._vendorItemId; }
  get selectionReason(): SelectionReason { return this._selectionReason; }
  get costSavings(): number { return this._costSavings; }
  get alternatives(): Alternative[] { return this._alternatives; }
  get isOverridden(): boolean { return this._isOverridden; }
  get overriddenBy(): string | undefined { return this._overriddenBy; }
  get overriddenAt(): Date | undefined { return this._overriddenAt; }

  // Business Logic Methods
  public overrideSelection(vendorItemId: number, overriddenBy: string): void {
    if (this._vendorItemId === vendorItemId) {
      throw new Error('Cannot override to the same vendor item');
    }
    
    // Verify the new vendor item is in alternatives
    const alternative = this._alternatives.find(alt => alt.vendor_item_id === vendorItemId);
    if (!alternative) {
      throw new Error('Selected vendor item is not available as an alternative');
    }
    
    this._vendorItemId = vendorItemId;
    this._isOverridden = true;
    this._overriddenBy = overriddenBy;
    this._overriddenAt = new Date();
    this.updateTimestamp();
  }

  public resetOverride(): void {
    if (!this._isOverridden) {
      throw new Error('Selection is not overridden');
    }
    
    // This would need to be implemented to restore the original selection
    // For now, we'll just mark it as not overridden
    this._isOverridden = false;
    this._overriddenBy = undefined;
    this._overriddenAt = undefined;
    this.updateTimestamp();
  }

  public addAlternative(alternative: Alternative): void {
    if (this._alternatives.find(alt => alt.vendor_item_id === alternative.vendor_item_id)) {
      throw new Error('Alternative already exists');
    }
    this._alternatives.push(alternative);
    this.updateTimestamp();
  }

  public removeAlternative(vendorItemId: number): void {
    const index = this._alternatives.findIndex(alt => alt.vendor_item_id === vendorItemId);
    if (index === -1) {
      throw new Error('Alternative not found');
    }
    this._alternatives.splice(index, 1);
    this.updateTimestamp();
  }

  public updateCostSavings(newSavings: number): void {
    this._costSavings = newSavings;
    this.updateTimestamp();
  }

  // Analysis Methods
  public getBestAlternative(): Alternative | null {
    if (this._alternatives.length === 0) return null;
    
    return this._alternatives.reduce((best, current) => {
      return current.cost_difference < best.cost_difference ? current : best;
    });
  }

  public getWorstAlternative(): Alternative | null {
    if (this._alternatives.length === 0) return null;
    
    return this._alternatives.reduce((worst, current) => {
      return current.cost_difference > worst.cost_difference ? current : worst;
    });
  }

  public getAlternativeCount(): number {
    return this._alternatives.length;
  }

  public hasAlternatives(): boolean {
    return this._alternatives.length > 0;
  }

  public getConfidenceLevel(): 'low' | 'medium' | 'high' {
    if (this._selectionReason.confidence_score >= 0.8) return 'high';
    if (this._selectionReason.confidence_score >= 0.6) return 'medium';
    return 'low';
  }

  public isConfidentSelection(): boolean {
    return this._selectionReason.confidence_score >= 0.7;
  }

  public getSavingsPercentage(): number {
    // This would need the original cost to calculate percentage
    // For now, return the absolute savings
    return this._costSavings;
  }

  // Display Methods
  public getDisplayName(): string {
    return `Vendor Selection for Order Item #${this._houseOrderItemId}`;
  }

  public getStrategyDisplayName(): string {
    switch (this._selectionReason.strategy) {
      case 'lowest_price': return 'Lowest Price';
      case 'best_value': return 'Best Value';
      case 'preferred_vendor': return 'Preferred Vendor';
      case 'delivery_optimization': return 'Delivery Optimization';
      default: return 'Unknown Strategy';
    }
  }

  public getFormattedCostSavings(): string {
    return `$${this._costSavings.toFixed(2)}`;
  }

  public getFormattedConfidenceScore(): string {
    return `${Math.round(this._selectionReason.confidence_score * 100)}%`;
  }

  // Validation
  protected validate(): void {
    if (!this._houseOrderItemId) {
      throw new Error('House order item ID is required');
    }
    if (!this._vendorItemId) {
      throw new Error('Vendor item ID is required');
    }
    if (!this._selectionReason || !this._selectionReason.strategy) {
      throw new Error('Selection reason is required');
    }
    if (this._selectionReason.confidence_score < 0 || this._selectionReason.confidence_score > 1) {
      throw new Error('Confidence score must be between 0 and 1');
    }
    if (this._costSavings < 0) {
      throw new Error('Cost savings cannot be negative');
    }
  }

  // JSON Serialization
  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      house_order_item_id: this._houseOrderItemId,
      vendor_item_id: this._vendorItemId,
      selection_reason: this._selectionReason,
      cost_savings: this._costSavings,
      alternatives: this._alternatives,
      is_overridden: this._isOverridden,
      overridden_by: this._overriddenBy,
      overridden_at: this._overriddenAt
    };
  }

  // Factory method for creating from API data
  public static fromAPI(data: any): VendorSelection {
    return new VendorSelection(
      data.id,
      data.house_order_item_id,
      data.vendor_item_id,
      data.selection_reason,
      data.cost_savings || 0,
      data.alternatives || [],
      data.is_overridden || false,
      data.overridden_by,
      data.overridden_at ? new Date(data.overridden_at) : undefined,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}
