import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-key-change-in-production';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['x-admin-token'] as string;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '관리자 인증이 필요합니다.',
      });
    }

    // JWT 검증
    jwt.verify(token, ADMIN_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 관리자 토큰입니다.',
    });
  }
};
