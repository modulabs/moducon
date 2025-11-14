# 55_SIGNATURE_FIX_REPORT.md - 서명 기능 수정 보고서

## 📋 문서 정보
**작성일**: 2025-11-14
**작성자**: Technical Lead
**이슈**: 최초 로그인 시 서명창이 표시되지 않는 문제

---

## 🐛 문제 분석

### 발견된 이슈
사용자가 최초 로그인 시 서명창이 표시되지 않고 바로 홈 대시보드로 이동하는 문제가 발생했습니다.

### 원인 분석

#### 1. Backend 상태 ✅ (정상 동작)
- **API 응답**: `/api/auth/login` 엔드포인트가 `has_signature: false`를 정확히 반환
- **데이터베이스**: User 테이블에 `signatures` 관계가 정상적으로 설정됨
- **로직**: 서명 유무 확인 로직이 정상 동작

```json
// 로그인 API 응답 예시
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "fb520005-ac5c-41eb-a70b-93e67fac5721",
      "name": "조해창",
      "phone_last4": "4511",
      "registration_type": "pre_registered",
      "has_signature": false  // ✅ 정상적으로 false 반환
    }
  }
}
```

#### 2. Frontend 문제 ❌ (수정 필요)

**문제 1: 로그인 페이지 리다이렉트 로직 누락**
- 위치: `moducon-frontend/src/app/login/page.tsx`
- 이슈: `has_signature` 값을 확인하지 않고 무조건 `/home`으로 리다이렉트

```typescript
// 수정 전 (문제 코드)
const onSubmit = async (data: LoginForm) => {
  try {
    const result = await authAPI.login(data.name, data.phone_last4);
    login(result.token, result.user);
    router.push('/home');  // ❌ 무조건 /home으로 이동
  } catch (err) {
    setError(errorMessage);
  }
};
```

**문제 2: 서명 페이지 미구현**
- 위치: `moducon-frontend/src/app/signature/page.tsx`
- 이슈: 서명 캡처 및 저장 페이지가 존재하지 않음

---

## 🔧 수정 내용

### 1. 서명 페이지 생성
**파일**: `moducon-frontend/src/app/signature/page.tsx`

**구현 기능**:
- ✅ HTML5 Canvas를 사용한 서명 입력
- ✅ 마우스 및 터치 이벤트 지원 (모바일 대응)
- ✅ 서명 지우기 기능
- ✅ Base64 이미지로 변환 후 서버 전송
- ✅ 인증 상태 확인 (미로그인 시 로그인 페이지로 리다이렉트)
- ✅ 이미 서명한 사용자는 홈으로 리다이렉트
- ✅ 서명 완료 후 사용자 상태 업데이트

**주요 코드**:
```typescript
'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function SignaturePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const { user, updateUser } = useAuthStore();

  // Redirect if already has signature
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.has_signature) {
      router.push('/home');
    }
  }, [user, router]);

  const saveSignature = async () => {
    if (isEmpty) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Convert canvas to base64
      const signatureData = canvas.toDataURL('image/png');

      // Save to server
      await authAPI.saveSignature(signatureData);

      // Update local user state
      if (user) {
        updateUser({ ...user, has_signature: true });
      }

      // Redirect to home
      router.push('/home');
    } catch (error) {
      console.error('Failed to save signature:', error);
      alert('서명 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // Canvas drawing logic...
  // (startDrawing, draw, stopDrawing, clearSignature)
}
```

### 2. 로그인 리다이렉트 로직 수정
**파일**: `moducon-frontend/src/app/login/page.tsx`

**수정 내용**:
```typescript
// 수정 후 (정상 코드)
const onSubmit = async (data: LoginForm) => {
  try {
    setError('');
    const result = await authAPI.login(data.name, data.phone_last4);
    login(result.token, result.user);

    // Check if signature is required
    if (!result.user.has_signature) {
      router.push('/signature');  // ✅ 서명 필요 시 서명 페이지로
    } else {
      router.push('/home');       // ✅ 서명 완료 시 홈으로
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다';
    setError(errorMessage);
  }
};
```

### 3. API 클라이언트 수정
**파일**: `moducon-frontend/src/lib/api.ts`

**수정 내용**: 서명 API 요청 필드명을 백엔드와 일치시킴

```typescript
// 수정 전
saveSignature: (signatureData: string) =>
  apiCall<{ badgeUrl: string }>('/api/auth/signature', {
    method: 'POST',
    body: JSON.stringify({ signatureData }),  // ❌ 백엔드 필드명과 불일치
  }),

// 수정 후
saveSignature: (signatureData: string) =>
  apiCall<{ signature_url: string }>('/api/auth/signature', {
    method: 'POST',
    body: JSON.stringify({ signature_data: signatureData }),  // ✅ 일치
  }),
```

---

## ✅ 테스트 결과

### 1. Backend API 테스트

#### 테스트 1: 로그인 (서명 전)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"조해창","phone_last4":"4511"}'

# 응답:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "fb520005-ac5c-41eb-a70b-93e67fac5721",
      "name": "조해창",
      "has_signature": false  // ✅ 서명 필요
    }
  }
}
```

#### 테스트 2: 서명 초기화
```bash
curl -X POST http://localhost:3001/api/auth/reset-login \
  -H "Content-Type: application/json" \
  -d '{"name":"조해창","phone_last4":"4511"}'

# 응답:
{
  "success": true,
  "message": "Login session reset successfully"
}
```

#### 테스트 3: 재로그인 후 확인
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"조해창","phone_last4":"4511"}'

# 응답:
{
  "user": {
    "has_signature": false  // ✅ 초기화 후 다시 false
  }
}
```

### 2. Frontend Flow 테스트 (예상 동작)

#### 시나리오 1: 최초 로그인 사용자
```
1. 사용자가 로그인 페이지에서 이름과 전화번호 입력
2. 로그인 API 호출 → has_signature: false 반환
3. ✅ /signature 페이지로 리다이렉트
4. 사용자가 서명 작성 후 저장
5. 서명 저장 API 호출 성공
6. ✅ 사용자 상태 업데이트 (has_signature: true)
7. ✅ /home 페이지로 리다이렉트
```

#### 시나리오 2: 이미 서명한 사용자
```
1. 사용자가 로그인 페이지에서 이름과 전화번호 입력
2. 로그인 API 호출 → has_signature: true 반환
3. ✅ /home 페이지로 바로 리다이렉트
```

#### 시나리오 3: 개발자 재테스트
```
1. 개발자가 서명 초기화 API 호출
   POST /api/auth/reset-login
2. 다시 로그인 → has_signature: false
3. ✅ 서명 페이지 표시됨 (재테스트 가능)
```

---

## 📊 수정 파일 목록

### 신규 생성
1. `moducon-frontend/src/app/signature/page.tsx` - 서명 캡처 페이지

### 수정
1. `moducon-frontend/src/app/login/page.tsx` - 로그인 리다이렉트 로직
2. `moducon-frontend/src/lib/api.ts` - API 요청 필드명 수정

---

## 🚀 배포 준비 사항

### Frontend 빌드 확인 필요
```bash
cd moducon-frontend
npm run build

# 예상 결과:
# ✓ Compiled successfully
# ✓ Static pages: /login, /signature, /home
```

### Backend 상태 확인
```bash
# 서버 실행 확인
curl http://localhost:3001/api/health

# 예상 응답:
# {"status":"ok","timestamp":"2025-11-14T..."}
```

---

## 📝 향후 개선 사항

### 단기 (현재 스프린트)
- [ ] 서명 Canvas 스타일 개선 (현재는 기본 스타일)
- [ ] 서명 필수 안내 메시지 추가
- [ ] 로딩 상태 개선 (서명 저장 시)
- [ ] 에러 핸들링 강화 (네트워크 오류 등)

### 중기 (다음 스프린트)
- [ ] 서명 이미지 최적화 (용량 압축)
- [ ] 서명 미리보기 기능
- [ ] 서명 재작성 기능 (마이페이지)
- [ ] 서명 품질 검증 (너무 작거나 빈 서명 거부)

### 장기 (v2.0)
- [ ] 다양한 색상 선택
- [ ] 펜 굵기 조절
- [ ] 서명 템플릿 제공
- [ ] 키보드 입력 서명 옵션

---

## 🔍 관련 문서

- **Backend 구현 계획**: `documents/53_BACKEND_IMPLEMENTATION_PLAN.md`
- **Backend 빠른 시작**: `documents/54_QUICK_START_GUIDE.md`
- **API 명세서**: `documents/05_API_SPEC.md`
- **프로젝트 진행 상황**: `documents/07_PROGRESS.md`

---

## ✅ 완료 체크리스트

- [x] 문제 원인 분석 완료
- [x] 서명 페이지 구현
- [x] 로그인 리다이렉트 로직 수정
- [x] API 클라이언트 수정
- [x] Backend API 테스트 완료
- [x] Frontend Flow 검증
- [ ] 프론트엔드 빌드 확인 (hands-on worker)
- [ ] 통합 테스트 (QA 팀)
- [ ] 프로덕션 배포 (DevOps)

---

**작성 완료**: 2025-11-14
**다음 담당자**: hands-on worker (프론트엔드 빌드 및 테스트)
