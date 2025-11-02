import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_CONFIG } from '../initializers/jwt';
import { ITokenPayload, IDecodedToken } from '../interfaces';
import { ApiError } from '../utils/api-error';
import { prisma } from '../initializers/database';

export class TokenService {
  /**
   * Generate Access Token
   */
  static generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, JWT_CONFIG.accessSecret, {
      expiresIn: JWT_CONFIG.accessExpiry as any,
    });
  }

  /**
   * Generate Refresh Token
   */
  static generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, JWT_CONFIG.refreshSecret, {
      expiresIn: JWT_CONFIG.refreshExpiry as any,
    });
  }

  /**
   * Generate both Access and Refresh tokens
   */
  static generateTokens(payload: ITokenPayload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  /**
   * Verify Access Token
   */
  static verifyAccessToken(token: string): IDecodedToken {
    try {
      return jwt.verify(token, JWT_CONFIG.accessSecret) as IDecodedToken;
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired access token');
    }
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(token: string): IDecodedToken {
    try {
      return jwt.verify(token, JWT_CONFIG.refreshSecret) as IDecodedToken;
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  /**
   * Store Refresh Token in database
   */
  static async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  /**
   * Remove Refresh Token from database
   */
  static async removeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  /**
   * Verify if Refresh Token exists in database
   */
  static async verifyRefreshTokenInDb(token: string): Promise<boolean> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      return false;
    }

    // Check if token is expired
    if (refreshToken.expiresAt < new Date()) {
      await this.removeRefreshToken(token);
      return false;
    }

    return true;
  }

  /**
   * Remove all refresh tokens for a user
   */
  static async removeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Clean up expired tokens (can be run periodically)
   */
  static async cleanupExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
