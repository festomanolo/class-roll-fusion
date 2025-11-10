/**
 * Secure Storage Service
 * Uses Capacitor Preferences for secure storage on mobile, localStorage on web
 */

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { EncryptionService } from './EncryptionService';

export class SecureStorageService {
  /**
   * Set a value in secure storage
   */
  static async set(key: string, value: string, encrypt: boolean = true): Promise<void> {
    try {
      const finalValue = encrypt ? await EncryptionService.encrypt(value) : value;
      
      if (Capacitor.isNativePlatform()) {
        await Preferences.set({ key, value: finalValue });
      } else {
        // Fallback to localStorage on web
        localStorage.setItem(`secure_${key}`, finalValue);
      }
    } catch (error) {
      console.error('SecureStorage set error:', error);
      throw new Error('Failed to store secure data');
    }
  }

  /**
   * Get a value from secure storage
   */
  static async get(key: string, decrypt: boolean = true): Promise<string | null> {
    try {
      let value: string | null = null;

      if (Capacitor.isNativePlatform()) {
        const result = await Preferences.get({ key });
        value = result.value;
      } else {
        // Fallback to localStorage on web
        value = localStorage.getItem(`secure_${key}`);
      }

      if (!value) return null;
      
      return decrypt ? await EncryptionService.decrypt(value) : value;
    } catch (error) {
      console.error('SecureStorage get error:', error);
      return null;
    }
  }

  /**
   * Set object in secure storage
   */
  static async setObject(key: string, obj: any): Promise<void> {
    const jsonString = JSON.stringify(obj);
    await this.set(key, jsonString, true);
  }

  /**
   * Get object from secure storage
   */
  static async getObject<T = any>(key: string): Promise<T | null> {
    const value = await this.get(key, true);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Failed to parse stored object:', error);
      return null;
    }
  }

  /**
   * Remove a value from secure storage
   */
  static async remove(key: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(`secure_${key}`);
      }
    } catch (error) {
      console.error('SecureStorage remove error:', error);
    }
  }

  /**
   * Clear all secure storage
   */
  static async clear(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Preferences.clear();
      } else {
        // Clear only secure_ prefixed items
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('secure_')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('SecureStorage clear error:', error);
    }
  }

  /**
   * Check if a key exists
   */
  static async has(key: string): Promise<boolean> {
    const value = await this.get(key, false);
    return value !== null;
  }
}
