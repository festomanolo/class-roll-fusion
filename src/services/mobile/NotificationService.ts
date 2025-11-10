/**
 * Notification Service
 * Handles push notifications and local notifications
 * CAREFULLY IMPLEMENTED to prevent crashes
 */

/**
 * Notification Service
 * Handles push notifications and local notifications
 * CAREFULLY IMPLEMENTED to prevent crashes
 */

import { Capacitor } from '@capacitor/core';
import { playSound } from '@/lib/sound';

// Safely import local notifications plugin - only if available
let LocalNotifications: any = null;
let notificationPluginLoaded = false;

const loadNotificationPlugin = async () => {
  if (notificationPluginLoaded) return LocalNotifications;
  
  // Only try on native platform
  if (!Capacitor.isNativePlatform()) {
    notificationPluginLoaded = true;
    return null;
  }
  
  try {
    // Use Function constructor to create a truly dynamic import that Vite won't analyze
    // This prevents build-time errors if plugin is not installed
    const importDynamic = new Function('moduleName', 'return import(moduleName)');
    const module = await importDynamic('@capacitor/local-notifications');
    if (module && module.LocalNotifications) {
      LocalNotifications = module.LocalNotifications;
      notificationPluginLoaded = true;
      return LocalNotifications;
    }
  } catch (error) {
    // Plugin not installed or not available - this is OK, we'll use web notifications
    console.log('Local notifications plugin not available (using web notifications):', error);
    notificationPluginLoaded = true; // Mark as attempted
    return null;
  }
  
  notificationPluginLoaded = true;
  return null;
};

export interface NotificationConfig {
  title: string;
  body: string;
  id?: number;
  schedule?: Date;
  data?: any;
}

/**
 * Play the project's notification sound (best-effort, doesn't throw)
 * Tries multiple paths because bundlers may place assets differently on web vs native builds.
 */
function playNotificationSound(): void {
  try {
    // Delegate to shared utility which respects user setting
    void playSound('notification');
  } catch (e) {
    // swallow errors to avoid crashes
    console.warn('Failed to play notification sound', e);
  }
}

export class NotificationService {
  private static initialized = false;
  private static listeners: Array<(notification: any) => void> = [];
  private static pushNotificationsAvailable = false;

  /**
   * Initialize push notifications
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Notification service: Already initialized');
      return;
    }

    console.log('Notification service: Push notifications disabled (Firebase not configured)');
    this.initialized = true;
    this.pushNotificationsAvailable = false;
  }

  /**
   * Send local notification - SAFELY implemented to prevent crashes
   */
  static async sendLocalNotification(config: NotificationConfig): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // Web fallback - use browser notifications
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            try {
              new Notification(config.title, {
                body: config.body,
                icon: '/favicon.ico',
                data: config.data,
              });
              try { playNotificationSound(); } catch (e) { /* ignore */ }
            } catch (notifError) {
              console.warn('Error creating web notification:', notifError);
            }
          } else if (Notification.permission !== 'denied') {
            // Request permission if not already denied
            try {
              const permission = await Notification.requestPermission();
              if (permission === 'granted') {
                new Notification(config.title, {
                  body: config.body,
                  icon: '/favicon.ico',
                  data: config.data,
                });
                try { playNotificationSound(); } catch (e) { /* ignore */ }
              }
            } catch (permError) {
              console.warn('Error requesting notification permission:', permError);
            }
          }
        }
        return;
      }

      // Native platform - use local notifications plugin
      const plugin = await loadNotificationPlugin();
      if (!plugin) {
        // Plugin not available - just log, don't crash
        console.log('Local notifications plugin not available, using web fallback');
        return;
      }

      // Request permission first
      try {
        const permissionStatus = await plugin.checkPermissions();
        if (permissionStatus.display !== 'granted') {
          const requestStatus = await plugin.requestPermissions();
          if (requestStatus.display !== 'granted') {
            console.log('Notification permission not granted');
            return; // Exit gracefully
          }
        }
      } catch (permError) {
        console.warn('Error checking notification permission:', permError);
        return; // Exit gracefully
      }

      // Send notification
      try {
        await plugin.schedule({
          notifications: [
            {
              title: config.title,
              body: config.body,
              id: config.id || Math.floor(Math.random() * 1000000),
              sound: 'default',
              data: config.data,
            },
          ],
        });
        // Web/native fallback sound attempt
  try { playNotificationSound(); } catch (e) { /* ignore */ }
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
        // Don't throw - just log the error
      }
    } catch (error) {
      console.error('Error in sendLocalNotification:', error);
      // Don't throw - prevent app crashes
    }
  }

  /**
   * Schedule notification - SAFELY implemented to prevent crashes
   */
  static async scheduleNotification(config: NotificationConfig): Promise<void> {
    try {
      // Check if we're on native platform
      if (!Capacitor.isNativePlatform()) {
        // Web fallback - use browser notifications
        if (config.schedule && config.schedule > new Date()) {
          const delay = config.schedule.getTime() - Date.now();
          if (delay > 0 && delay < 2147483647) { // Max setTimeout delay
            setTimeout(async () => {
              await this.sendLocalNotification(config);
            }, delay);
          }
        } else {
          await this.sendLocalNotification(config);
        }
        return;
      }

      // Native platform - use local notifications plugin
      const plugin = await loadNotificationPlugin();
      if (!plugin) {
        // Plugin not available - use web notifications as fallback
        if (config.schedule && config.schedule > new Date()) {
          const delay = config.schedule.getTime() - Date.now();
          if (delay > 0 && delay < 2147483647) {
            setTimeout(async () => {
              await this.sendLocalNotification(config);
            }, delay);
          }
        } else {
          await this.sendLocalNotification(config);
        }
        return;
      }

      // Request permission first
      try {
        const permissionStatus = await plugin.checkPermissions();
        if (permissionStatus.display !== 'granted') {
          const requestStatus = await plugin.requestPermissions();
          if (requestStatus.display !== 'granted') {
            console.log('Notification permission not granted');
            return; // Exit gracefully
          }
        }
      } catch (permError) {
        console.warn('Error requesting notification permission:', permError);
        return; // Exit gracefully
      }

      // Schedule the notification
      if (config.schedule && config.schedule > new Date()) {
        try {
          await plugin.schedule({
            notifications: [
              {
                title: config.title,
                body: config.body,
                id: config.id || Math.floor(Math.random() * 1000000),
                schedule: { at: config.schedule },
                sound: 'default',
                data: config.data,
              },
            ],
          });
          console.log('Notification scheduled successfully');
          try { playNotificationSound(); } catch (e) { /* ignore */ }
        } catch (scheduleError) {
          console.error('Error scheduling notification:', scheduleError);
          // Don't throw - just log the error
        }
      } else {
        // Send immediately
        await this.sendLocalNotification(config);
      }
    } catch (error) {
      console.error('Error in scheduleNotification:', error);
      // Don't throw - prevent app crashes
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAllNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    // Push notifications disabled - Firebase not configured
    console.log('Clear notifications called (no-op)');
  }

  /**
   * Add notification listener
   */
  static addListener(callback: (notification: any) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Remove notification listener
   */
  static removeListener(callback: (notification: any) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Store push token (to be sent to backend)
   */
  private static async storeToken(token: string): Promise<void> {
    // Store token in secure storage for backend sync
    console.log('Storing push token:', token);
    // TODO: Send to backend API
  }

  /**
   * Request notification permission (web)
   */
  static async requestWebPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Send exam reminder
   */
  static async sendExamReminder(examTitle: string, examDate: Date): Promise<void> {
    await this.sendLocalNotification({
      title: 'Upcoming Exam',
      body: `${examTitle} is scheduled for ${examDate.toLocaleDateString()}`,
      data: { type: 'exam_reminder', examTitle, examDate },
    });
  }

  /**
   * Send attendance reminder
   */
  static async sendAttendanceReminder(className: string): Promise<void> {
    await this.sendLocalNotification({
      title: 'Attendance Reminder',
      body: `Don't forget to take attendance for ${className}`,
      data: { type: 'attendance_reminder', className },
    });
  }
}

