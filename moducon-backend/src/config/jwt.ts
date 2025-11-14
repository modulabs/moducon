import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'moducon-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JwtPayload {
  userId: string;
  name: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const getTokenExpiry = (): Date => {
  const expiresIn = JWT_EXPIRES_IN;
  const hours = parseInt(expiresIn.replace('h', ''));
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};
