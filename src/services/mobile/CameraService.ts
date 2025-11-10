/**
 * Camera Service
 * Handles camera operations for mobile devices
 */

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CapturedPhoto {
  dataUrl: string;
  format: string;
  saved: boolean;
}

export class CameraService {
  /**
   * Take a photo using device camera
   */
  static async takePhoto(): Promise<CapturedPhoto> {
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Camera is only available on mobile devices');
      }

      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 90,
        allowEditing: true,
        correctOrientation: true,
      });

      return {
        dataUrl: photo.dataUrl || '',
        format: photo.format,
        saved: photo.saved || false,
      };
    } catch (error) {
      console.error('Camera error:', error);
      throw new Error('Failed to capture photo');
    }
  }

  /**
   * Pick a photo from gallery
   */
  static async pickPhoto(): Promise<CapturedPhoto> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        quality: 90,
        allowEditing: true,
        correctOrientation: true,
      });

      return {
        dataUrl: photo.dataUrl || '',
        format: photo.format,
        saved: photo.saved || false,
      };
    } catch (error) {
      console.error('Photo picker error:', error);
      throw new Error('Failed to pick photo');
    }
  }

  /**
   * Request camera permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Check if camera is available
   */
  static async checkAvailability(): Promise<boolean> {
    return Capacitor.isNativePlatform();
  }
}
