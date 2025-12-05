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

## 🔄 데이터베이스 동기화 (CDC)

### 개요

본 프로젝트는 **양방향 CDC (Change Data Capture)** 방식으로 두 PostgreSQL 서버 간 데이터를 실시간 동기화합니다. 한 서버에서 변경된 데이터는 자동으로 다른 서버로 전파되어 고가용성과 데이터 일관성을 보장합니다.

### 동기화 아키텍처

```
┌─────────────────────┐     5초 간격     ┌─────────────────────┐
│   메인 서버 (DB)     │ ◄──────────────► │   백업 서버 (DB)     │
│                     │   양방향 CDC     │                     │
│  - sync_queue       │                  │  - sync_queue       │
│  - sync_status      │                  │  - sync_status      │
└─────────────────────┘                  └─────────────────────┘
```

### 핵심 컴포넌트

#### 1. UUID v7 함수
모든 테이블의 Primary Key는 시간 정렬이 가능한 `uuid_v7()` 함수로 생성됩니다:
- 타임스탬프 기반으로 자연스러운 정렬 가능
- 분산 환경에서 충돌 없는 고유 ID 생성
- 동기화 시 시간순 처리에 유리

#### 2. 동기화 테이블

**sync_status**: 동기화 상태 관리
```sql
CREATE TABLE sync_status (
    key TEXT PRIMARY KEY,
    value TEXT
);
```
- `is_syncing`: 현재 동기화 진행 여부 (동기화 루프 방지)

**sync_queue**: 변경 사항 큐
```sql
CREATE TABLE sync_queue (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    row_id UUID NOT NULL,
    operation TEXT NOT NULL,      -- INSERT, UPDATE, DELETE
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(table_name, row_id)
);
```

#### 3. 트리거 함수

**sync_queue_trigger()**: 테이블 변경 시 sync_queue에 기록
- INSERT/UPDATE/DELETE 작업 감지
- `is_syncing = true`일 때는 동작 안함 (무한 루프 방지)

**update_timestamp()**: `updated_at` 컬럼 자동 갱신
- 모든 UPDATE 시 현재 시간으로 자동 설정

### 동기화 대상 테이블

다음 14개 테이블이 양방향 동기화됩니다:

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 정보 |
| `auth_sessions` | 인증 세션 |
| `signatures` | 사용자 서명 |
| `admins` | 관리자 계정 |
| `user_checkins` | 체크인 기록 |
| `quizzes` | 퀴즈 문제 |
| `user_quiz_attempts` | 퀴즈 시도 기록 |
| `sessions` | 컨퍼런스 세션 |
| `booths` | 부스 정보 |
| `posters` | 포스터 정보 |
| `questions` | Q&A 질문 |
| `question_likes` | 질문 좋아요 |
| `question_answers` | 질문 답변 |
| `user_favorites` | 즐겨찾기 |

### 새 테이블에 동기화 트리거 추가

새로운 테이블을 만들 때 동기화를 활성화하려면:

```sql
-- 1. 테이블에 updated_at 컬럼 필수 추가
ALTER TABLE "new_table" ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. 동기화 트리거 적용
SELECT add_sync_trigger('new_table');
```

### Prisma 스키마 규칙

모든 모델에 다음 필드가 필요합니다:

```prisma
model ExampleModel {
  id        String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  // ... 다른 필드들
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@map("example_table")
}
```

### 동기화 동작 방식

1. **변경 감지**: 테이블에서 INSERT/UPDATE/DELETE 발생
2. **큐 등록**: `sync_queue_trigger`가 변경 사항을 `sync_queue`에 기록
3. **동기화 실행**: 5초마다 동기화 프로세스가 `sync_queue` 확인
4. **데이터 전송**: 변경된 행을 반대편 서버로 전송
5. **루프 방지**: 수신 측에서는 `is_syncing = true`로 설정하여 재전파 방지
6. **큐 정리**: 성공적으로 동기화된 항목은 큐에서 삭제

### 주의사항

- 모든 테이블에 `updated_at` 컬럼 필수
- 새 테이블 추가 시 반드시 `add_sync_trigger()` 호출
- 대량 데이터 작업 시 동기화 지연 고려
- 양 서버의 스키마는 항상 동일하게 유지

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
