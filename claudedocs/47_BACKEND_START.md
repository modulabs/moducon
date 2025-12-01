# 47_BACKEND_START.md - 백엔드 구현 착수

## 📋 문서 정보
- **작성자**: planner (Technical Lead)
- **작성일**: 2025-01-14
- **다음 담당자**: hands-on worker
- **예상 소요 시간**: 2시간 20분

---

## 🎯 사용자 요청 처리

### 원본 요청
```
"prd를 읽고 디벨롭해가며, 프로덕트 제작을 해야합니다.
일단은 깃헙 page기능으로 배포 가능한 프로덕트 초안을 만드는 것에 집중합니다.
지금 적절히 동작해서 일단 초안 배포는 되었는데, 너무 순차적으로 만들면서
프론트앤드만 만드니까, 어떻게 동작할지 보이지가 않습니다.
이번에는 백엔드를 이어서 만들어주시면 어떨까 싶어요.
그리고 테스트 로그인좀 해볼 수 있게, 조해창, 4511 을 테스트 사용자로 등록해주시고요.
일단 로컬에 postgresql 동작중인걸 사용하면 어떨까 싶습니다.
백앤드는 git branch를 따로 만들어서 관리하고 github에 push하지 않습니다.
초기 로그인은 1회 하면 더이상 서명 요구를 안할테니,
초기 로그인 한 기록을 다시 초기화해가면서 테스트도 해볼 수 있게 해주면 좋겠습니다."
```

### 질문 답변
**Q**: "백엔드를 JS 기반으로 가져가는게 좋은 선택인가요?"
**A**: ✅ **예, JavaScript/TypeScript가 최적입니다** (평가: 8.5/10)

**상세 답변**: `46_TECH_STACK_DECISION.md` 참고

**주요 근거**:
1. ✅ 프론트엔드(Next.js)와 동일 언어 사용
2. ✅ 빠른 개발 속도 (MVP 2시간 20분)
3. ✅ 풍부한 생태계 (Express, Prisma, JWT)
4. ✅ 프로젝트 규모에 적합 (500~1,500명)

---

## 📊 현재 상태

### 완료된 작업 ✅
1. **프론트엔드 100% 완성** (GitHub Pages 배포 준비)
2. **백엔드 기획 완료** (41_BACKEND_DEV_PLAN.md, 42_BACKEND_IMPLEMENTATION_GUIDE.md)
3. **기술 스택 선정 완료** (Node.js + Express + TypeScript + Prisma)
4. **Git 브랜치 생성 완료** (`backend-dev` 브랜치)

### 다음 작업 🚧
**백엔드 구현 시작** (hands-on worker)

---

## 🏗️ 백엔드 구현 계획

### Phase 1: MVP 백엔드 (로컬 개발) - 현재
**목표**: 로그인 기능 테스트 가능한 백엔드 구축
**예상 소요 시간**: 2시간 20분
**브랜치**: `backend-dev` (GitHub 푸시 금지)

### 구현 항목
1. **프로젝트 초기화** (30분)
   - Node.js + Express + TypeScript 설정
   - Prisma ORM 설정
   - PostgreSQL 데이터베이스 생성

2. **데이터베이스 설정** (20분)
   - Prisma 스키마 작성 (users, auth_sessions, signatures)
   - 마이그레이션 실행
   - 테스트 사용자 시드 (조해창, 4511)

3. **인증 API 구현** (1시간)
   - POST `/api/auth/login` - 이름 + 전화번호 로그인
   - POST `/api/auth/signature` - 디지털 서명 저장
   - GET `/api/auth/me` - 사용자 정보 조회
   - POST `/api/auth/reset-login` - 로그인 리셋 (테스트용)
   - JWT 인증 미들웨어

4. **테스트** (30분)
   - API 테스트 (curl/Postman)
   - 프론트엔드 연동 테스트
   - CORS 검증

---

## 📋 구현 가이드

### 필독 문서
**hands-on worker는 다음 문서를 반드시 읽어야 합니다**:

1. **`42_BACKEND_IMPLEMENTATION_GUIDE.md`** (필수)
   - Step 1-9까지 상세 구현 가이드
   - 모든 코드와 설정 파일 포함
   - curl 테스트 예제

2. **`43_BACKEND_HANDOFF.md`** (필수)
   - 작업 개요 및 핵심 요구사항
   - 완료 체크리스트
   - 문제 해결 가이드

3. **`41_BACKEND_DEV_PLAN.md`** (참고)
   - 백엔드 기술 스택 선정 근거
   - 데이터베이스 설계
   - API 명세

---

## 🎯 핵심 요구사항

### 1. 테스트 사용자 등록 ✅
**사용자 정보**:
- 이름: 조해창
- 전화번호 뒤 4자리: 4511
- registration_type: 'pre_registered'

**Prisma Seed 코드** (`prisma/seed.ts`):
```typescript
await prisma.users.create({
  data: {
    id: randomUUID(),
    name: '조해창',
    phone_last4: '4511',
    registration_type: 'pre_registered',
    registered_at: new Date(),
  },
});
```

---

### 2. 로컬 PostgreSQL 사용 ✅
**데이터베이스 설정** (`.env`):
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/moducon_dev"
```

**데이터베이스 생성**:
```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE moducon_dev;

# 종료
\q
```

---

### 3. 로그인 리셋 기능 ✅
**API 엔드포인트**: `POST /api/auth/reset-login`

**기능**:
- 모든 auth_sessions을 is_revoked = true로 변경
- signatures 테이블에서 서명 삭제
- users.last_login을 NULL로 변경

**구현 코드** (`src/services/authService.ts`):
```typescript
async resetLogin(name: string, phone_last4: string): Promise<void> {
  const user = await prisma.users.findUnique({
    where: { name_phone_last4: { name, phone_last4 } },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // 모든 세션 무효화
  await prisma.auth_sessions.updateMany({
    where: { user_id: user.id },
    data: { is_revoked: true },
  });

  // 서명 삭제
  await prisma.signatures.deleteMany({
    where: { user_id: user.id },
  });

  // last_login 초기화
  await prisma.users.update({
    where: { id: user.id },
    data: { last_login: null, signature_url: null },
  });
}
```

---

### 4. Git 브랜치 관리 ✅
**브랜치**: `backend-dev`
**GitHub 푸시**: ❌ **절대 금지**

**Git 워크플로우**:
```bash
# 현재 브랜치 확인
git branch
# * backend-dev

# 작업 완료 후 로컬 커밋
git add moducon-backend/
git commit -m "feat: 백엔드 초기 구현 완료

- Express + TypeScript + Prisma 설정
- PostgreSQL 데이터베이스 연동
- 인증 API 4개 엔드포인트 구현
- 테스트 사용자 (조해창, 4511) 시드
- 로그인 리셋 기능 구현
"

# ⚠️ GitHub에 푸시하지 않음!
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 초기 로그인
```bash
# 1. 로그인
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "조해창", "phone_last4": "4511"}'

# 2. 토큰 받기
# Response: { "token": "...", "user": {...} }

# 3. 사용자 정보 조회
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"

# 4. has_signature: false 확인
```

### 시나리오 2: 서명 저장
```bash
# 1. 서명 저장
curl -X POST http://localhost:3001/api/auth/signature \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"signature_data": "data:image/png;base64,..."}'

# 2. 사용자 정보 재조회
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"

# 3. has_signature: true 확인
```

### 시나리오 3: 로그인 리셋
```bash
# 1. 로그인 리셋
curl -X POST http://localhost:3001/api/auth/reset-login \
  -H "Content-Type: application/json" \
  -d '{"name": "조해창", "phone_last4": "4511"}'

# 2. 기존 토큰으로 요청
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <OLD_TOKEN>"
# Response: 401 Unauthorized

# 3. 다시 로그인 (시나리오 1 반복)
```

---

## 📋 완료 체크리스트

### 구현 전 준비
- [ ] PostgreSQL 실행 확인 (`psql -U postgres -c "SELECT version();"`)
- [ ] `42_BACKEND_IMPLEMENTATION_GUIDE.md` 읽기
- [ ] `43_BACKEND_HANDOFF.md` 읽기

### 코드 구현
- [ ] Git 브랜치 `backend-dev` 생성
- [ ] Node.js 프로젝트 초기화
- [ ] 필수 패키지 설치 (express, prisma, jwt 등)
- [ ] TypeScript 설정
- [ ] Prisma 스키마 작성
- [ ] PostgreSQL 데이터베이스 생성
- [ ] 마이그레이션 실행
- [ ] 시드 데이터 생성 (조해창, 4511)
- [ ] 서버 코드 구현 (src/index.ts 등)
- [ ] 4개 API 엔드포인트 구현

### 테스트
- [ ] 서버 실행 성공 (npm run dev)
- [ ] POST /api/auth/login 동작 확인
- [ ] GET /api/auth/me 동작 확인
- [ ] POST /api/auth/signature 동작 확인
- [ ] POST /api/auth/reset-login 동작 확인
- [ ] CORS 설정 확인 (프론트엔드 연동 가능)

### Git 관리
- [ ] moducon-backend/ 디렉토리 커밋
- [ ] .env 파일이 .gitignore에 추가됨
- [ ] 커밋 메시지 작성
- [ ] **GitHub에 푸시하지 않음 확인**

---

## 🎯 성공 기준

다음 조건이 모두 충족되면 작업 완료입니다:

1. ✅ 백엔드 서버가 http://localhost:3001에서 실행됨
2. ✅ 테스트 사용자 (조해창, 4511)로 로그인 가능
3. ✅ JWT 토큰 발급 및 인증 동작
4. ✅ 서명 저장 기능 동작
5. ✅ 로그인 리셋 기능 동작
6. ✅ 프론트엔드에서 로그인 테스트 성공
7. ✅ Git 커밋 완료 (GitHub 푸시 안 함)

---

## 🔄 다음 단계

### hands-on worker 작업
1. **`42_BACKEND_IMPLEMENTATION_GUIDE.md` 읽기** (필수)
2. Step 1-9 순서대로 구현
3. 각 단계별 테스트 확인
4. 완료 체크리스트 확인
5. 구현 로그 작성 (`48_BACKEND_IMPLEMENTATION_LOG.md`)

### 예상 소요 시간
- **프로젝트 초기화**: 30분
- **데이터베이스 설정**: 20분
- **서버 구현**: 1시간
- **테스트**: 30분
- **총 예상 시간**: 2시간 20분

---

## ⚠️ 중요 주의사항

### Git 관리
- ✅ `backend-dev` 브랜치에서만 작업
- ❌ **절대로 GitHub에 푸시하지 마세요**
- ✅ `.env` 파일은 `.gitignore`에 추가
- ✅ 로컬 커밋은 가능

### 보안
- JWT_SECRET은 개발용 임시 값 사용
- 프로덕션에서는 강력한 시크릿 키 필요
- 환경 변수는 절대 Git에 커밋 금지

### 데이터베이스
- 로컬 PostgreSQL만 사용
- 프로덕션 데이터베이스와 분리
- 시드 데이터는 테스트 사용자만 포함

---

**작성자**: planner (Technical Lead)
**작성일**: 2025-01-14
**다음 담당자**: hands-on worker
**필독 문서**: `42_BACKEND_IMPLEMENTATION_GUIDE.md`, `43_BACKEND_HANDOFF.md`
