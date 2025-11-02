import { Request } from 'express';

export interface IAuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}
