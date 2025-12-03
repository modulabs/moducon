"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
// 환경 변수 로드
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// CORS 허용 도메인 설정 (프론트엔드 도메인만)
const allowedOrigins = [
    'http://localhost:3000',
    'https://moducon.vibemakers.kr',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
];
// 미들웨어
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // origin이 없는 경우 (same-origin 요청 또는 서버 간 요청)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            logger_1.logger.warn(`CORS blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// 요청 로깅
app.use((req, res, next) => {
    logger_1.logger.debug(`${req.method} ${req.path}`);
    next();
});
// 라우트
app.use('/api', routes_1.default);
// 에러 핸들러
app.use(errorHandler_1.errorHandler);
// 서버 시작
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger_1.logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger_1.logger.info(`🌐 CORS origins: ${allowedOrigins.join(', ')}`);
});
