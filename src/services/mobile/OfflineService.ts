/**
 * Offline Service
 * Handles offline data sync and queue management
 */

import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { SecureStorageService } from '../auth/SecureStorageService';

export interface QueuedAction {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
}

export class OfflineService {
  private static QUEUE_KEY = 'offline_queue';
  private static MAX_RETRIES = 3;
  private static listeners: Array<(isOnline: boolean) => void> = [];
  private static isOnline: boolean = true;

  /**
   * Initialize offline service
   */
  static async initialize(): Promise<void> {
    // Only initialize on native platforms
    if (!Capacitor.isNativePlatform()) {
      this.isOnline = true; // Assume online on web
      return;
    }

    try {
      // Check initial network status
      const status = await Network.getStatus();
      this.isOnline = status.connected;

      // Listen for network changes
      Network.addListener('networkStatusChange', (status) => {
        const wasOnline = this.isOnline;
        this.isOnline = status.connected;

        // Notify listeners
        this.listeners.forEach(listener => listener(this.isOnline));

        // If we just came online, sync queue
        if (!wasOnline && this.isOnline) {
          this.syncQueue();
        }
      });
    } catch (error) {
      console.error('Network initialization error:', error);
      this.isOnline = true; // Fallback to online
    }
  }

  /**
   * Check if device is online
   */
  static async checkConnection(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      this.isOnline = navigator.onLine;
      return this.isOnline;
    }

    try {
      const status = await Network.getStatus();
      this.isOnline = status.connected;
      return this.isOnline;
    } catch (error) {
      console.error('Check connection error:', error);
      this.isOnline = navigator.onLine;
      return this.isOnline;
    }
  }

  /**
   * Add action to offline queue
   */
  static async queueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const queue = await this.getQueue();
    
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    queue.push(queuedAction);
    await this.saveQueue(queue);
  }

  /**
   * Get offline queue
   */
  private static async getQueue(): Promise<QueuedAction[]> {
    const queueData = await SecureStorageService.get(this.QUEUE_KEY, false);
    return queueData ? JSON.parse(queueData) : [];
  }

  /**
   * Save queue
   */
  private static async saveQueue(queue: QueuedAction[]): Promise<void> {
    await SecureStorageService.set(this.QUEUE_KEY, JSON.stringify(queue), false);
  }

  /**
   * Sync offline queue
   */
  static async syncQueue(): Promise<void> {
    if (!this.isOnline) {
      console.log('Cannot sync: offline');
      return;
    }

    const queue = await this.getQueue();
    if (queue.length === 0) {
      console.log('Queue is empty, nothing to sync');
      return;
    }

    console.log(`Syncing ${queue.length} queued actions...`);

    const remainingQueue: QueuedAction[] = [];

    for (const action of queue) {
      try {
        await this.executeAction(action);
        console.log(`Synced action: ${action.type} ${action.table}`);
      } catch (error) {
        console.error(`Failed to sync action: ${action.type} ${action.table}`, error);
        
        // Retry logic
        if (action.retries < this.MAX_RETRIES) {
          remainingQueue.push({
            ...action,
            retries: action.retries + 1,
          });
        } else {
          console.error(`Max retries reached for action: ${action.id}`);
        }
      }
    }

    await this.saveQueue(remainingQueue);
    console.log(`Sync complete. ${remainingQueue.length} actions remaining in queue.`);
  }

  /**
   * Execute queued action
   */
  private static async executeAction(action: QueuedAction): Promise<void> {
    // Import database here to avoid circular dependency
    const { getDB } = await import('../database/DatabaseFactory');
    const db = await getDB();

    switch (action.type) {
      case 'insert':
        await db.insert(action.table, action.data);
        break;
      case 'update':
        await db.update(action.table, action.data, 'id = ?', [action.data.id]);
        break;
      case 'delete':
        await db.delete(action.table, 'id = ?', [action.data.id]);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Clear queue
   */
  static async clearQueue(): Promise<void> {
    await this.saveQueue([]);
  }

  /**
   * Get queue size
   */
  static async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  /**
   * Add connection listener
   */
  static addListener(callback: (isOnline: boolean) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Remove connection listener
   */
  static removeListener(callback: (isOnline: boolean) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Get connection status
   */
  static getConnectionStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Force sync
   */
  static async forceSync(): Promise<void> {
    const isOnline = await this.checkConnection();
    if (isOnline) {
      await this.syncQueue();
    } else {
      throw new Error('Cannot sync: device is offline');
    }
  }
}
