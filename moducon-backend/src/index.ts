import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 허용 도메인 설정 (프론트엔드 도메인만)
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.10.182:3000',
  'https://moducon.vibemakers.kr',
  'https://ed62fe53e0aa.ngrok-free.app',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
];

// 미들웨어
app.use(cors({
  origin: (origin, callback) => {
    // origin이 없는 경우 (same-origin 요청 또는 서버 간 요청)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 요청 로깅
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// 라우트
app.use('/api', routes);

// 에러 핸들러
app.use(errorHandler);

// 서버 시작 (모든 네트워크 인터페이스에서 수신)
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`🌐 Network: http://192.168.10.182:${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 CORS origins: ${allowedOrigins.join(', ')}`);
});
