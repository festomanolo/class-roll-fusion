/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */

import * as jose from 'jose';
import { SecureStorageService } from './SecureStorageService';
import { getDB } from '../database/DatabaseFactory';
import { EncryptionService } from './EncryptionService';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'teacher' | 'admin' | 'principal';
  avatar_url?: string;
  created_at?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  full_name: string;
  role?: 'teacher' | 'admin' | 'principal';
}

export class AuthService {
  private static JWT_SECRET = new TextEncoder().encode(
    import.meta.env.VITE_JWT_SECRET || 'teachermate-jwt-secret-change-in-production'
  );
  private static JWT_REFRESH_SECRET = new TextEncoder().encode(
    import.meta.env.VITE_JWT_REFRESH_SECRET || 'teachermate-refresh-secret-change-in-production'
  );
  private static ACCESS_TOKEN_EXPIRY = '1h';
  private static REFRESH_TOKEN_EXPIRY = '7d';

  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<User> {
    const db = await getDB();

    // Check if user already exists
    const existingUsers = await db.select('users', 'email = ?', [data.email]);
    if (existingUsers.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password using Web Crypto API (mobile-compatible)
    const passwordHash = await EncryptionService.hashPassword(data.password);

    // Create user
    const userId = await db.insert('users', {
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      full_name: data.full_name,
      role: data.role || 'teacher',
    });

    // Get created user
    const users = await db.select<User>('users', 'id = ?', [userId]);
    if (users.length === 0) {
      throw new Error('Failed to create user');
    }

    const user = users[0];
    delete (user as any).password_hash;

    return user;
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const db = await getDB();

    // Find user
    const users = await db.select('users', 'email = ?', [credentials.email.toLowerCase()]);
    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // Verify password using Web Crypto API (mobile-compatible)
    const isValid = await EncryptionService.verifyPassword(credentials.password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store tokens securely
    await SecureStorageService.setObject('auth_tokens', tokens);
    await SecureStorageService.setObject('current_user', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });

    // Remove password from user object
    delete user.password_hash;

    return { user, tokens };
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    await SecureStorageService.remove('auth_tokens');
    await SecureStorageService.remove('current_user');
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    return await SecureStorageService.getObject<User>('current_user');
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const tokens = await SecureStorageService.getObject<AuthTokens>('auth_tokens');
    if (!tokens) return false;

    try {
      await jose.jwtVerify(tokens.accessToken, this.JWT_SECRET);
      return true;
    } catch (error) {
      // Try to refresh token
      return await this.refreshAccessToken();
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(): Promise<boolean> {
    const tokens = await SecureStorageService.getObject<AuthTokens>('auth_tokens');
    if (!tokens) return false;

    try {
      const { payload } = await jose.jwtVerify(tokens.refreshToken, this.JWT_REFRESH_SECRET);
      
      // Generate new access token
      const newAccessToken = await new jose.SignJWT({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(this.ACCESS_TOKEN_EXPIRY)
        .setIssuedAt()
        .sign(this.JWT_SECRET);

      const newTokens = {
        accessToken: newAccessToken,
        refreshToken: tokens.refreshToken,
      };

      await SecureStorageService.setObject('auth_tokens', newTokens);
      return true;
    } catch (error) {
      await this.logout();
      return false;
    }
  }

  /**
   * Change password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const db = await getDB();

    // Verify current password
    const users = await db.select('users', 'id = ?', [user.id]);
    if (users.length === 0) {
      throw new Error('User not found');
    }

    const dbUser = users[0];
    const isValid = await EncryptionService.verifyPassword(currentPassword, dbUser.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password using Web Crypto API (mobile-compatible)
    const newPasswordHash = await EncryptionService.hashPassword(newPassword);

    // Update password
    await db.update('users', { password_hash: newPasswordHash }, 'id = ?', [user.id]);
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: Partial<User>): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const db = await getDB();

    // Don't allow changing email or role directly
    delete (updates as any).email;
    delete (updates as any).role;
    delete (updates as any).id;

    await db.update('users', updates, 'id = ?', [user.id]);

    // Get updated user
    const users = await db.select<User>('users', 'id = ?', [user.id]);
    const updatedUser = users[0];
    delete (updatedUser as any).password_hash;

    // Update stored user
    await SecureStorageService.setObject('current_user', updatedUser);

    return updatedUser;
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<void> {
    // In production, this would send an email with reset link
    // For now, we'll just log it
    console.log('Password reset requested for:', email);
    // TODO: Implement email service
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Implement token verification and password reset
    throw new Error('Not implemented');
  }

  /**
   * Generate JWT tokens
   */
  private static async generateTokens(user: any): Promise<AuthTokens> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(this.ACCESS_TOKEN_EXPIRY)
      .setIssuedAt()
      .sign(this.JWT_SECRET);

    const refreshToken = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(this.REFRESH_TOKEN_EXPIRY)
      .setIssuedAt()
      .sign(this.JWT_REFRESH_SECRET);

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  static async verifyToken(): Promise<boolean> {
    const tokens = await SecureStorageService.getObject<AuthTokens>('auth_tokens');
    if (!tokens) return false;

    try {
      await jose.jwtVerify(tokens.accessToken, this.JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get access token
   */
  static async getAccessToken(): Promise<string | null> {
    const tokens = await SecureStorageService.getObject<AuthTokens>('auth_tokens');
    return tokens?.accessToken || null;
  }
}
