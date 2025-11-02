export interface ITokenPayload {
  userId: string;
  email: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    profilePicture: string | null;
  };
  tokens: ITokens;
}

export interface IGoogleAuthRequest {
  code: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

export interface IDecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
