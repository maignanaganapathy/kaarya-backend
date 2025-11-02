import { googleOAuthClient } from '../initializers/google-oauth';
import { IGoogleUserInfo } from '../interfaces';
import { ApiError } from '../utils/api-error';
import logger from '../initializers/logger';

export class GoogleService {
  /**
   * Exchange authorization code for user info
   */
  static async getUserInfo(code: string): Promise<IGoogleUserInfo> {
    try {
      // Exchange code for tokens
      const { tokens } = await googleOAuthClient.getToken(code);
      googleOAuthClient.setCredentials(tokens);

      // Get user info from Google
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokens.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userInfo: any = await response.json();

      logger.info('Google user info retrieved', {
        email: userInfo.email,
        googleId: userInfo.id,
      });

      return userInfo as IGoogleUserInfo;
    } catch (error: any) {
      logger.error('Google OAuth error:', error);
      throw ApiError.badRequest(
        'Failed to authenticate with Google. Invalid authorization code.'
      );
    }
  }

  /**
   * Verify Google ID token
   */
  static async verifyIdToken(idToken: string): Promise<any> {
    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      return ticket.getPayload();
    } catch (error) {
      logger.error('Google ID token verification failed:', error);
      throw ApiError.unauthorized('Invalid Google ID token');
    }
  }
}
