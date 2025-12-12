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
      return errorResponse(res, 'Name and phone_last4 are required', 400, 'INVALID_INPUT');
    }

    if (phone_last4.length !== 4 || !/^\d{4}$/.test(phone_last4)) {
      return errorResponse(res, 'phone_last4 must be exactly 4 digits', 400, 'INVALID_PHONE');
    }

    // 로그인 시도
    const result = await authService.login({ name, phone_last4 });

    if (!result) {
      return errorResponse(res, '사용자 정보를 찾을 수 없습니다.', 401, 'AUTH_USER_NOT_FOUND');
    }

    successResponse(res, result, 'Login successful');
  } catch (error) {
    logger.error('Login error:', error);
    errorResponse(res, 'Login failed due to server error', 500, 'LOGIN_FAILED');
  }
};

export const saveSignature = async (req: AuthRequest, res: Response) => {
  try {
    const { signature_data } = req.body;
    const userId = req.user!.userId;

    // 입력 검증
    if (!signature_data) {
      return errorResponse(res, 'signature_data is required', 400, 'INVALID_INPUT');
    }

    // Base64 이미지 검증
    if (!signature_data.startsWith('data:image/')) {
      return errorResponse(res, 'signature_data must be a valid base64 image', 400, 'INVALID_SIGNATURE');
    }

    // 서명 저장
    const result = await authService.saveSignature({
      userId,
      signatureData: signature_data,
    });

    successResponse(res, result, 'Signature saved');
  } catch (error) {
    logger.error('Save signature error:', error);
    errorResponse(res, 'Failed to save signature', 500, 'SIGNATURE_SAVE_FAILED');
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await authService.getUserById(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    successResponse(res, user);
  } catch (error) {
    logger.error('Get user error:', error);
    errorResponse(res, 'Failed to get user information', 500, 'GET_USER_FAILED');
  }
};

export const resetLogin = async (req: Request, res: Response) => {
  try {
    const { name, phone_last4 } = req.body;

    // 입력 검증
    if (!name || !phone_last4) {
      return errorResponse(res, 'Name and phone_last4 are required', 400, 'INVALID_INPUT');
    }

    const success = await authService.resetLogin({ name, phone_last4 });

    if (!success) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    successResponse(res, null, 'Login session reset successfully');
  } catch (error) {
    logger.error('Reset login error:', error);
    errorResponse(res, 'Failed to reset login session', 500, 'RESET_FAILED');
  }
};

// 서명 이미지 조회 (이름과 전화번호로)
export const getSignatureByUser = async (req: Request, res: Response) => {
  try {
    const { name, phone_last4 } = req.query;

    // 입력 검증
    if (!name || !phone_last4) {
      return errorResponse(res, 'Name and phone_last4 are required', 400, 'INVALID_PARAMS');
    }

    const signature = await authService.getSignatureByUser({
      name: name as string,
      phone_last4: phone_last4 as string
    });

    if (!signature) {
      return errorResponse(res, 'Signature not found', 404, 'SIGNATURE_NOT_FOUND');
    }

    successResponse(res, signature);
  } catch (error) {
    logger.error('Get signature error:', error);
    errorResponse(res, 'Failed to get signature', 500, 'GET_SIGNATURE_FAILED');
  }
};

// 서명 이미지 조회 (userId로)
export const getSignature = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return errorResponse(res, 'User ID is required', 400, 'INVALID_PARAMS');
    }

    const signature = await authService.getSignatureByUserId(userId);

    if (!signature) {
      return errorResponse(res, 'Signature not found', 404, 'SIGNATURE_NOT_FOUND');
    }

    successResponse(res, signature);
  } catch (error) {
    logger.error('Get signature error:', error);
    errorResponse(res, 'Failed to get signature', 500, 'GET_SIGNATURE_FAILED');
  }
};

// 현장 등록
export const register = async (req: Request, res: Response) => {
  try {
    const { name, phone_last4, email, organization } = req.body;

    // 입력 검증
    if (!name || !phone_last4) {
      return errorResponse(res, '이름과 전화번호 뒷 4자리는 필수입니다', 400, 'INVALID_INPUT');
    }

    if (phone_last4.length !== 4 || !/^\d{4}$/.test(phone_last4)) {
      return errorResponse(res, '전화번호 뒷 4자리는 숫자 4자리여야 합니다', 400, 'INVALID_PHONE');
    }

    // 등록 시도
    const result = await authService.register({ name, phone_last4, email, organization });

    if ('error' in result) {
      if (result.error === 'USER_ALREADY_EXISTS') {
        return errorResponse(res, '이미 등록된 사용자입니다. 로그인을 시도해주세요.', 409, 'USER_ALREADY_EXISTS');
      }
      return errorResponse(res, '등록에 실패했습니다', 500, result.error);
    }

    successResponse(res, result, '현장 등록이 완료되었습니다');
  } catch (error) {
    logger.error('Register error:', error);
    errorResponse(res, '현장 등록에 실패했습니다', 500, 'REGISTER_FAILED');
  }
};
