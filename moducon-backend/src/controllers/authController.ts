import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { name, phone_last4 } = req.body;

    // 입력 검증
    if (!name || !phone_last4) {
      return res.status(400).json(
        errorResponse('INVALID_INPUT', 'Name and phone_last4 are required')
      );
    }

    if (phone_last4.length !== 4 || !/^\d{4}$/.test(phone_last4)) {
      return res.status(400).json(
        errorResponse('INVALID_PHONE', 'phone_last4 must be exactly 4 digits')
      );
    }

    // 로그인 시도
    const result = await authService.login({ name, phone_last4 });

    if (!result) {
      return res.status(401).json(
        errorResponse(
          'AUTH_USER_NOT_FOUND',
          '사용자 정보를 찾을 수 없습니다.'
        )
      );
    }

    res.json(successResponse(result, 'Login successful'));
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json(
      errorResponse('LOGIN_FAILED', 'Login failed due to server error')
    );
  }
};

export const saveSignature = async (req: AuthRequest, res: Response) => {
  try {
    const { signature_data } = req.body;
    const userId = req.user!.userId;

    // 입력 검증
    if (!signature_data) {
      return res.status(400).json(
        errorResponse('INVALID_INPUT', 'signature_data is required')
      );
    }

    // Base64 이미지 검증
    if (!signature_data.startsWith('data:image/')) {
      return res.status(400).json(
        errorResponse('INVALID_SIGNATURE', 'signature_data must be a valid base64 image')
      );
    }

    // 서명 저장
    const result = await authService.saveSignature({
      userId,
      signatureData: signature_data,
    });

    res.json(successResponse(result, 'Signature saved'));
  } catch (error) {
    logger.error('Save signature error:', error);
    res.status(500).json(
      errorResponse('SIGNATURE_SAVE_FAILED', 'Failed to save signature')
    );
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json(
        errorResponse('USER_NOT_FOUND', 'User not found')
      );
    }

    res.json(successResponse(user));
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json(
      errorResponse('GET_USER_FAILED', 'Failed to get user information')
    );
  }
};

export const resetLogin = async (req: Request, res: Response) => {
  try {
    const { name, phone_last4 } = req.body;

    // 입력 검증
    if (!name || !phone_last4) {
      return res.status(400).json(
        errorResponse('INVALID_INPUT', 'Name and phone_last4 are required')
      );
    }

    const success = await authService.resetLogin({ name, phone_last4 });

    if (!success) {
      return res.status(404).json(
        errorResponse('USER_NOT_FOUND', 'User not found')
      );
    }

    res.json(successResponse(null, 'Login session reset successfully'));
  } catch (error) {
    logger.error('Reset login error:', error);
    res.status(500).json(
      errorResponse('RESET_FAILED', 'Failed to reset login session')
    );
  }
};
