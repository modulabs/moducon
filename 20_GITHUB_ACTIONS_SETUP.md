# 20_GITHUB_ACTIONS_SETUP.md - GitHub Actions 배포 설정 가이드

## 📋 문서 정보
- **작성일**: 2025-01-14
- **작성자**: hands-on worker
- **대상**: DevOps 엔지니어 / 프로젝트 관리자
- **목적**: GitHub Actions 자동 배포 설정 완료 및 검증

---

## ✅ 작업 완료 내용

### 1. GitHub Actions 워크플로우 파일 업데이트

**파일**: `.github/workflows/deploy.yml`

**변경사항**:
1. ✅ GitHub Actions 버전 업데이트
   - `actions/checkout@v3` → `@v4`
   - `actions/setup-node@v3` → `@v4`
   - `peaceiris/actions-gh-pages@v3` → `@v4`

2. ✅ Node.js 버전 업데이트
   - `node-version: '18'` → `'20'` (Next.js 16 요구사항)

3. ✅ 빌드 환경 변수 설정
   - `NEXT_PUBLIC_API_URL`: 백엔드 API URL
   - `NEXT_PUBLIC_WS_URL`: WebSocket URL

4. ✅ 배포 설정
   - `publish_dir`: `./moducon-frontend/out` (Static Export 결과물)
   - `cname`: `moducon.vibemakers.kr` (커스텀 도메인)

---

## 🔐 GitHub Secrets 설정 필요

### 필수 시크릿
다음 시크릿을 GitHub Repository Settings → Secrets and variables → Actions에 추가해야 합니다:

| 시크릿 이름 | 설명 | 예시 값 |
|-----------|-----|--------|
| `API_URL` | 백엔드 REST API URL | `https://api.moducon.vibemakers.kr` |
| `WS_URL` | WebSocket 서버 URL | `wss://api.moducon.vibemakers.kr` |

### 설정 방법
1. GitHub Repository → Settings
2. Secrets and variables → Actions
3. "New repository secret" 클릭
4. 위 시크릿 2개 추가

**참고**: `GITHUB_TOKEN`은 자동으로 제공되므로 별도 설정 불필요

---

## 📦 워크플로우 동작 방식

### 트리거
```yaml
on:
  push:
    branches: [main]  # main 브랜치에 push 시 자동 실행
  workflow_dispatch:  # 수동 실행도 가능
```

### 실행 단계
1. **Checkout**: 소스 코드 체크아웃
2. **Setup Node.js**: Node.js 20 설치 및 npm 캐시
3. **Install dependencies**: `npm ci` (package-lock.json 기반 설치)
4. **Build**: `npm run build` (Static Export)
5. **Deploy**: GitHub Pages에 배포 (`./moducon-frontend/out` 폴더)

### 예상 실행 시간
- 전체: **약 2-3분**
  - Dependencies 설치: 30초
  - 빌드: 10초
  - 배포: 20초

---

## 🧪 테스트 방법

### 로컬 테스트 (배포 전)
```bash
cd moducon-frontend
npm run build
ls -la out/  # 빌드 결과물 확인
```

### GitHub Actions 테스트
1. 워크플로우 파일 커밋 및 push
```bash
git add .github/workflows/deploy.yml
git commit -m "chore: GitHub Actions 워크플로우 업데이트"
git push origin main
```

2. GitHub → Actions 탭에서 워크플로우 실행 확인
3. 배포 성공 시 `https://moducon.vibemakers.kr` 접속 확인

---

## 🚀 GitHub Pages 활성화

### 설정 필요 사항
1. **GitHub Repository → Settings → Pages**
2. **Source**: "Deploy from a branch" 선택
3. **Branch**: `gh-pages` 선택 (워크플로우가 자동 생성)
4. **Custom domain**: `moducon.vibemakers.kr` 입력
5. **Enforce HTTPS**: 체크 ✅

---

## 🌐 DNS 설정 (도메인 관리자 작업)

### 필요한 DNS 레코드
| 타입 | 호스트 | 값 | TTL |
|-----|--------|-----|-----|
| `CNAME` | `moducon` | `<username>.github.io.` | 3600 |

**예시** (GitHub 사용자명이 `vibemakers`인 경우):
```
CNAME  moducon  vibemakers.github.io.  3600
```

### 검증 방법
```bash
dig moducon.vibemakers.kr +short
# 출력: <username>.github.io.
```

---

## ⚠️ 주의사항

### 1. 환경 변수 우선순위
- **빌드 시**: GitHub Secrets 사용 (`API_URL`, `WS_URL`)
- **로컬 개발**: `.env.local` 사용 (localhost:3001)
- **프로덕션 확인**: `_next/static/chunks/` 번들에 하드코딩되므로 주의

### 2. 빌드 실패 시 체크리스트
- [ ] `package-lock.json` 최신 상태 확인
- [ ] Node.js 버전 호환성 (20 이상)
- [ ] `npm run build` 로컬에서 성공 확인
- [ ] GitHub Secrets 올바르게 설정되었는지 확인

### 3. 배포 실패 시 체크리스트
- [ ] GitHub Pages 활성화 확인
- [ ] `gh-pages` 브랜치 생성 확인
- [ ] `GITHUB_TOKEN` 권한 확인 (자동 제공)
- [ ] `publish_dir` 경로 올바른지 확인 (`./moducon-frontend/out`)

---

## 📊 배포 상태 확인

### GitHub Actions 로그
```
https://github.com/<username>/<repo>/actions
```

### 배포된 사이트
```
https://moducon.vibemakers.kr
```

### GitHub Pages 브랜치
```bash
git fetch origin gh-pages
git log origin/gh-pages --oneline -5
```

---

## 🎯 다음 단계

### 즉시 진행 필요
1. ✅ GitHub Secrets 설정 (`API_URL`, `WS_URL`)
2. ✅ GitHub Pages 활성화
3. ✅ DNS 레코드 추가 (도메인 관리자)
4. ✅ 워크플로우 테스트 (커밋 → 배포 확인)

### 백엔드 준비 필요
- [ ] 백엔드 API 서버 배포 (`api.moducon.vibemakers.kr`)
- [ ] CORS 설정 (프론트엔드 도메인 허용)
- [ ] SSL/TLS 인증서 (Let's Encrypt)

---

## 📝 체크리스트

### 배포 준비 완료
- [x] GitHub Actions 워크플로우 파일 작성
- [ ] GitHub Secrets 설정 (DevOps 담당)
- [ ] GitHub Pages 활성화 (DevOps 담당)
- [ ] DNS 레코드 설정 (도메인 관리자)
- [ ] 백엔드 API 서버 배포 (백엔드 개발자)
- [ ] CORS 설정 (백엔드 개발자)

---

**작성자**: hands-on worker
**최종 업데이트**: 2025-01-14
