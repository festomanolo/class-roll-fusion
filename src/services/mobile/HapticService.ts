/**
 * Haptic Feedback Service
 * Provides tactile feedback for user interactions
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export class HapticService {
  /**
   * Light impact feedback (for buttons, switches)
   */
  static async light(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('Haptic light error:', error);
    }
  }

  /**
   * Medium impact feedback (for selections)
   */
  static async medium(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.error('Haptic medium error:', error);
    }
  }

  /**
   * Heavy impact feedback (for important actions)
   */
  static async heavy(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('Haptic heavy error:', error);
    }
  }

  /**
   * Success notification
   */
  static async success(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.error('Haptic success error:', error);
    }
  }

  /**
   * Warning notification
   */
  static async warning(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.error('Haptic warning error:', error);
    }
  }

  /**
   * Error notification
   */
  static async error(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.error('Haptic error error:', error);
    }
  }

  /**
   * Selection changed (for pickers, sliders)
   */
  static async selectionChanged(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.error('Haptic selection changed error:', error);
    }
  }

  /**
   * Vibrate for a specific duration (fallback)
   */
  static async vibrate(duration: number = 100): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('Haptic vibrate error:', error);
    }
  }
}
