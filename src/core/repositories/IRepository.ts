import { BaseEntity } from '../entities/BaseEntity';

/**
 * Generic Repository Interface
 * Defines common CRUD operations for all entities
 */
export interface IRepository<T extends BaseEntity> {
  findById(id: string | number): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string | number): Promise<void>;
}
