import { prisma } from '../initializers/database';
import { IAuthResponse, IUserResponse } from '../interfaces';
import { ApiError } from '../utils/api-error';
import { TokenService } from './token';
import { GoogleService } from './google';
import logger from '../initializers/logger';
import { auditLog } from '../utils/audit-logger';

export class AuthService {
  /**
   * Authenticate user with Google
   */
  static async googleAuth(
    code: string,
    ip?: string,
    userAgent?: string
  ): Promise<IAuthResponse> {
    try {
      // Get user info from Google
      const googleUserInfo = await GoogleService.getUserInfo(code);

      // Check if user exists, if not create new user
      let user = await prisma.user.findUnique({
        where: { googleId: googleUserInfo.id },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: googleUserInfo.email,
            name: googleUserInfo.name,
            googleId: googleUserInfo.id,
            profilePicture: googleUserInfo.picture,
            lastLogin: new Date(),
          },
        });

        logger.info('New user created', { userId: user.id, email: user.email });
        auditLog({
          userId: user.id,
          action: 'USER_REGISTERED',
          resource: 'User',
          details: { email: user.email },
          ip,
          userAgent,
        });
      } else {
        // Update existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: googleUserInfo.name,
            profilePicture: googleUserInfo.picture,
            lastLogin: new Date(),
          },
        });

        logger.info('User logged in', { userId: user.id, email: user.email });
        auditLog({
          userId: user.id,
          action: 'USER_LOGIN',
          resource: 'User',
          details: { email: user.email },
          ip,
          userAgent,
        });
      }

      // Generate tokens
      const tokens = TokenService.generateTokens({
        userId: user.id,
        email: user.email,
      });

      // Store refresh token in database
      await TokenService.storeRefreshToken(user.id, tokens.refreshToken);

      // Return auth response
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
        },
        tokens,
      };
    } catch (error) {
      logger.error('Google authentication failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = TokenService.verifyRefreshToken(refreshToken);

      // Check if token exists in database
      const tokenExists = await TokenService.verifyRefreshTokenInDb(
        refreshToken
      );

      if (!tokenExists) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = TokenService.generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
      });

      logger.info('Access token refreshed', { userId: decoded.userId });

      return { accessToken };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(refreshToken: string, userId: string): Promise<void> {
    try {
      // Remove refresh token from database
      await TokenService.removeRefreshToken(refreshToken);

      logger.info('User logged out', { userId });
      auditLog({
        userId,
        action: 'USER_LOGOUT',
        resource: 'User',
      });
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<IUserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }
}
