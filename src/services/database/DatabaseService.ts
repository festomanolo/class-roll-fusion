/**
 * Database Service Interface
 * Abstract interface for database operations supporting both web and mobile
 */

export interface QueryResult<T = any> {
  rows: T[];
  rowsAffected: number;
}

export interface DatabaseConfig {
  name: string;
  version: number;
  mode?: 'localStorage' | 'sqlite';
}

export abstract class DatabaseService {
  protected config: DatabaseConfig;
  protected isInitialized = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Initialize the database connection
   */
  abstract initialize(): Promise<void>;

  /**
   * Execute a raw SQL query (SQLite) or equivalent operation (LocalStorage)
   */
  abstract query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;

  /**
   * Execute multiple queries in a transaction
   */
  abstract transaction(queries: Array<{ sql: string; params?: any[] }>): Promise<void>;

  /**
   * Insert a record
   */
  abstract insert<T = any>(table: string, data: Partial<T>): Promise<string>;

  /**
   * Update records
   */
  abstract update<T = any>(table: string, data: Partial<T>, where: string, params?: any[]): Promise<number>;

  /**
   * Delete records
   */
  abstract delete(table: string, where: string, params?: any[]): Promise<number>;

  /**
   * Select records
   */
  abstract select<T = any>(table: string, where?: string, params?: any[]): Promise<T[]>;

  /**
   * Check if database is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Close the database connection
   */
  abstract close(): Promise<void>;

  /**
   * Clear all data (for testing/reset)
   */
  abstract clear(): Promise<void>;

  /**
   * Export data to JSON
   */
  abstract exportData(): Promise<any>;

  /**
   * Import data from JSON
   */
  abstract importData(data: any): Promise<void>;
}
