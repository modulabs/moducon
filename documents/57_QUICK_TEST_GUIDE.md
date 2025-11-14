# 57_QUICK_TEST_GUIDE.md - 서명 기능 빠른 테스트 가이드

## 🚀 3분 안에 서명 기능 테스트하기

### 1단계: 서버 실행 (1분)

```bash
# 터미널 1: 백엔드 서버
cd /Users/hchang/Myspace/Modulabs/moducon/moducon-backend
npm run dev

# 터미널 2: 프론트엔드 서버
cd /Users/hchang/Myspace/Modulabs/moducon/moducon-frontend
npm run dev
```

### 2단계: 로그인 초기화 (30초)

```bash
# 터미널 3: 서명 초기화
curl -X POST http://localhost:3001/api/auth/reset-login \
  -H "Content-Type: application/json" \
  -d '{"name":"조해창","phone_last4":"4511"}'

# 예상 응답: {"success":true,"message":"Login session reset successfully"}
```

### 3단계: 브라우저 테스트 (1분 30초)

1. **브라우저에서** http://localhost:3000/login **접속**

2. **개발자 도구 열기** (F12)
   - Application 탭 → Local Storage → Clear All

3. **로그인 입력**
   - 이름: `조해창`
   - 전화번호 뒷 4자리: `4511`

4. **로그인 버튼 클릭**

5. **✅ 서명 페이지 표시 확인**
   - Canvas 그리기 영역
   - "다시 작성" 버튼
   - "서명 완료" 버튼

6. **서명 작성 및 저장**
   - Canvas에 서명 그리기
   - "서명 완료" 버튼 클릭

7. **✅ 홈 페이지로 이동 확인**

---

## ⚡ 더 빠른 테스트 (API로 직접 확인)

### 백엔드만 빠르게 테스트

```bash
# 1. 백엔드 서버 실행
cd /Users/hchang/Myspace/Modulabs/moducon/moducon-backend
npm run dev

# 2. 로그인 초기화
curl -X POST http://localhost:3001/api/auth/reset-login \
  -H "Content-Type: application/json" \
  -d '{"name":"조해창","phone_last4":"4511"}'

# 3. 로그인 (has_signature 확인)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"조해창","phone_last4":"4511"}' | jq '.data.user.has_signature'

# 예상 응답: false  ← 이 값이 false면 서명 페이지로 이동해야 함

# 4. 서명 저장 (JWT 토큰 필요)
# (이 단계는 프론트엔드에서 테스트하는 것이 더 쉬움)
```

---

## 🔍 문제 발생 시 즉시 확인

### 서명 페이지가 안 보이면?

```bash
# 1. 백엔드 응답 확인
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"조해창","phone_last4":"4511"}' | jq '.data.user.has_signature'

# false가 나오면 → 백엔드는 정상 (프론트엔드 문제)
# true가 나오면 → 서명 초기화 필요
```

### 서명 초기화 안 되면?

```bash
# 데이터베이스 직접 확인
cd /Users/hchang/Myspace/Modulabs/moducon/moducon-backend
npx prisma studio

# 브라우저에서 Signature 테이블 열기
# → userId가 'fb520005-ac5c-41eb-a70b-93e67fac5721'인 행 삭제
# → User 테이블에서 lastLogin을 NULL로 설정
```

---

## 📱 프로덕션 환경 테스트

### GitHub Pages 배포 후 테스트

1. **환경 변수 확인**
   ```env
   NEXT_PUBLIC_API_URL=https://api.moducon.vibemakers.kr
   ```

2. **빌드 및 배포**
   ```bash
   cd moducon-frontend
   npm run build
   npm run deploy
   ```

3. **브라우저 테스트**
   - https://moducon.vibemakers.kr/login 접속
   - 로그인 후 서명 페이지 확인

---

## ✅ 성공 기준

### 테스트 통과 조건

- [ ] 백엔드 로그인 API가 `has_signature: false` 반환
- [ ] 프론트엔드 로그인 후 `/signature` 페이지로 리다이렉트
- [ ] 서명 Canvas가 정상 표시됨
- [ ] 서명 작성 후 "서명 완료" 클릭 시 `/home`으로 이동
- [ ] 재로그인 시 `/home`으로 바로 이동 (서명 건너뜀)
- [ ] 로그인 초기화 후 다시 서명 페이지 표시됨

---

**작성 완료**: 2025-11-14
**예상 소요 시간**: 3분
**난이도**: ⭐⭐☆☆☆ (쉬움)
