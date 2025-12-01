import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * POST /api/admin/login
 * 관리자 로그인
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 입력 검증
    if (!username || !password) {
      return errorResponse(res, '아이디와 비밀번호를 입력해주세요.', 400, 'MISSING_FIELDS');
    }

    // 관리자 계정 조회
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return errorResponse(res, '아이디 또는 비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return errorResponse(res, '아이디 또는 비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { adminId: admin.id, username: admin.username },
      process.env.ADMIN_SECRET || 'admin-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    logger.info(`Admin login successful: ${username}`);

    successResponse(res, { token, expiresIn: '7d' }, 'Admin login successful');
  } catch (error) {
    logger.error('Admin login error:', error);
    errorResponse(res, 'Login failed. Please try again.', 500, 'LOGIN_FAILED');
  }
};

/**
 * GET /api/admin/participants
 * 모든 참가자 목록 조회 (이름, 전화번호 뒷4자리, 서명 여부)
 */
export const getParticipants = async (_req: Request, res: Response) => {
  try {
    const participants = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phoneLast4: true,
        signatureUrl: true,
        lastLogin: true,
        registeredAt: true,
      },
      orderBy: [
        { name: 'asc' },
        { phoneLast4: 'asc' },
      ],
    });

    // 서명 데이터를 포함한 참가자 정보 생성
    const participantsWithSignature = await Promise.all(
      participants.map(async (participant) => {
        let signatureData = null;

        if (participant.signatureUrl) {
          // 서명이 있는 경우 실제 서명 데이터 조회
          const signature = await prisma.signature.findUnique({
            where: { userId: participant.id },
            select: { signatureData: true },
          });
          signatureData = signature?.signatureData || null;
        }

        return {
          id: participant.id,
          name: participant.name,
          phone_last4: participant.phoneLast4,
          has_signature: !!participant.signatureUrl,
          signature_data: signatureData,
          last_login: participant.lastLogin,
          registered_at: participant.registeredAt,
        };
      })
    );

    successResponse(res, {
      total: participantsWithSignature.length,
      participants: participantsWithSignature,
    }, 'Participants retrieved successfully');
  } catch (error) {
    logger.error('Get participants error:', error);
    errorResponse(res, 'Failed to retrieve participants', 500, 'GET_PARTICIPANTS_FAILED');
  }
};

/**
 * GET /api/admin/participants/:id
 * 특정 참가자 상세 정보 조회
 */
export const getParticipantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const participant = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phoneLast4: true,
        email: true,
        organization: true,
        signatureUrl: true,
        lastLogin: true,
        registeredAt: true,
      },
    });

    if (!participant) {
      return errorResponse(res, 'Participant not found', 404, 'PARTICIPANT_NOT_FOUND');
    }

    // 서명 데이터 조회
    let signatureData = null;
    if (participant.signatureUrl) {
      const signature = await prisma.signature.findUnique({
        where: { userId: participant.id },
        select: { signatureData: true, createdAt: true },
      });
      signatureData = signature;
    }

    successResponse(res, {
      ...participant,
      phone_last4: participant.phoneLast4,
      has_signature: !!participant.signatureUrl,
      signature: signatureData,
    }, 'Participant retrieved successfully');
  } catch (error) {
    logger.error('Get participant by id error:', error);
    errorResponse(res, 'Failed to retrieve participant', 500, 'GET_PARTICIPANT_FAILED');
  }
};

/**
 * GET /api/admin/participants/search
 * 참가자 검색 (이름 또는 전화번호)
 */
export const searchParticipants = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return errorResponse(res, 'Search query is required', 400, 'INVALID_QUERY');
    }

    const participants = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { phoneLast4: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        phoneLast4: true,
        signatureUrl: true,
        lastLogin: true,
        registeredAt: true,
      },
      orderBy: [
        { name: 'asc' },
        { phoneLast4: 'asc' },
      ],
    });

    // 서명 데이터를 포함한 참가자 정보 생성
    const participantsWithSignature = await Promise.all(
      participants.map(async (participant) => {
        let signatureData = null;

        if (participant.signatureUrl) {
          // 서명이 있는 경우 실제 서명 데이터 조회
          const signature = await prisma.signature.findUnique({
            where: { userId: participant.id },
            select: { signatureData: true },
          });
          signatureData = signature?.signatureData || null;
        }

        return {
          id: participant.id,
          name: participant.name,
          phone_last4: participant.phoneLast4,
          has_signature: !!participant.signatureUrl,
          signature_data: signatureData,
          last_login: participant.lastLogin,
          registered_at: participant.registeredAt,
        };
      })
    );

    successResponse(res, {
      total: participantsWithSignature.length,
      participants: participantsWithSignature,
    }, 'Search completed');
  } catch (error) {
    logger.error('Search participants error:', error);
    errorResponse(res, 'Failed to search participants', 500, 'SEARCH_FAILED');
  }
};
