"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetLogin = exports.getUserById = exports.saveSignature = exports.login = void 0;
const jwt_1 = require("../config/jwt");
const logger_1 = require("../utils/logger");
const prisma_1 = require("../lib/prisma");
const login = async (input) => {
    // 사용자 검색
    const user = await prisma_1.prisma.user.findUnique({
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
        logger_1.logger.warn(`Login failed: User not found (${input.name}, ${input.phone_last4})`);
        return null;
    }
    // JWT 토큰 생성
    const token = (0, jwt_1.generateToken)({
        userId: user.id,
        name: user.name,
    });
    // 세션 저장
    await prisma_1.prisma.authSession.create({
        data: {
            userId: user.id,
            token,
            expiresAt: (0, jwt_1.getTokenExpiry)(),
        },
    });
    // 마지막 로그인 시간 업데이트
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });
    logger_1.logger.info(`User logged in: ${user.name} (${user.id})`);
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            phone_last4: user.phoneLast4,
            registration_type: user.registrationType,
            has_signature: user.signatures.length > 0,
        },
    };
};
exports.login = login;
const saveSignature = async (input) => {
    // 기존 서명 삭제 (있다면)
    await prisma_1.prisma.signature.deleteMany({
        where: { userId: input.userId },
    });
    // 새 서명 저장
    const signature = await prisma_1.prisma.signature.create({
        data: {
            userId: input.userId,
            signatureData: input.signatureData,
        },
    });
    logger_1.logger.info(`Signature saved for user: ${input.userId}`);
    return {
        signature_url: `/signatures/${input.userId}.png`,
        user: {
            id: input.userId,
            has_signature: true,
        },
    };
};
exports.saveSignature = saveSignature;
const getUserById = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
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
        has_signature: user.signatures.length > 0,
        registration_type: user.registrationType,
        registered_at: user.registeredAt.toISOString(),
    };
};
exports.getUserById = getUserById;
const resetLogin = async (input) => {
    // 사용자 검색
    const user = await prisma_1.prisma.user.findUnique({
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
    await prisma_1.prisma.authSession.updateMany({
        where: { userId: user.id },
        data: { isRevoked: true },
    });
    // 서명 삭제
    await prisma_1.prisma.signature.deleteMany({
        where: { userId: user.id },
    });
    // 마지막 로그인 초기화
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: null },
    });
    logger_1.logger.info(`Login reset for user: ${user.name} (${user.id})`);
    return true;
};
exports.resetLogin = resetLogin;
