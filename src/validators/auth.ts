import { z } from 'zod';

/**
 * Google Auth Request Validation
 */
export const googleAuthSchema = z.object({
  body: z.object({
    code: z
      .string({
        error: 'Authorization code is required',
      })
      .min(1, 'Authorization code cannot be empty'),
  }),
});

/**
 * Refresh Token Request Validation
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({
        error: 'Refresh token is required',
      })
      .min(1, 'Refresh token cannot be empty'),
  }),
});

/**
 * Logout Request Validation
 */
export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({
        error: 'Refresh token is required',
      })
      .min(1, 'Refresh token cannot be empty'),
  }),
});

// Export types for TypeScript
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
