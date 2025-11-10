/**
 * Database Factory
 * Creates the appropriate database adapter based on platform
 */

import { Capacitor } from '@capacitor/core';
import { DatabaseService, DatabaseConfig } from './DatabaseService';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SQLiteAdapter } from './SQLiteAdapter';

export class DatabaseFactory {
  private static instance: DatabaseService | null = null;

  /**
   * Get or create the database instance
   */
  static async getDatabase(config?: DatabaseConfig): Promise<DatabaseService> {
    if (this.instance && this.instance.isReady()) {
      return this.instance;
    }

    const defaultConfig: DatabaseConfig = {
      name: 'classroll',
      version: 1,
      mode: Capacitor.isNativePlatform() ? 'sqlite' : 'localStorage',
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Create appropriate adapter based on platform with fallback
    if (finalConfig.mode === 'sqlite' && Capacitor.isNativePlatform()) {
      try {
        console.log('🗄️ Attempting to initialize SQLite...');
        this.instance = new SQLiteAdapter(finalConfig);
        await this.instance.initialize();
        console.log('✅ SQLite initialized successfully');
      } catch (error) {
        console.error('❌ SQLite failed, falling back to localStorage:', error);
        // Fallback to localStorage if SQLite fails
        this.instance = new LocalStorageAdapter(finalConfig);
        await this.instance.initialize();
        console.log('✅ Fallback to localStorage successful');
      }
    } else {
      console.log('🗄️ Using localStorage adapter');
      this.instance = new LocalStorageAdapter(finalConfig);
      await this.instance.initialize();
    }

    return this.instance;
  }

  /**
   * Reset the database instance (useful for testing)
   */
  static async reset(): Promise<void> {
    if (this.instance) {
      await this.instance.close();
      this.instance = null;
    }
  }

  /**
   * Get current database instance without creating new one
   */
  static getCurrentInstance(): DatabaseService | null {
    return this.instance;
  }
}

// Export a singleton instance getter
export const getDB = () => DatabaseFactory.getDatabase();
