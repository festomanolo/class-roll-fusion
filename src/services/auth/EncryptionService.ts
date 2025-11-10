/**
 * Encryption Service
 * Handles data encryption/decryption using Web Crypto API (browser-native)
 */

export class EncryptionService {
  private static SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'teachermate-default-key-change-in-production';
  
  /**
   * Derive a crypto key from the password/secret
   */
  private static async deriveKey(password: string): Promise<CryptoKey> {
    try {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('teachermate-salt'), // In production, use random salt per encryption
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Key derivation error:', error);
      throw new Error('Failed to derive encryption key - Web Crypto API may not be available');
    }
  }

  /**
   * Encrypt data using Web Crypto API
   */
  static async encrypt(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const key = await this.deriveKey(this.SECRET_KEY);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      // Convert to base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using Web Crypto API
   */
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.deriveKey(this.SECRET_KEY);
      
      // Decode from base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt object to encrypted string
   */
  static async encryptObject(obj: any): Promise<string> {
    const jsonString = JSON.stringify(obj);
    return await this.encrypt(jsonString);
  }

  /**
   * Decrypt encrypted string to object
   */
  static async decryptObject<T = any>(encryptedData: string): Promise<T> {
    const decrypted = await this.decrypt(encryptedData);
    return JSON.parse(decrypted) as T;
  }

  /**
   * Hash password using SHA-256 (Web Crypto API) with fallback
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      // Check if Web Crypto API is available
      if (!crypto || !crypto.subtle) {
        throw new Error('Web Crypto API not available');
      }
      
      const encoder = new TextEncoder();
      const data = encoder.encode(password + 'teachermate-salt'); // Add salt for security
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Web Crypto API hash failed, using fallback:', error);
      // Fallback to simple hash (not secure, but prevents crashes)
      return this.simpleHash(password + 'teachermate-salt');
    }
  }

  /**
   * Generate random key
   */
  static generateKey(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const hashedPassword = await this.hashPassword(password);
      return hashedPassword === hash;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Simple hash fallback for when Web Crypto API is not available
   */
  private static simpleHash(input: string): string {
    let hash = 0;
    if (input.length === 0) return hash.toString();
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }
}
