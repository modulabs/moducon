import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * GET /api/admin/participants
 * 모든 참가자 목록 조회 (이름, 전화번호 뒷4자리, 서명 여부)
 */
export const getParticipants = async (req: Request, res: Response) => {
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

    res.json(
      successResponse(
        {
          total: participantsWithSignature.length,
          participants: participantsWithSignature,
        },
        'Participants retrieved successfully'
      )
    );
  } catch (error) {
    logger.error('Get participants error:', error);
    res.status(500).json(
      errorResponse('GET_PARTICIPANTS_FAILED', 'Failed to retrieve participants')
    );
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
      return res.status(404).json(
        errorResponse('PARTICIPANT_NOT_FOUND', 'Participant not found')
      );
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

    res.json(
      successResponse(
        {
          ...participant,
          phone_last4: participant.phoneLast4,
          has_signature: !!participant.signatureUrl,
          signature: signatureData,
        },
        'Participant retrieved successfully'
      )
    );
  } catch (error) {
    logger.error('Get participant by id error:', error);
    res.status(500).json(
      errorResponse('GET_PARTICIPANT_FAILED', 'Failed to retrieve participant')
    );
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
      return res.status(400).json(
        errorResponse('INVALID_QUERY', 'Search query is required')
      );
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

    const participantsWithSignature = participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      phone_last4: participant.phoneLast4,
      has_signature: !!participant.signatureUrl,
      last_login: participant.lastLogin,
      registered_at: participant.registeredAt,
    }));

    res.json(
      successResponse(
        {
          total: participantsWithSignature.length,
          participants: participantsWithSignature,
        },
        'Search completed'
      )
    );
  } catch (error) {
    logger.error('Search participants error:', error);
    res.status(500).json(
      errorResponse('SEARCH_FAILED', 'Failed to search participants')
    );
  }
};
