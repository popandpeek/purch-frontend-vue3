/**
 * Base Entity Class
 * Abstract base class for all domain entities with common functionality
 */
export abstract class BaseEntity {
  public readonly id: string | number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(id: string | number, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Check if two entities are equal by ID
   */
  public equals(other: BaseEntity): boolean {
    return this.id === other.id;
  }

  /**
   * Update the timestamp for this entity
   */
  protected updateTimestamp(): void {
    (this as any).updatedAt = new Date();
  }

  /**
   * Get entity as plain object
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Validate entity data
   */
  protected abstract validate(): void;

  /**
   * Get entity display name for UI
   */
  public abstract getDisplayName(): string;
}
