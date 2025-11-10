/**
 * LocalStorage Database Adapter
 * For web development and testing
 */

import { DatabaseService, QueryResult, DatabaseConfig } from './DatabaseService';

interface StorageSchema {
  [table: string]: {
    [id: string]: any;
  };
}

export class LocalStorageAdapter extends DatabaseService {
  private storageKey: string;
  private schema: StorageSchema = {};

  constructor(config: DatabaseConfig) {
    super(config);
    this.storageKey = `db_${config.name}_v${config.version}`;
  }

  async initialize(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.schema = JSON.parse(stored);
      } else {
        // Initialize empty schema
        this.schema = {
          users: {},
          schools: {},
          classes: {},
          students: {},
          sessions: {},
          attendance: {},
          exams: {},
          exam_results: {},
          assignments: {},
          assignment_submissions: {},
        };
        this.persist();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('LocalStorage initialization error:', error);
      throw new Error('Failed to initialize LocalStorage database');
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.schema));
    } catch (error) {
      console.error('LocalStorage persist error:', error);
      throw new Error('Failed to persist data to LocalStorage');
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    // Basic SQL parser for LocalStorage
    // This is a simplified implementation
    const lowerSQL = sql.toLowerCase().trim();
    
    if (lowerSQL.startsWith('select')) {
      const tableMatch = sql.match(/from\s+(\w+)/i);
      if (!tableMatch) throw new Error('Invalid SELECT query');
      
      const table = tableMatch[1];
      const records = Object.values(this.schema[table] || {});
      
      return {
        rows: records as T[],
        rowsAffected: 0,
      };
    }
    
    if (lowerSQL.startsWith('insert')) {
      const tableMatch = sql.match(/into\s+(\w+)/i);
      if (!tableMatch) throw new Error('Invalid INSERT query');
      
      const table = tableMatch[1];
      const id = this.generateId();
      
      if (!this.schema[table]) {
        this.schema[table] = {};
      }
      
      // Simple insert - would need more sophisticated parsing for real use
      this.schema[table][id] = { id, ...(params?.[0] || {}) };
      this.persist();
      
      return {
        rows: [{ id }] as T[],
        rowsAffected: 1,
      };
    }
    
    throw new Error('Query not supported in LocalStorage adapter');
  }

  async transaction(queries: Array<{ sql: string; params?: any[] }>): Promise<void> {
    // Execute all queries
    for (const { sql, params } of queries) {
      await this.query(sql, params);
    }
  }

  async insert<T = any>(table: string, data: Partial<T>): Promise<string> {
    if (!this.schema[table]) {
      this.schema[table] = {};
    }

    const id = (data as any).id || this.generateId();
    this.schema[table][id] = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    
    this.persist();
    return id;
  }

  async update<T = any>(table: string, data: Partial<T>, where: string, params?: any[]): Promise<number> {
    if (!this.schema[table]) {
      return 0;
    }

    let updated = 0;
    
    // Simple where clause parsing (id = ?)
    if (where.includes('id =') && params && params.length > 0) {
      const id = params[0];
      if (this.schema[table][id]) {
        this.schema[table][id] = {
          ...this.schema[table][id],
          ...data,
          updated_at: new Date().toISOString(),
        };
        updated = 1;
      }
    } else {
      // Update all matching records
      Object.keys(this.schema[table]).forEach((id) => {
        this.schema[table][id] = {
          ...this.schema[table][id],
          ...data,
          updated_at: new Date().toISOString(),
        };
        updated++;
      });
    }

    if (updated > 0) {
      this.persist();
    }
    
    return updated;
  }

  async delete(table: string, where: string, params?: any[]): Promise<number> {
    if (!this.schema[table]) {
      return 0;
    }

    let deleted = 0;

    // Simple where clause parsing (id = ?)
    if (where.includes('id =') && params && params.length > 0) {
      const id = params[0];
      if (this.schema[table][id]) {
        delete this.schema[table][id];
        deleted = 1;
      }
    } else {
      // Delete all
      const count = Object.keys(this.schema[table]).length;
      this.schema[table] = {};
      deleted = count;
    }

    if (deleted > 0) {
      this.persist();
    }

    return deleted;
  }

  async select<T = any>(table: string, where?: string, params?: any[]): Promise<T[]> {
    if (!this.schema[table]) {
      return [];
    }

    const records = Object.values(this.schema[table]);

    if (!where) {
      return records as T[];
    }

    // Simple where clause filtering
    if (where.includes('id =') && params && params.length > 0) {
      const id = params[0];
      const record = this.schema[table][id];
      return record ? [record as T] : [];
    }

    // Filter by field (basic implementation)
    const whereMatch = where.match(/(\w+)\s*=\s*\?/);
    if (whereMatch && params && params.length > 0) {
      const field = whereMatch[1];
      const value = params[0];
      return records.filter((record: any) => record[field] === value) as T[];
    }

    return records as T[];
  }

  async close(): Promise<void> {
    this.persist();
    this.isInitialized = false;
  }

  async clear(): Promise<void> {
    this.schema = {
      users: {},
      schools: {},
      classes: {},
      students: {},
      sessions: {},
      attendance: {},
      exams: {},
      exam_results: {},
      assignments: {},
      assignment_submissions: {},
    };
    this.persist();
  }

  async exportData(): Promise<any> {
    return JSON.parse(JSON.stringify(this.schema));
  }

  async importData(data: any): Promise<void> {
    this.schema = data;
    this.persist();
  }

  // Helper method to get table data
  getTable(tableName: string): any[] {
    return Object.values(this.schema[tableName] || {});
  }

  // Helper method to get record by ID
  getById(tableName: string, id: string): any | null {
    return this.schema[tableName]?.[id] || null;
  }
}
