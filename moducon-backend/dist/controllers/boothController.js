"use strict";
/**
 * Booth Controller
 * 부스 관련 API 컨트롤러
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooths = getBooths;
exports.getBoothById = getBoothById;
const sheetsService = __importStar(require("../services/googleSheetsService"));
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
/**
 * GET /api/booths
 * 부스 목록 조회
 */
async function getBooths(req, res) {
    try {
        const { type } = req.query;
        const booths = type
            ? await sheetsService.filterBooths(type)
            : await sheetsService.getBooths();
        (0, response_1.successResponse)(res, booths, '부스 목록을 성공적으로 조회했습니다.');
    }
    catch (error) {
        logger_1.logger.error('부스 목록 조회 실패:', error);
        (0, response_1.errorResponse)(res, '부스 목록 조회에 실패했습니다.', 500);
    }
}
/**
 * GET /api/booths/:id
 * 특정 부스 상세 조회
 */
async function getBoothById(req, res) {
    try {
        const { id } = req.params;
        const booth = await sheetsService.getBoothById(id);
        if (!booth) {
            (0, response_1.errorResponse)(res, '부스를 찾을 수 없습니다.', 404);
            return;
        }
        (0, response_1.successResponse)(res, booth, '부스 상세 정보를 성공적으로 조회했습니다.');
    }
    catch (error) {
        logger_1.logger.error('부스 상세 조회 실패:', error);
        (0, response_1.errorResponse)(res, '부스 상세 조회에 실패했습니다.', 500);
    }
}
