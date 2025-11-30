# 모두콘 2025 - 백엔드 서버

모두콘 컨퍼런스 북 백엔드 API 서버

## 🚀 빠른 시작

### 환경 요구사항
- Node.js >= 18.0.0
- PostgreSQL >= 14.0

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env.example 참고)
cp .env.example .env

# 3. JWT Secret 생성
openssl rand -base64 32

# 4. .env 파일 편집
# JWT_SECRET, GOOGLE_SHEETS_API_KEY 설정

# 5. 서버 시작
npm run dev
```

## 🔐 보안 설정

### 환경 변수 설정

1. `.env.example`을 복사하여 `.env` 파일 생성:
   ```bash
   cp .env.example .env
   ```

2. JWT Secret 생성:
   ```bash
   openssl rand -base64 32
   ```

3. `.env` 파일 편집:
   ```env
   JWT_SECRET="<위에서 생성한 시크릿>"
   GOOGLE_SHEETS_API_KEY="<Google Cloud Console에서 발급받은 키>"
   ```

4. **중요**: `.env` 파일을 절대 Git에 커밋하지 마세요!

### Google Sheets API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동
4. "사용자 인증 정보 만들기" > "API 키" 선택
5. API 키 제한 설정:
   - 애플리케이션 제한: HTTP 리퍼러 (웹사이트)
   - API 제한: Google Sheets API
6. 생성된 키를 `.env` 파일에 추가

## 📁 프로젝트 구조

```
moducon-backend/
├── src/
│   ├── middleware/        # Express 미들웨어
│   │   └── validateEnv.ts # 환경 변수 검증
│   ├── services/          # 비즈니스 로직
│   │   └── googleSheetsService.ts
│   ├── types/             # TypeScript 타입 정의
│   │   ├── session.ts
│   │   ├── booth.ts
│   │   └── paper.ts
│   └── index.ts           # 엔트리 포인트
├── .env.example           # 환경 변수 템플릿
├── .gitignore
├── package.json
└── README.md
```

## 🔧 개발

### 환경 변수 검증

서버 시작 시 자동으로 환경 변수를 검증합니다:

- 필수 변수: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_SHEETS_API_KEY`, `SPREADSHEET_ID`
- `JWT_SECRET`은 최소 32자 이상이어야 합니다

### API 엔드포인트

#### 세션 관련
- `GET /api/sessions` - 전체 세션 목록
- `GET /api/sessions?track=Track00` - 특정 트랙 세션
- `GET /api/sessions/:id` - 세션 상세

#### 부스 관련
- `GET /api/booths` - 전체 부스 목록
- `GET /api/booths/:id` - 부스 상세

#### 포스터 관련
- `GET /api/papers` - 전체 포스터 목록
- `GET /api/papers/:id` - 포스터 상세

## 🧪 테스트

```bash
# 유닛 테스트
npm test

# 통합 테스트
npm run test:integration

# 커버리지
npm run test:coverage
```

## 📝 라이선스

MIT
