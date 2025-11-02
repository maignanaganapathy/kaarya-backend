export interface IUser {
  id: string;
  email: string;
  name: string | null;
  googleId: string;
  profilePicture: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  lastLogin: Date | null;
}

export interface IGoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}
