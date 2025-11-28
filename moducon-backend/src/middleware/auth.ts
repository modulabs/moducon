import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    name: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No authentication token provided', 401, 'AUTH_TOKEN_MISSING');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      name: decoded.name,
    };

    logger.debug(`User authenticated: ${decoded.name} (${decoded.userId})`);
    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    return errorResponse(res, 'Invalid or expired token', 401, 'AUTH_TOKEN_INVALID');
  }
};
