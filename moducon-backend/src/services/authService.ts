import { generateToken, getTokenExpiry } from '../config/jwt';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';

export interface LoginInput {
  name: string;
  phone_last4: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    phone_last4: string;
    registration_type: string;
    has_signature: boolean;
  };
}

export const login = async (input: LoginInput): Promise<LoginResult | null> => {
  // 사용자 검색
  const user = await prisma.user.findUnique({
    where: {
      unique_user: {
        name: input.name,
        phoneLast4: input.phone_last4,
      },
    },
    include: {
      signatures: true,
    },
  });

  if (!user) {
    logger.warn(`Login failed: User not found (${input.name}, ${input.phone_last4})`);
    return null;
  }

  // JWT 토큰 생성
  const token = generateToken({
    userId: user.id,
    name: user.name,
  });

  // 세션 저장
  await prisma.authSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt: getTokenExpiry(),
    },
  });

  // 마지막 로그인 시간 업데이트
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  logger.info(`User logged in: ${user.name} (${user.id})`);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phone_last4: user.phoneLast4,
      registration_type: user.registrationType,
      has_signature: user.signatures !== null,
    },
  };
};

export interface SaveSignatureInput {
  userId: string;
  signatureData: string;
}

export const saveSignature = async (input: SaveSignatureInput) => {
  // 기존 서명 삭제 (있다면)
  await prisma.signature.deleteMany({
    where: { userId: input.userId },
  });

  // 새 서명 저장
  const signature = await prisma.signature.create({
    data: {
      userId: input.userId,
      signatureData: input.signatureData,
    },
  });

  // users 테이블의 signatureUrl 업데이트
  const signatureUrl = `/signatures/${input.userId}.png`;
  await prisma.user.update({
    where: { id: input.userId },
    data: { signatureUrl },
  });

  logger.info(`Signature saved for user: ${input.userId}`);

  return {
    signature_url: signatureUrl,
    user: {
      id: input.userId,
      has_signature: true,
    },
  };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      signatures: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    phone_last4: user.phoneLast4,
    email: user.email,
    organization: user.organization,
    has_signature: user.signatures !== null,
    registration_type: user.registrationType,
    registered_at: user.registeredAt.toISOString(),
  };
};

export const resetLogin = async (input: LoginInput) => {
  // 사용자 검색
  const user = await prisma.user.findUnique({
    where: {
      unique_user: {
        name: input.name,
        phoneLast4: input.phone_last4,
      },
    },
  });

  if (!user) {
    return false;
  }

  // 모든 세션 무효화
  await prisma.authSession.updateMany({
    where: { userId: user.id },
    data: { isRevoked: true },
  });

  // 서명 삭제
  await prisma.signature.deleteMany({
    where: { userId: user.id },
  });

  // 마지막 로그인 초기화
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: null },
  });

  logger.info(`Login reset for user: ${user.name} (${user.id})`);

  return true;
};

// 사용자 이름과 전화번호로 서명 조회
export const getSignatureByUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      unique_user: {
        name: input.name,
        phoneLast4: input.phone_last4,
      },
    },
  });

  if (!user) {
    return null;
  }

  const signature = await prisma.signature.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (!signature) {
    return null;
  }

  return {
    signature_data: signature.signatureData,
    user_id: user.id,
    user_name: user.name,
    created_at: signature.createdAt.toISOString(),
  };
};

// userId로 서명 조회
export const getSignatureByUserId = async (userId: string) => {
  const signature = await prisma.signature.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!signature) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return {
    signature_data: signature.signatureData,
    user_id: userId,
    user_name: user?.name || '',
    created_at: signature.createdAt.toISOString(),
  };
};

// 현장 등록
export interface RegisterInput {
  name: string;
  phone_last4: string;
  email?: string;
  organization?: string;
}

export const register = async (input: RegisterInput): Promise<LoginResult | { error: string }> => {
  // 중복 사용자 확인
  const existingUser = await prisma.user.findUnique({
    where: {
      unique_user: {
        name: input.name,
        phoneLast4: input.phone_last4,
      },
    },
  });

  if (existingUser) {
    logger.warn(`Registration failed: User already exists (${input.name}, ${input.phone_last4})`);
    return { error: 'USER_ALREADY_EXISTS' };
  }

  // 새 사용자 생성
  const user = await prisma.user.create({
    data: {
      name: input.name,
      phoneLast4: input.phone_last4,
      email: input.email || null,
      organization: input.organization || null,
      registrationType: 'onsite',
      lastLogin: new Date(),
    },
  });

  // JWT 토큰 생성
  const token = generateToken({
    userId: user.id,
    name: user.name,
  });

  // 세션 저장
  await prisma.authSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt: getTokenExpiry(),
    },
  });

  logger.info(`New user registered (onsite): ${user.name} (${user.id})`);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phone_last4: user.phoneLast4,
      registration_type: user.registrationType,
      has_signature: false,
    },
  };
};
