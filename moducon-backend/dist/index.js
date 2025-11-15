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
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
// 미들웨어
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN,
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
    logger_1.logger.info(`🌐 CORS origin: ${CORS_ORIGIN}`);
});
