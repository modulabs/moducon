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
      return res.status(401).json(
        errorResponse('AUTH_TOKEN_MISSING', 'No authentication token provided')
      );
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
    return res.status(401).json(
      errorResponse('AUTH_TOKEN_INVALID', 'Invalid or expired token')
    );
  }
};
