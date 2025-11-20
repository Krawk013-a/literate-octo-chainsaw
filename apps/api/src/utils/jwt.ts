import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export function signToken(payload: JwtPayload): string {
  const signOptions = {
    expiresIn: env.JWT_EXPIRES_IN,
  };
  return jwt.sign(payload, env.JWT_SECRET, signOptions as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const signOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, signOptions as SignOptions);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
