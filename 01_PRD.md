# 모두콘 2025 디지털 컨퍼런스 북 - Product Requirements Document (PRD)

## 📋 Document Information

**Version:** 1.6
**Last Updated:** 2025-11-28
**Author:** Moducon 2025 Planning Team
**Status:** Mobile PWA Complete - Deployment Ready

### Version History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-11 | Planning Team | 초기 PRD 작성 |
| 1.4 | 2025-11-28 | Technical Lead | 서명 기능 100% 완료, 관리자 UI 개선 완료 |
| 1.5 | 2025-11-28 | Technical Lead | 모바일 PWA 개발 시작, Google Sheets 연동 준비 |
| 1.6 | 2025-11-28 | Technical Lead | 모바일 PWA 개발 완료 (부스/포스터 기능, Google Sheets 연동) |

**Project Name:** 모두콘 2025 디지털 컨퍼런스 북
**Project Type:** Progressive Web App (PWA)
**Target Launch:** 2025년 12월 13일 (토)
**Expected Users:** 500~1,500명

---

## 🎯 Executive Summary

### Product Vision
"세션을 스킵할 만큼 꿀잼인 부스, 어떻게 만들 것인가?"

모두콘 2025는 **개인화된 퀘스트 기반 컨퍼런스 경험**을 제공하는 디지털 컨퍼런스 북을 통해, 참가자가 수동적인 관람자가 아닌 **능동적인 탐험가**가 되도록 합니다.

### Unique Value Proposition (UVP)
참가자의 **관심 분야에 맞춰 개인화된 '단계형 퀘스트'**를 제공하고, 게임처럼 LAB 부스와 페이퍼샵을 방문하며 'AI 데모'와 '최신 연구'를 경험하게 합니다.

### Unique Selling Proposition (USP)
**"상업적 굿즈 대신, 현업 개발자(LAB)의 '순수 AI 데모'를 '게임 퀘스트'로 경험하고, 그 '앱 소스코드'를 보상으로 받아 가는 유일한 컨퍼런스"**

### Success Criteria
- 참가자 앱 사용률 **80% 이상**
- 퀘스트 완료율 **60% 이상**
- 부스 방문 증가율 **전년 대비 40% 이상**
- 참가자 만족도 **4.5/5.0 이상**
- 앱 소스코드 GitHub 스타 **100개 이상** (행사 후 1개월)

---

## 📖 Product Overview

### Background
기존 오프라인 컨퍼런스의 문제점:
- 어디에 무슨 부스가 있는지 모름
- 어떤 부스가 나에게 유용한지 발견 어려움
- 한정된 시간에 방문 우선순위 설정 곤란
- 종이 안내서는 휴대 불편하고 정보 업데이트 불가능

### Solution
웹 기반 PWA로 구현된 개인화 컨퍼런스 북:
- 📱 **설치 불필요**: 웹 브라우저에서 즉시 접근
- 🎮 **게임화**: 퀘스트 시스템으로 재미있게 참여
- 🎯 **개인화**: 관심사 기반 추천 및 동선 안내
- 📊 **실시간**: 혼잡도, 일정 변경 등 즉시 반영
- 🏆 **보상**: 활동에 따른 디지털/실물 보상

### Core Value
1. **Discovery**: 나에게 맞는 컨텐츠 발견
2. **Navigation**: 효율적인 동선 안내
3. **Engagement**: 게임화를 통한 몰입
4. **Connection**: 참가자 간 네트워킹
5. **Record**: 나의 컨퍼런스 여정 기록

---

## 👥 Target Users & Personas

### Primary Target
AI/SW 기술 트렌드에 관심 있고, **기술을 활용한 효율적인 운영 방식** 자체에 호기심이 많은 재직자 및 학생

### User Personas

#### Persona 1: "탐험가 지수" (25세, 주니어 개발자)
- **목표**: 최신 AI 기술 트렌드 파악, 네트워킹
- **Pain Points**: 시간이 부족해서 모든 세션/부스 방문 불가능
- **Needs**: 효율적인 동선, 우선순위 추천, 빠른 정보 접근
- **Tech Savviness**: ⭐⭐⭐⭐⭐

#### Persona 2: "연구자 민지" (28세, 대학원생)
- **목표**: 논문 아이디어 수집, 최신 연구 동향 파악
- **Pain Points**: 페이퍼샵 포스터가 너무 많아서 선택 어려움
- **Needs**: 관심 분야 논문 필터링, 저자와의 Q&A 기회
- **Tech Savviness**: ⭐⭐⭐⭐

#### Persona 3: "매니저 현우" (35세, 팀 리드)
- **목표**: 팀에 도입할 기술 스택 검토, 벤치마킹
- **Pain Points**: 상업적 홍보만 있는 부스는 관심 없음
- **Needs**: 실제 동작하는 데모, 기술 상세 자료
- **Tech Savviness**: ⭐⭐⭐⭐

#### Persona 4: "초보자 서연" (22세, 대학생)
- **목표**: 개발자 커뮤니티 경험, 진로 탐색
- **Pain Points**: 전문 용어 많고, 어디서부터 봐야 할지 모름
- **Needs**: 친절한 가이드, 초보자 친화적 컨텐츠 표시
- **Tech Savviness**: ⭐⭐⭐

---

## 🎯 Problems & Goals

### Problems to Solve

| Problem | Current Pain | Our Solution |
|---------|--------------|--------------|
| **위치 혼란** | 행사장 지도가 복잡하고 찾기 어려움 | 실시간 네비게이션 + 현재 위치 기반 안내 |
| **컨텐츠 발견** | 어떤 부스/세션이 나에게 맞는지 모름 | AI 기반 개인화 추천 + 퀘스트 시스템 |
| **시간 낭비** | 가보니 만석이거나 대기 줄이 김 | 실시간 혼잡도 표시 + 예상 대기시간 |
| **정보 과부하** | 너무 많은 선택지에 압도됨 | 관심사 기반 필터링 + 단계별 퀘스트 |
| **경험 기록** | 무엇을 봤는지 나중에 기억 안 남 | 자동 활동 기록 + 타임라인 생성 |
| **네트워킹 어려움** | 누구에게 말을 걸어야 할지 모름 | 프로필 공유 + 관심사 매칭 |

### Product Goals

#### Primary Goals
1. **참가자 만족도 극대화**: 개인화된 경험으로 만족도 4.5/5.0 이상
2. **부스 방문률 증가**: 전년 대비 40% 이상 부스 방문 증가
3. **기술 쇼케이스**: 오픈소스로 공개하여 커뮤니티 기여

#### Secondary Goals
1. 참가자 간 네트워킹 촉진
2. 데이터 기반 행사 운영 개선
3. 브랜드 차별화 (기술 중심 컨퍼런스 이미지)

#### Business Goals
1. 참가자 재방문율 향상
2. 스폰서/부스 참가사 만족도 증대
3. 모두콘 브랜드 가치 상승

---

## ✨ Feature Requirements

### 1. 사용자 인증 & 등록 (P0 - Must Have)

#### 1.1 현장 QR 접속
- **요구사항**: 모든 참가자는 현장 QR 코드 스캔으로 앱 접속 시작
- **Process**:
  1. 현장에 배치된 QR 코드 스캔 (일반 카메라 사용)
  2. 앱 접속 URL로 자동 리다이렉트
  3. 로그인 화면으로 이동
- **QR 코드 위치**: 등록 데스크, 행사장 입구, 주요 안내 지점
- **기술**: URL 기반 QR 코드 (앱 설치 불필요)

#### 1.2 사전 신청자 인증
- **요구사항**: QR 접속 후 이름과 전화번호로 사전 신청자 인증 (필수)
- **Input**: 이름, 전화번호 뒷 4자리
- **Output**: 세션 토큰 발급
- **Validation**:
  - 사전 등록 DB와 매칭 확인 (필수)
  - 전화번호 뒷 4자리 일치 여부
  - 중복 로그인 방지
- **매칭 실패 시**: "사전 신청 정보를 찾을 수 없습니다" 안내 + 현장 등록 데스크 안내

#### 1.3 디지털 서명 ✅ **완료 (2025-11-22)**
- **요구사항**: 최초 인증 성공 후 개인정보 동의 및 서명 ✅
- **UI**: Canvas 기반 서명 패드 (react-signature-canvas) ✅
- **저장**: Base64 인코딩하여 서버 저장 (`signatures` 테이블 + `users.signatureUrl`) ✅
- **용도**: 법적 동의 증빙, 출입증 생성 ✅
- **구현 완료일**: 2025-11-22
- **테스트**: 16명 시딩 데이터 검증 완료, QA 점수 97/100 ✅
- **백엔드 최종 점수**: 96/100 (A+ 등급, High Priority 보안/성능 개선 완료) ✅
- **관련 문서**: 78_HIGH_PRIORITY_FIXES.md, 79_WORKER_HANDOFF.md, 80_FINAL_APPROVAL.md

#### 1.4 출입증 (Digital Badge)
- **디자인**:
  - 참가자 이름
  - 고유 QR 코드 (참가자 ID)
  - 모두콘 2025 로고
  - 참가 유형 (일반/VIP/스태프 등)
- **기능**:
  - 세션장 입장 시 스캔
  - 부스 방문 인증
  - 오프라인 접근 가능 (PWA 캐싱)

### 2. 개인화 퀘스트 시스템 (P0 - Must Have)

#### 2.1 관심 분야 선택
- **타이밍**: 최초 로그인 후 온보딩
- **선택지**:
  - 생성 AI
  - 컴퓨터 비전
  - NLP/LLM
  - 로보틱스
  - MLOps
  - 데이터 엔지니어링
  - AI 윤리/정책
  - 기타 (직접 입력)
- **다중 선택**: 최대 3개
- **수정 가능**: 설정에서 언제든 변경

#### 2.2 퀘스트 맵 생성
- **알고리즘**:
  ```
  Input: 사용자 관심사 [A, B, C]
  Process:
    1. 관심사별 관련도 스코어링 (LAB 부스, 페이퍼샵)
    2. 혼잡도 예측 반영
    3. 동선 최적화 (시작점 → 종료점)
    4. 예상 소요 시간 계산
  Output: 개인화 퀘스트 리스트 (3~5개 LAB + 1~2개 페이퍼샵)
  ```
- **UI**:
  - 지도 위 퀘스트 마커 표시
  - 순서 번호 및 추천 이동 경로
  - 예상 소요 시간 표시

#### 2.3 퀘스트 인증
- **LAB 부스 인증**:
  - 부스별 고유 QR 코드 스캔
  - 또는 NFC 태그
  - 인증 후 체크 마크 표시
- **페이퍼샵 인증**:
  - 포스터별 QR 코드 스캔
  - 저자 출제 퀴즈 풀이 (선택형 3~5문제)
  - 정답 시 인증 완료

#### 2.4 히든 퀘스트
- **배치**: 행사장 곳곳 (포토존, 휴게실, 식음료 존 등)
- **발견**: QR 코드 스캔 또는 특정 위치 방문
- **보상**: 특별 배지, 추첨 응모권

#### 2.5 진행 상황 추적
- **UI**:
  - 프로그레스 바 (완료율 %)
  - 체크리스트 형태
  - 타임라인 뷰
- **알림**:
  - 다음 퀘스트 추천
  - 근처 퀘스트 알림 (Geolocation)
  - 마감 임박 경고

### 3. 세션 & 공간 관리 (P0 - Must Have)

#### 3.1 세션 타임테이블
- **정보 표시**:
  - 6개 트랙별 세션 목록
  - 시간, 장소, 연사, 제목, 설명
  - 난이도 표시 (입문/중급/고급)
  - 태그 (AI, ML, Web, Mobile 등)
- **필터링**:
  - 트랙별 필터
  - 시간대별 필터
  - 관심사 기반 추천 세션 강조
- **즐겨찾기**:
  - 관심 세션 북마크
  - 내 일정에 추가

#### 3.2 세션 체크인/체크아웃
- **체크인**:
  - 세션장 입구 QR 코드 스캔
  - 입장 시간 기록
  - 좌석 안내 (선택 사항)
- **체크아웃**:
  - 퇴장 시 QR 스캔 (선택)
  - 또는 자동 체크아웃 (세션 종료 후 30분)
- **데이터 활용**:
  - 실제 참석 세션 기록
  - 세션별 체류 시간
  - 후속 이벤트 참여 자격 증빙

#### 3.3 실시간 혼잡도 표시
- **대상**:
  - 6개 세션 트랙
  - LAB 부스 구역
  - 페이퍼샵
  - 식음료존, 휴게실
- **혼잡도 레벨**:
  - 🟢 여유 (0~30%)
  - 🟡 보통 (30~60%)
  - 🟠 혼잡 (60~90%)
  - 🔴 만석 (90~100%)
- **데이터 수집**:
  - 체크인 데이터 집계
  - 실시간 업데이트 (30초 간격)
- **예상 대기 시간**: 혼잡한 부스의 평균 대기 시간 표시

#### 3.4 공간 정보
- **실내 지도**:
  - 벡터 기반 인터랙티브 맵
  - 줌 인/아웃
  - 현재 위치 표시 (Geolocation API)
- **POI (Point of Interest)**:
  - 세션장 (Track 1~6)
  - LAB 부스
  - 페이퍼샵
  - 등록 데스크
  - 화장실, 식음료존, 포토존
  - 비상구

### 4. 부스 & 페이퍼샵 (P0 - Must Have) ✅ **완료 (2025-11-28)**

#### 4.1 LAB 부스 정보 ✅ **완료**
- **표시 항목**: ✅
  - 부스 이름
  - 운영 팀/회사
  - 데모 내용 소개 (텍스트 + 이미지/영상)
  - 주요 기술 태그
  - 위치 (지도 연동)
  - 예상 체험 시간
  - 현재 혼잡도
- **필터/검색**: ✅
  - 타입별 필터 (기업/LAB/교육사업팀/테크포임팩트)
  - 키워드 검색
  - 거리순 정렬
  - 혼잡도순 정렬
- **구현 완료일**: 2025-11-28
- **실제 데이터**: 13개 부스 (Google Sheets 연동)
- **기술 스택**: Next.js, Google Sheets MCP, shadcn/ui

#### 4.2 부스 방문 기록 ✅ **완료**
- **인증 방법**: QR 스캔 (후방 카메라 `facingMode: 'environment'`)
- **기록 정보**:
  - 방문 시간
  - 방문 부스 목록
  - 퀘스트 연동 여부
- **활용**:
  - 내 활동 타임라인
  - 후속 연락/자료 제공
  - 이벤트 참여 자격
- **구현 완료일**: 2025-11-28
- **QR 스캔**: html5-qrcode 라이브러리, 부스 이름 인식 후 자동 라우팅

#### 4.3 페이퍼샵 (포스터 세션) ✅ **완료**
- **포스터 정보**: ✅
  - 논문 제목
  - 저자 및 소속
  - 초록 (Abstract)
  - 학회 및 연도 (CVPR, ICCV, ACL, EMNLP, NeurIPS 등)
  - 발표 시간 및 장소
  - PDF 링크 (논문 원문)
- **필터/검색**: ✅
  - 학회별 필터 (CVPR, ICCV, ACL, EMNLP 등)
  - 발표시간별 필터
  - 키워드 검색
- **구현 완료일**: 2025-11-28
- **실제 데이터**: 33개 포스터 (Google Sheets 연동)
- **통계 표시**: 학회별/시간대별 포스터 수
  - 키워드/태그
  - 저자 사진 (있는 경우)
  - Q&A 가능 시간
- **필터링**:
  - 연구 분야별
  - 키워드 검색
- **퀴즈 시스템**:
  - 포스터별 QR 코드
  - 3~5문제 객관식 퀴즈
  - 즉시 정답 확인
  - 정답 시 포인트/인증

### 5. 네트워킹 & 프로필 (P1 - Should Have)

#### 5.1 내 프로필 설정
- **기본 정보**:
  - 이름 (필수)
  - 소속 (선택)
  - 직무/역할 (선택)
  - 관심 분야
- **소개**:
  - 한 줄 소개
  - 관심 키워드 (태그)
- **연락처**:
  - 이메일 (선택)
  - GitHub, LinkedIn 등 SNS (선택)
  - 공개/비공개 설정

#### 5.2 프로필 공유
- **방법**:
  - QR 코드 생성 (내 프로필)
  - 다른 참가자 QR 스캔하여 추가
  - 또는 NFC 태그 (지원 디바이스)
- **교환 기록**:
  - 교환한 참가자 목록
  - 교환 시간/장소 기록
- **후속 연락**:
  - 앱 내 메시지 (선택 사항)
  - 또는 이메일/SNS로 연락

#### 5.3 관심사 매칭
- **추천**:
  - 비슷한 관심사 참가자 제안
  - 같은 세션 참석한 사람
  - 같은 퀘스트 진행 중인 사람
- **UI**: "근처의 비슷한 관심사 참가자" 알림 (선택 사항)

### 6. 활동 기록 & 보상 (P1 - Should Have)

#### 6.1 내 활동 타임라인
- **기록 항목**:
  - 참석한 세션
  - 방문한 부스
  - 완료한 퀘스트
  - 교환한 프로필
  - 획득한 배지
- **UI**:
  - 시간순 타임라인
  - 통계 대시보드 (방문 수, 완료율 등)
  - 공유 기능 (SNS)

#### 6.2 포인트 & 배지 시스템
- **포인트 획득**:
  - 세션 체크인: 10pt
  - 부스 방문: 15pt
  - 퀘스트 완료: 50pt
  - 페이퍼샵 퀴즈 정답: 20pt
  - 히든 퀘스트: 30pt
  - 프로필 교환: 5pt
- **배지 종류**:
  - 🏅 퀘스트 마스터 (전체 퀘스트 완료)
  - 🎓 페이퍼 러버 (페이퍼샵 5개 이상)
  - 🤝 네트워커 (프로필 10개 이상 교환)
  - 🕵️ 히든 헌터 (히든 퀘스트 3개 이상)
  - ⭐ 얼리버드 (첫 세션 체크인)

#### 6.3 보상 수령
- **퀘스트 완료 보상**:
  - 🎖️ 10주년 기념 특별 배지 (실물)
  - 📜 공식 완료 인증서 (디지털)
  - 💻 앱 소스코드 GitHub 링크 (행사 후)
- **수령 방법**:
  - 중앙 운영 부스 방문
  - 앱에서 완료 QR 코드 제시
  - 실물 배지 즉시 지급
  - 인증서는 앱에서 PDF 다운로드
- **추가 이벤트**:
  - 고득점자 추첨 (경품 추가)
  - SNS 인증 이벤트

### 7. 알림 & 푸시 (P1 - Should Have)

#### 7.1 알림 유형
- **세션 알림**:
  - 즐겨찾기 세션 시작 10분 전
  - 세션 장소 변경
- **퀘스트 알림**:
  - 근처 퀘스트 위치 접근 시
  - 다음 추천 퀘스트
- **혼잡도 알림**:
  - 관심 부스 혼잡도 낮아짐
- **이벤트 알림**:
  - 히든 퀘스트 힌트
  - 특별 이벤트 공지

#### 7.2 알림 설정
- 알림 ON/OFF 토글
- 알림 유형별 세부 설정
- 진동/소리 설정

### 8. 콘텐츠 미리보기 (P2 - Nice to Have)

#### 8.1 세션 자료
- 연사 슬라이드 (PDF, 사전 업로드 시)
- 세션 녹화 영상 (행사 후)

#### 8.2 부스 미리보기
- 데모 영상
- 기술 소개 PDF

#### 8.3 포스터 원문
- 논문 PDF 링크
- 추가 자료 링크

### 9. 포토존 & 공유 (P2 - Nice to Have)

#### 9.1 포토존 위치 안내
- 행사장 내 포토존 위치 표시
- 포토존 테마 소개

#### 9.2 SNS 공유
- 내 활동 타임라인 이미지 생성
- 완료 인증서 이미지 생성
- "모두콘 2025 참가 중" 스티커/프레임

### 10. 관리자 기능 (P0 - Must Have)

#### 10.1 콘텐츠 관리
- 세션 정보 등록/수정
- 부스 정보 등록/수정
- 포스터 정보 등록/수정
- 공지사항 등록

#### 10.2 모니터링 ✅ **UI 개선 완료 (2025-11-22)**
- 실시간 체크인 현황 ✅
- 공간별 혼잡도 대시보드 (백엔드 API 대기)
- 퀘스트 진행률 통계 (백엔드 API 대기)
- 에러 로그 모니터링 ✅
- **참가자 관리 대시보드 UI 개선** ✅
  - 메인 탭: 이름, 전화번호 뒷자리, 서명 이미지 표시 (간소화)
  - 상세 탭: 최근 로그인, 등록일시, 상세보기 버튼
  - shadcn/ui Tabs 컴포넌트 적용
  - 서명 이미지 테이블 내 직접 표시 (max-width: 220px)
  - WCAG 2.1 AA 접근성 준수
- **구현 완료일**: 2025-11-22
- **QA 점수**: 100/100 (S등급)
- **관련 문서**: 66_UI_IMPROVEMENT_PLAN.md, 67_UI_IMPROVEMENT_IMPLEMENTATION.md, 68_FINAL_UI_QA_REPORT.md

#### 10.3 참가자 관리
- 사전 신청자 DB 업로드
- 현장 등록자 승인
- 참가자 활동 기록 조회

---

## 📱 User Stories & Use Cases

### Epic 1: 참가자 온보딩

**US-001**: 현장 QR 스캔 접속
**As a** 참가자
**I want to** 현장에 배치된 QR 코드를 스캔하여 앱에 접속
**So that** 빠르게 행사 앱을 시작할 수 있다

**Acceptance Criteria**:
- [ ] 현장 QR 코드 스캔 (일반 카메라 사용)
- [ ] 앱 URL로 자동 리다이렉트
- [ ] 로그인 화면으로 자동 이동
- [ ] QR 스캔 실패 시 수동 URL 입력 옵션 제공

**US-002**: 사전 신청자 인증
**As a** 사전 신청자
**I want to** 이름과 전화번호 뒷 4자리로 인증
**So that** 사전 신청 정보로 빠르게 로그인하고 출입증을 받을 수 있다

**Acceptance Criteria**:
- [ ] 이름 입력 필드 제공
- [ ] 전화번호 뒷 4자리 입력 필드 (숫자만)
- [ ] 사전 신청 DB와 매칭 확인 (필수)
- [ ] 매칭 실패 시 명확한 오류 메시지 + 현장 등록 데스크 안내
- [ ] 매칭 성공 시 서명 패드 화면으로 이동
- [ ] 서명 완료 후 출입증 자동 발급

### Epic 2: 개인화 퀘스트

**US-003**: 관심 분야 선택
**As a** 참가자
**I want to** 내 관심 분야를 선택
**So that** 나에게 맞는 퀘스트를 추천받을 수 있다

**Acceptance Criteria**:
- [ ] 8개 관심 분야 선택지 제공
- [ ] 최대 3개 다중 선택 가능
- [ ] 선택 완료 시 퀘스트 맵 자동 생성
- [ ] 설정에서 언제든 수정 가능

**US-004**: 퀘스트 완료
**As a** 참가자
**I want to** LAB 부스에서 QR을 스캔하여 퀘스트 인증
**So that** 단계별로 퀘스트를 완료하고 보상을 받을 수 있다

**Acceptance Criteria**:
- [ ] 퀘스트 리스트 UI (순서 번호, 위치, 상태)
- [ ] QR 스캔 기능
- [ ] 인증 즉시 체크 마크 표시
- [ ] 다음 퀘스트 자동 안내
- [ ] 전체 완료 시 축하 애니메이션 + 보상 안내

### Epic 3: 세션 관리

**US-005**: 세션 체크인
**As a** 참가자
**I want to** 세션장 입구에서 QR을 스캔
**So that** 내가 참석한 세션을 기록할 수 있다

**Acceptance Criteria**:
- [ ] 세션장별 고유 QR 코드
- [ ] 스캔 즉시 체크인 완료 메시지
- [ ] 내 일정에 자동 기록
- [ ] 중복 체크인 방지
- [ ] 포인트 적립

**US-006**: 실시간 혼잡도 확인
**As a** 참가자
**I want to** 각 세션/부스의 혼잡도를 실시간으로 확인
**So that** 대기 시간이 짧은 곳을 먼저 방문할 수 있다

**Acceptance Criteria**:
- [ ] 세션/부스 목록에 혼잡도 아이콘 표시
- [ ] 4단계 색상 구분 (녹색/노란색/주황색/빨간색)
- [ ] 30초마다 자동 갱신
- [ ] 만석 시 "대기 필요" 표시

### Epic 4: 네트워킹

**US-007**: 프로필 공유
**As a** 참가자
**I want to** 내 프로필 QR 코드를 다른 참가자에게 보여주고, 상대방 QR을 스캔
**So that** 쉽게 연락처를 교환하고 나중에 연락할 수 있다

**Acceptance Criteria**:
- [ ] 내 프로필 QR 코드 생성
- [ ] 타인 QR 스캔 기능
- [ ] 교환한 프로필 목록 저장
- [ ] 프로필 상세 보기 (연락처, 관심사)
- [ ] 공개 범위 설정 (이메일 숨김 등)

### Epic 5: 보상

**US-008**: 보상 수령
**As a** 퀘스트 완료자
**I want to** 중앙 운영 부스에서 완료 QR을 제시
**So that** 실물 배지와 디지털 인증서를 받을 수 있다

**Acceptance Criteria**:
- [ ] 퀘스트 100% 완료 시 보상 QR 생성
- [ ] QR 코드에 참가자 ID + 완료 서명 포함
- [ ] 운영 부스에서 QR 스캔 → 검증
- [ ] 실물 배지 지급 후 앱에서 수령 완료 표시
- [ ] 인증서 PDF 다운로드 버튼 활성화

---

## 🛠️ Technical Requirements

### 1. Architecture

#### Tech Stack

**Frontend (GitHub Pages)**
- **Framework**: Next.js 14+ (Static Export Mode)
- **UI Framework**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand 또는 React Context
- **Form Handling**: React Hook Form + Zod
- **Build**: Static HTML/CSS/JS Generation
- **Deployment**: GitHub Pages (CDN)

**Backend (기존 서버)**
- **API**: REST API (기존 백엔드 서버)
- **Database**: PostgreSQL (기존 서버)
- **Auth**: JWT 기반 인증 (기존 서버)
- **Realtime**: WebSocket 또는 Server-Sent Events (기존 서버)
- **Storage**: 파일 저장소 (기존 서버)

#### Architecture Pattern
```
┌─────────────────────────────────────────────────┐
│              Client (Browser)                   │
│  ┌─────────────────────────────────────────┐   │
│  │   Next.js Static Site (GitHub Pages)    │   │
│  │  - PWA (Service Worker)                 │   │
│  │  - Offline Mode (IndexedDB)             │   │
│  │  - Geolocation API                      │   │
│  │  - QR Scanner (html5-qrcode)            │   │
│  │  - React 18+ (CSR)                      │   │
│  └─────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────┘
                  │
                  │ Static Assets (CDN)
                  ├─→ GitHub Pages CDN
                  │   - HTML, CSS, JS
                  │   - Images, Fonts
                  │   - Service Worker
                  │
                  │ API Calls (HTTPS / WSS)
                  ├─→ CORS 허용 필요
                  ↓
┌─────────────────────────────────────────────────┐
│          Backend Server (기존 서버)             │
│  ┌─────────────────────────────────────────┐   │
│  │         REST API Endpoints              │   │
│  │  - POST /api/auth/login                 │   │
│  │  - POST /api/auth/signature             │   │
│  │  - GET  /api/quests/my                  │   │
│  │  - POST /api/sessions/:id/checkin       │   │
│  │  - POST /api/booths/:id/visit           │   │
│  │  - GET  /api/congestion/realtime        │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │     PostgreSQL Database                 │   │
│  │  - Users, Sessions, Checkins            │   │
│  │  - Quests, Booths, Papers               │   │
│  │  - Activities, Badges, Points           │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │     WebSocket Server                    │   │
│  │  - Realtime Congestion Updates          │   │
│  │  - Push Notifications                   │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │     File Storage                        │   │
│  │  - Digital Signatures (Base64)          │   │
│  │  - Profile Images                       │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 2. Database Schema

#### Core Tables

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone_last4 VARCHAR(4) NOT NULL,
  email VARCHAR(255),
  organization VARCHAR(255),
  role VARCHAR(100),
  interests TEXT[], -- Array of interest tags
  signature_url TEXT, -- Base64 or S3 URL
  registration_type VARCHAR(20), -- 'pre_registered' | 'onsite'
  registered_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT unique_user UNIQUE(name, phone_last4)
);
```

**sessions_tracks**
```sql
CREATE TABLE sessions_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_number INT NOT NULL, -- 1~6
  title VARCHAR(255) NOT NULL,
  speaker VARCHAR(100),
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(100),
  difficulty VARCHAR(20), -- 'beginner' | 'intermediate' | 'advanced'
  tags TEXT[],
  max_capacity INT,
  qr_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**checkins**
```sql
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES sessions_tracks(id),
  checked_in_at TIMESTAMP DEFAULT NOW(),
  checked_out_at TIMESTAMP,
  duration_minutes INT GENERATED ALWAYS AS
    (EXTRACT(EPOCH FROM (checked_out_at - checked_in_at)) / 60) STORED,
  CONSTRAINT unique_checkin UNIQUE(user_id, session_id)
);
```

**booths**
```sql
CREATE TABLE booths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  description TEXT,
  demo_description TEXT,
  tech_tags TEXT[],
  location_x FLOAT, -- Map coordinates
  location_y FLOAT,
  estimated_duration_minutes INT,
  qr_code TEXT UNIQUE,
  image_url TEXT,
  video_url TEXT,
  booth_type VARCHAR(20), -- 'lab' | 'sponsor' | 'community'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**booth_visits**
```sql
CREATE TABLE booth_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  booth_id UUID REFERENCES booths(id),
  visited_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_visit UNIQUE(user_id, booth_id)
);
```

**papers**
```sql
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  authors TEXT[],
  organization VARCHAR(255),
  abstract TEXT,
  keywords TEXT[],
  pdf_url TEXT,
  poster_image_url TEXT,
  qr_code TEXT UNIQUE,
  qa_available_time TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**paper_quizzes**
```sql
CREATE TABLE paper_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- [{"text": "...", "isCorrect": true}]
  explanation TEXT,
  order_index INT
);
```

**quiz_attempts**
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  paper_id UUID REFERENCES papers(id),
  score INT, -- Number of correct answers
  total_questions INT,
  completed_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_attempt UNIQUE(user_id, paper_id)
);
```

**quests**
```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  quest_type VARCHAR(20), -- 'main' | 'hidden'
  target_type VARCHAR(20), -- 'booth' | 'paper' | 'location'
  target_id UUID, -- Foreign key to booths/papers
  order_index INT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**activities**
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  activity_type VARCHAR(50), -- 'session_checkin' | 'booth_visit' | 'quest_complete' | 'profile_exchange'
  activity_data JSONB, -- Flexible data storage
  points_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**badges**
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB, -- Conditions to earn the badge
  created_at TIMESTAMP DEFAULT NOW()
);
```

**user_badges**
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_badge UNIQUE(user_id, badge_id)
);
```

**profile_exchanges**
```sql
CREATE TABLE profile_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  exchanged_with_user_id UUID REFERENCES users(id),
  exchanged_at TIMESTAMP DEFAULT NOW(),
  location VARCHAR(100),
  CONSTRAINT unique_exchange UNIQUE(user_id, exchanged_with_user_id)
);
```

**congestion_logs**
```sql
CREATE TABLE congestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_type VARCHAR(20), -- 'session' | 'booth' | 'papershop' | 'foodzone'
  space_id UUID, -- Foreign key to sessions_tracks/booths/etc
  current_count INT,
  max_capacity INT,
  congestion_level VARCHAR(20), -- 'low' | 'medium' | 'high' | 'full'
  logged_at TIMESTAMP DEFAULT NOW()
);
```

**rewards**
```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  reward_type VARCHAR(50), -- 'badge_physical' | 'certificate' | 'sourcecode'
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. API Endpoints

**주의**: 모든 API 엔드포인트는 **기존 백엔드 서버**에서 구현됩니다.
프론트엔드(GitHub Pages)에서는 `BACKEND_API_URL` 환경 변수로 호출합니다.

```javascript
// 예시: 프론트엔드 API 호출
const API_BASE = process.env.NEXT_PUBLIC_API_URL; // https://api.moducon.com
const response = await fetch(`${API_BASE}/api/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // 인증 필요 시
  },
  body: JSON.stringify({ name, phone_last4 })
});
```

#### Authentication
- `POST /api/auth/login` - 사전 신청자 인증 (이름 + 전화번호 뒷 4자리)
  - Request: `{ name: string, phone_last4: string }`
  - Response: `{ success: boolean, token?: string, message?: string }`
  - Validation: 사전 신청 DB 매칭 필수
  - CORS: GitHub Pages 도메인 허용 필요
- `POST /api/auth/signature` - 디지털 서명 저장
  - Request: `{ userId: string, signatureData: string (base64) }`
  - Response: `{ success: boolean, badgeUrl?: string }`
  - Headers: `Authorization: Bearer <token>` 필수
- `GET /api/auth/me` - 현재 사용자 정보
  - Headers: `Authorization: Bearer <token>` 필수
- `POST /api/auth/logout` - 로그아웃
  - Headers: `Authorization: Bearer <token>` 필수

#### User Profile
- `GET /api/user/profile` - 내 프로필 조회
- `PATCH /api/user/profile` - 프로필 수정
- `GET /api/user/qr` - 내 프로필 QR 코드 생성
- `POST /api/user/interests` - 관심 분야 설정

#### Sessions
- `GET /api/sessions` - 전체 세션 목록 (필터링 가능)
- `GET /api/sessions/:id` - 특정 세션 상세
- `POST /api/sessions/:id/checkin` - 세션 체크인
- `POST /api/sessions/:id/checkout` - 세션 체크아웃
- `GET /api/sessions/my-schedule` - 내 참석 세션 목록

#### Booths
- `GET /api/booths` - 부스 목록 (필터링 가능)
- `GET /api/booths/:id` - 부스 상세
- `POST /api/booths/:id/visit` - 부스 방문 인증 (QR)
- `GET /api/booths/visited` - 내가 방문한 부스

#### Papers (페이퍼샵)
- `GET /api/papers` - 논문 목록 (필터링 가능)
- `GET /api/papers/:id` - 논문 상세
- `GET /api/papers/:id/quiz` - 논문 퀴즈
- `POST /api/papers/:id/quiz/submit` - 퀴즈 제출

#### Quests
- `POST /api/quests/generate` - 개인화 퀘스트 생성
- `GET /api/quests/my` - 내 퀘스트 목록
- `POST /api/quests/:id/complete` - 퀘스트 완료 인증
- `GET /api/quests/progress` - 퀘스트 진행 상황

#### Activities
- `GET /api/activities/timeline` - 내 활동 타임라인
- `GET /api/activities/stats` - 활동 통계
- `POST /api/activities/log` - 활동 기록 (내부용)

#### Badges & Rewards
- `GET /api/badges` - 배지 목록
- `GET /api/badges/my` - 내가 획득한 배지
- `POST /api/rewards/claim` - 보상 수령 (QR 검증)

#### Networking
- `POST /api/profile/exchange` - 프로필 교환 (QR 스캔)
- `GET /api/profile/exchanges` - 교환한 프로필 목록
- `GET /api/profile/:userId` - 타인 프로필 조회 (공개 범위 내)

#### Congestion
- `GET /api/congestion/realtime` - 실시간 혼잡도 (전체)
- `GET /api/congestion/:spaceType/:spaceId` - 특정 공간 혼잡도

#### Notifications
- `GET /api/notifications` - 알림 목록
- `PATCH /api/notifications/:id/read` - 알림 읽음 처리
- `PATCH /api/notifications/settings` - 알림 설정

#### Admin (관리자 전용)
- `POST /api/admin/sessions` - 세션 등록
- `PATCH /api/admin/sessions/:id` - 세션 수정
- `POST /api/admin/booths` - 부스 등록
- `POST /api/admin/papers` - 논문 등록
- `GET /api/admin/dashboard` - 통계 대시보드
- `POST /api/admin/users/import` - 사전 신청자 DB 일괄 등록

### 4. PWA Requirements

#### Service Worker
- **Offline Mode**: 기본 UI 및 캐시된 데이터 접근 가능
- **Background Sync**: 오프라인 시 작업 큐잉, 온라인 시 자동 동기화
- **Push Notifications**: 웹 푸시 알림 (선택적)

#### Caching Strategy
- **App Shell**: Static assets (HTML, CSS, JS) - Cache First
- **API Data**: Network First, Fallback to Cache
- **Images**: Cache First, Network Fallback
- **QR Codes**: Pre-cache critical QR codes

#### Installability
- `manifest.json` 설정:
  ```json
  {
    "name": "모두콘 2025",
    "short_name": "Moducon",
    "description": "모두의연구소 컨퍼런스 2025 디지털 가이드",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#000000",
    "icons": [
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
  ```

### 5. QR Code System

#### QR Code Structure
- **현장 접속 QR**: `https://moducon.vibemakers.kr` (현장 입구에 배치, 앱 접속 시작점)
  - 폴백 URL: `https://modulabs.github.io/moducon`
- **사용자 프로필**: `moducon://profile/{userId}`
- **세션 체크인**: `moducon://session/{sessionId}/checkin`
- **부스 방문**: `moducon://booth/{boothId}`
- **페이퍼샵 퀴즈**: `moducon://paper/{paperId}/quiz`
- **히든 퀘스트**: `moducon://hidden/{questId}`
- **보상 수령**: `moducon://reward/{userId}/{signature}`

#### QR Scanner
- Library: `html5-qrcode` 또는 `@zxing/browser`
- 카메라 권한 요청
- 스캔 성공 시 해당 URL 파싱 → API 호출

### 6. Geolocation

#### Usage
- 현재 위치 파악 (지도에 표시)
- 근처 퀘스트 알림
- 공간별 위치 기반 체크인 (선택 사항)

#### Accuracy
- HTML5 Geolocation API (`navigator.geolocation`)
- 정확도: 10~20m (실내 환경 고려)

#### Fallback
- GPS 비활성화 시 수동 위치 선택

### 7. Real-time Updates

#### WebSocket Connection
```javascript
// 프론트엔드: WebSocket 연결
const WS_URL = process.env.NEXT_PUBLIC_WS_URL; // wss://api.moducon.com
const ws = new WebSocket(WS_URL);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 혼잡도 업데이트, 알림 등 처리
};
```

#### WebSocket Events
- `congestion_update`: 혼잡도 변경
- `notification`: 푸시 알림
- `quest_update`: 퀘스트 상태 변경

#### Polling Fallback
- WebSocket 연결 실패 시 30초 간격 폴링

### 8. Performance Requirements

#### Target Metrics
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Time to Interactive**: < 3s
- **Bundle Size**: < 500KB (gzipped)

#### Optimization
- Code splitting (per route)
- Image optimization (WebP, lazy loading)
- Font optimization (preload, subset)
- API response caching
- Database indexing (users, sessions, checkins)

### 9. Next.js Static Export Configuration

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 정적 HTML로 빌드
  trailingSlash: true,  // URL에 trailing slash 추가
  images: {
    unoptimized: true,  // GitHub Pages는 이미지 최적화 불가
  },
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.moducon.com',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.moducon.com',
  },
  // 커스텀 도메인 사용 (moducon.vibemakers.kr)
  basePath: '',  // 루트 경로
  assetPrefix: '',  // 루트 경로

  // GitHub Pages 폴백 (필요 시 주석 해제)
  // basePath: '/moducon',
  // assetPrefix: '/moducon',
};

module.exports = nextConfig;
```

#### 커스텀 도메인 설정 (권장)

**도메인**: `moducon.vibemakers.kr`

**장점**:
- 짧고 기억하기 쉬운 URL (23자 vs 32자)
- QR 코드 단순화 → 스캔 성공률 향상
- 전문적인 브랜딩
- 향후 행사 재활용 가능

**DNS 설정** (vibemakers.kr 관리 페이지):
```
Type: A
Host: moducon
Values:
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
```

**CNAME 파일 생성**:
```bash
# public/CNAME 파일 생성 (필수)
echo "moducon.vibemakers.kr" > public/CNAME
```

**GitHub Pages 설정**:
1. Repository → Settings → Pages
2. Custom domain: `moducon.vibemakers.kr`
3. Enforce HTTPS ✅ (자동 SSL)

**백엔드 도메인 구성 (권장)**:
```
Frontend: https://moducon.vibemakers.kr (GitHub Pages)
Backend API: https://api.moducon.vibemakers.kr (기존 서버)
WebSocket: wss://ws.moducon.vibemakers.kr (기존 서버)
```

#### 빌드 & 배포 명령어
```bash
# 정적 빌드
npm run build

# 결과물: out/ 디렉토리에 생성됨
# out/
#   ├── index.html
#   ├── login.html
#   ├── _next/
#   └── ...

# GitHub Pages 배포
# 1. gh-pages 브랜치로 out/ 디렉토리 푸시
npm install -D gh-pages

# package.json에 추가
{
  "scripts": {
    "deploy": "next build && gh-pages -d out"
  }
}

# 배포 실행
npm run deploy
```

#### .gitignore 추가
```
# Next.js
/.next/
/out/
/build/

# 환경 변수
.env*.local
```

#### 환경 변수 설정
```bash
# .env.local (개발용)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# .env.production (프로덕션용 - 커스텀 도메인)
NEXT_PUBLIC_API_URL=https://api.moducon.vibemakers.kr
NEXT_PUBLIC_WS_URL=wss://ws.moducon.vibemakers.kr
```

### 10. Backend CORS Configuration

백엔드 서버에서 GitHub Pages 도메인 허용 필요:

```javascript
// Express.js 예시
const cors = require('cors');

app.use(cors({
  origin: [
    'https://moducon.vibemakers.kr',  // 커스텀 도메인 (프로덕션)
    'https://modulabs.github.io',     // GitHub Pages 폴백
    'http://localhost:3000',          // 로컬 개발
  ],
  credentials: true,  // 쿠키 전송 허용 (필요 시)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// WebSocket CORS (ws 라이브러리 예시)
const wss = new WebSocket.Server({
  server,
  verifyClient: (info) => {
    const origin = info.origin || info.req.headers.origin;
    const allowedOrigins = [
      'https://moducon.vibemakers.kr',
      'https://modulabs.github.io',
      'http://localhost:3000'
    ];
    return allowedOrigins.includes(origin);
  }
});
```

### 11. Security

#### Authentication
- JWT (Bearer Token in Authorization Header)
- LocalStorage 또는 SessionStorage에 토큰 저장
- Session timeout: 24시간
- Refresh token 고려

#### Data Protection
- HTTPS only (GitHub Pages 자동 제공)
- Input validation (Zod schemas)
- Backend: SQL injection prevention (Parameterized queries)
- Backend: XSS protection
- Frontend: Content Security Policy

#### Privacy
- 개인정보 처리방침 동의
- 선택적 정보 공개 (이메일, SNS)
- GDPR 고려 (데이터 삭제 요청 지원)

### 12. Monitoring & Logging

#### Error Tracking
- **Frontend**: Sentry 또는 LogRocket
  - JavaScript errors
  - API 호출 실패
  - Performance issues
- **Backend**: 기존 서버 로깅 시스템 활용

#### Analytics
- Google Analytics 또는 Plausible (프론트엔드)
- Page views
- User flows
- Conversion rates (퀘스트 완료율)

#### Logging
- **Backend 서버**:
  - API request logs
  - Database query performance
  - WebSocket connection status
  - Error logs

---

## 🎨 UI/UX Considerations

### Design Principles
1. **Mobile First**: 모바일 최적화 우선, 반응형 디자인
2. **Accessibility**: WCAG 2.1 AA 준수, 스크린 리더 지원
3. **Simplicity**: 직관적이고 간결한 인터페이스
4. **Consistency**: 디자인 시스템 기반 일관성
5. **Delight**: 마이크로 인터랙션, 애니메이션으로 재미 요소

### Key Screens

#### 1. Splash / Onboarding
- 모두콘 로고 애니메이션
- 간단한 앱 소개 (3~4장 슬라이드)
- 관심 분야 선택

#### 2. QR 스캔 시작
- 현장 QR 코드 스캔 안내 화면
- 자동으로 앱 URL로 리다이렉트
- 로그인 화면으로 전환

#### 3. Login
- 이름 입력 필드
- 전화번호 뒷 4자리 입력 필드
- 로그인 버튼
- 사전 신청 정보 안내 텍스트
- 매칭 실패 시 현장 등록 데스크 안내 메시지

#### 4. Home (대시보드)
- **내 출입증** (상단): 이름, QR 코드
- **퀘스트 진행률** (프로그레스 바)
- **다음 퀘스트** (카드): 위치, 안내
- **실시간 혼잡도** (그리드): 세션/부스별 색상 표시
- **빠른 액션**: QR 스캔, 지도 보기, 내 일정

#### 5. Map (지도)
- 인터랙티브 실내 지도
- POI 마커 (세션장, 부스, 화장실 등)
- 내 위치 표시
- 퀘스트 경로 표시
- 혼잡도 색상 오버레이

#### 6. Sessions (세션 목록)
- 필터: 트랙별, 시간대별
- 카드형 리스트:
  - 제목, 연사, 시간, 장소
  - 난이도 태그
  - 혼잡도 아이콘
  - 즐겨찾기 버튼
- 상세 페이지:
  - 설명
  - 체크인 버튼 (QR)

#### 7. Booths (부스 목록)
- 필터: 관심사, 거리순
- 카드형 리스트:
  - 부스 이름, 조직
  - 썸네일 이미지
  - 혼잡도, 예상 시간
  - 방문 완료 체크
- 상세 페이지:
  - 데모 설명, 이미지/영상
  - 위치 (지도 링크)
  - 방문 인증 버튼 (QR)

#### 8. Papers (페이퍼샵)
- 검색 + 필터 (키워드, 분야)
- 리스트:
  - 논문 제목, 저자
  - 키워드 태그
- 상세 페이지:
  - 초록
  - 저자 정보, Q&A 시간
  - 퀴즈 풀기 버튼
- 퀴즈 화면:
  - 객관식 문제 (5문제)
  - 정답 즉시 확인
  - 완료 시 인증 완료

#### 9. Quest (퀘스트)
- 체크리스트 형태:
  - 순서 번호
  - 목표 (부스/페이퍼)
  - 상태 (대기/완료)
  - 위치 보기 버튼
- 완료 시:
  - 축하 애니메이션
  - 다음 퀘스트 안내
- 전체 완료 시:
  - 보상 QR 생성
  - 보상 수령 안내

#### 10. Profile (프로필)
- 내 정보 (이름, 소속, 관심사)
- 내 프로필 QR 코드 (크게 표시)
- 통계:
  - 참석 세션 수
  - 방문 부스 수
  - 획득 포인트
  - 획득 배지
- 설정:
  - 관심 분야 수정
  - 알림 설정
  - 공개 범위 설정

#### 11. Activity (활동 기록)
- 타임라인 뷰:
  - 시간별 활동 카드
  - 아이콘 + 짧은 설명
- 통계 대시보드:
  - 원형 차트 (세션/부스/퀴즈 비율)
  - 배지 컬렉션
- 공유 버튼 (SNS)

#### 12. Networking (네트워킹)
- 교환한 프로필 목록:
  - 이름, 소속
  - 교환 시간
  - 상세 보기 버튼
- QR 스캔 버튼 (플로팅)

#### 13. Notifications (알림)
- 리스트:
  - 알림 제목, 시간
  - 읽음/안 읽음 표시
- 필터: 전체/세션/퀘스트/이벤트

### Design System

#### Colors
- **Primary**: Moducon brand color (예: #FF6B6B)
- **Secondary**: Accent color (예: #4ECDC4)
- **Success**: Green (#51CF66)
- **Warning**: Orange (#FFA94D)
- **Error**: Red (#FF6B6B)
- **Neutral**: Gray scale (#000, #333, #666, #999, #CCC, #F5F5F5, #FFF)

#### Typography
- **Heading**: Pretendard Bold (32px, 24px, 20px)
- **Body**: Pretendard Regular (16px, 14px)
- **Caption**: Pretendard Regular (12px)

#### Components
- **Buttons**: Rounded corners (8px), shadow on hover
- **Cards**: White background, subtle shadow, 12px radius
- **Inputs**: Border + focus state, 8px radius
- **Badges**: Small pill shape, colored background
- **Icons**: Lucide React (consistent icon set)

#### Spacing
- 4px grid system (4, 8, 12, 16, 24, 32, 48)

#### Animations
- **Transitions**: 200ms ease-in-out
- **Loading**: Spinner or skeleton screen
- **Success**: Confetti or checkmark animation
- **Micro-interactions**: Button press, card hover

---

## 📊 Success Metrics

### Key Performance Indicators (KPIs)

#### User Engagement
- **앱 접속률**: 전체 참가자 대비 앱 사용자 비율 → **목표 80%**
- **일일 활성 사용자(DAU)**: 행사 당일 활성 사용자 수
- **평균 세션 시간**: 사용자당 평균 앱 사용 시간 → **목표 2시간 이상**
- **화면별 체류 시간**: 각 화면에서의 평균 시간

#### Quest & Activity
- **퀘스트 시작률**: 퀘스트 생성한 사용자 비율 → **목표 70%**
- **퀘스트 완료율**: 전체 퀘스트 완료한 사용자 비율 → **목표 60%**
- **평균 부스 방문 수**: 사용자당 평균 방문 부스 → **목표 5개 이상**
- **페이퍼샵 참여율**: 페이퍼샵 퀴즈 푼 사용자 비율 → **목표 50%**
- **히든 퀘스트 발견율**: 히든 퀘스트 완료 사용자 비율 → **목표 30%**

#### Networking
- **프로필 교환 수**: 평균 교환 프로필 수 → **목표 5개 이상**
- **네트워킹 참여율**: 프로필 교환한 사용자 비율 → **목표 40%**

#### Satisfaction
- **앱 만족도**: 설문조사 평점 (5점 만점) → **목표 4.5점**
- **NPS (Net Promoter Score)**: 추천 의향 점수 → **목표 50 이상**
- **재사용 의향**: 내년에도 사용하겠다는 비율 → **목표 80%**

#### Technical Performance
- **앱 로딩 시간**: LCP 평균 → **목표 2.5초 이하**
- **에러율**: 오류 발생 비율 → **목표 0.1% 이하**
- **오프라인 접근 성공률**: 오프라인 모드 동작 비율 → **목표 95%**

#### Business Impact
- **부스 방문 증가율**: 전년 대비 부스 방문 증가 → **목표 40%**
- **세션 체크인율**: 실제 참석률 파악 → **목표 데이터 수집**
- **스폰서 만족도**: 부스 참가사 만족도 → **목표 4.0점**

### Data Collection

#### Analytics Events
- `app_open`: 앱 최초 실행
- `login_success`: 로그인 성공
- `quest_generated`: 퀘스트 생성
- `quest_completed`: 퀘스트 완료
- `session_checkin`: 세션 체크인
- `booth_visit`: 부스 방문
- `paper_quiz_complete`: 페이퍼샵 퀴즈 완료
- `profile_exchange`: 프로필 교환
- `reward_claimed`: 보상 수령
- `share_activity`: 활동 공유
- `error_occurred`: 오류 발생

#### User Feedback
- 행사 후 설문조사 (앱 내 링크)
- 별점 & 리뷰 수집
- 개선 사항 의견 수집

---

## 📅 Project Timeline

### Phase 0: 기획 & 설계 (2주) - **현재**
- [x] PRD 작성
- [ ] 디자인 시스템 정의
- [ ] UI/UX 와이어프레임
- [ ] 기술 스택 확정
- [ ] 개발 환경 세팅

### Phase 1: MVP 개발 (6주) - **2월 ~ 3월**
**Week 1-2: 인프라 & 인증**
- [ ] Next.js 프로젝트 초기화
- [ ] Database 설계 & 구축
- [ ] 인증 시스템 (로그인, 현장 등록)
- [ ] 디지털 서명 기능
- [ ] 출입증 생성

**Week 3-4: 핵심 기능**
- [ ] 세션 관리 (목록, 상세, 체크인)
- [ ] 부스 관리 (목록, 상세, 방문 인증)
- [ ] QR 스캔 기능
- [ ] 지도 & 네비게이션 (간단한 버전)
- [ ] 실시간 혼잡도 (기본 구현)

**Week 5-6: 퀘스트 시스템**
- [ ] 관심 분야 선택 온보딩
- [ ] 퀘스트 생성 알고리즘
- [ ] 퀘스트 진행 UI
- [ ] 페이퍼샵 & 퀴즈 시스템
- [ ] 히든 퀘스트

### Phase 2: 고도화 (4주) - **4월**
**Week 7-8: 네트워킹 & 활동**
- [ ] 프로필 관리
- [ ] 프로필 QR 공유
- [ ] 활동 타임라인
- [ ] 포인트 & 배지 시스템
- [ ] 보상 시스템

**Week 9-10: 실시간 & 알림**
- [ ] WebSocket 연동
- [ ] 실시간 혼잡도 업데이트
- [ ] 푸시 알림 시스템
- [ ] 알림 설정

### Phase 3: PWA & 최적화 (2주) - **5월**
**Week 11: PWA**
- [ ] Service Worker 구현
- [ ] Offline 모드
- [ ] App Shell 캐싱
- [ ] Installability

**Week 12: 성능 최적화**
- [ ] Bundle size 최적화
- [ ] 이미지 최적화
- [ ] Database 인덱싱
- [ ] Lighthouse 점수 개선

### Phase 4: 관리자 도구 (2주) - **6월**
**Week 13-14: Admin**
- [ ] 관리자 대시보드
- [ ] 콘텐츠 관리 (세션/부스/논문 등록)
- [ ] 참가자 관리 (DB 업로드)
- [ ] 실시간 모니터링

### Phase 5: 테스트 & 안정화 (4주) - **7월 ~ 8월**
**Week 15-16: 테스트**
- [ ] 단위 테스트 (Jest)
- [ ] E2E 테스트 (Playwright)
- [ ] 성능 테스트 (LoadForge)
- [ ] 보안 테스트

**Week 17-18: 베타 테스트**
- [ ] 내부 베타 테스트 (50명)
- [ ] 버그 수정
- [ ] 피드백 반영
- [ ] 문서화 (사용자 가이드)

### Phase 6: 런칭 준비 (2주) - **9월**
**Week 19: 프로덕션 배포**
- [ ] 프로덕션 환경 구축
- [ ] DB 마이그레이션
- [ ] 사전 신청자 데이터 입력
- [ ] QR 코드 생성 (부스/세션/페이퍼)

**Week 20: 최종 점검**
- [ ] 종합 테스트
- [ ] 모니터링 설정
- [ ] 백업 계획
- [ ] 긴급 대응 체계

### Phase 7: 행사 운영 (1일) - **2025년 12월 13일**
- [ ] 실시간 모니터링
- [ ] 버그 핫픽스
- [ ] 사용자 지원

### Phase 8: 사후 관리 (2주) - **12월 중순**
- [ ] 데이터 분석 & 리포트
- [ ] 사용자 피드백 수집
- [ ] 소스코드 정리 & GitHub 공개
- [ ] 회고 & 개선 사항 정리

---

## ⚠️ Risks & Mitigations

### Technical Risks

#### Risk 1: 대규모 동시 접속 (High Priority)
**위험**: 행사 시작 시간에 1,000명 이상이 동시 접속하여 서버 과부하

**완화 방안** (GitHub Pages + 기존 백엔드):
- ✅ **정적 파일**: GitHub Pages CDN (무제한 트래픽)
- ✅ **백엔드 서버**: 기존 서버 스케일링 준비
  - Database connection pooling
  - Rate limiting (API 호출 제한)
  - Load balancer 구성 (필요 시)
  - 수평 확장 가능하도록 준비
- Load testing 사전 수행 (Artillery, k6)
  - 1,000명 동시 접속 시뮬레이션
  - API 응답 시간 측정
  - 병목 지점 식별 및 개선

#### Risk 2: 오프라인 환경 (Medium Priority)
**위험**: 행사장 WiFi 불안정 또는 네트워크 혼잡

**완화 방안**:
- PWA 오프라인 모드 (Service Worker)
- Critical data 사전 캐싱 (출입증, 지도, 퀘스트)
- Background Sync (오프라인 작업 큐잉)
- Fallback UI (네트워크 오류 시 안내)

#### Risk 3: QR 스캔 실패 (Medium Priority)
**위험**: 조명, 카메라 품질 문제로 QR 스캔 어려움

**완화 방안**:
- 고대비 QR 코드 디자인
- 수동 코드 입력 옵션 제공
- NFC 태그 병행 (선택 사항)
- 현장 스태프 지원

#### Risk 4: 데이터 동기화 문제 (Medium Priority)
**위험**: 실시간 혼잡도 업데이트 지연 또는 불일치

**완화 방안**:
- WebSocket + Polling 하이브리드
- Eventual consistency 허용 (실시간성보다 안정성 우선)
- 에러 모니터링 (Sentry)

### Product Risks

#### Risk 5: 낮은 사용자 채택률 (High Priority)
**위험**: 참가자들이 앱을 사용하지 않고 기존 방식 고수

**완화 방안**:
- 사전 홍보 (이메일, SNS)
- 현장 가이드 (등록 데스크에서 안내)
- 인센티브 강화 (보상 강조)
- 직관적인 UX (학습 비용 최소화)
- 오프라인 안내서에도 QR 코드로 앱 접속 유도

#### Risk 6: 복잡한 퀘스트 시스템 (Medium Priority)
**위험**: 사용자가 퀘스트 개념을 이해하지 못하거나 복잡하게 느낌

**완화 방안**:
- 온보딩 튜토리얼 (간단한 3단계)
- 명확한 UI/UX (진행 상황 시각화)
- 선택적 기능 (퀘스트 없이도 사용 가능)
- 현장 도우미 배치

#### Risk 7: 개인정보 우려 (Medium Priority)
**위험**: 참가자가 위치 추적, 데이터 수집에 불안감

**완화 방안**:
- 명확한 개인정보 처리방침
- 선택적 기능 (위치, 알림 등)
- 최소 정보 수집
- 행사 후 데이터 삭제 옵션

### Operational Risks

#### Risk 8: 콘텐츠 준비 지연 (High Priority)
**위험**: 부스/세션/페이퍼 정보가 늦게 확정되어 앱 업데이트 지연

**완화 방안**:
- 관리자 도구로 실시간 업데이트 가능하도록
- 임시 데이터로 개발 진행 (Seed data)
- 마감 기한 명확화 (행사 1주 전)

#### Risk 9: 개발 일정 지연 (Medium Priority)
**위험**: 예상보다 개발 시간이 오래 걸림

**완화 방안**:
- MVP 우선 (P0 기능 먼저)
- 주간 스프린트 및 리뷰
- 외부 개발자 지원 고려
- 기능 우선순위 조정 (P1, P2 후순위)

#### Risk 10: 예산 초과 (Low Priority)
**위험**: 서버, API 비용이 예산 초과

**완화 방안**:
- Serverless 요금제 모니터링
- Free tier 활용 (Vercel, Supabase)
- 비용 알림 설정
- 트래픽 예측 및 예산 수립

---

## 📎 Appendix

### A. Priority Definitions

- **P0 (Must Have)**: 출시에 필수적인 기능, 없으면 앱 사용 불가능
- **P1 (Should Have)**: 중요하지만 출시 후 추가 가능
- **P2 (Nice to Have)**: 있으면 좋지만 우선순위 낮음

### B. User Flow Diagram

```
[현장 QR 스캔] → [로그인 (이름+전화번호)] → [디지털 서명] → [관심사 선택] → [퀘스트 생성]
                                                                          ↓
                                                                  [홈 대시보드] ← [출입증 확인]
                                                                          ↓
                                                           ┌────────────┬─┴─┬────────────┐
                                                           ↓            ↓   ↓            ↓
                                                       [지도 보기]  [세션 목록] [부스 목록] [페이퍼샵]
                                                           ↓            ↓       ↓           ↓
                                                       [퀘스트 완료] [체크인] [방문 인증] [퀴즈 풀기]
                                                           ↓            ↓       ↓           ↓
                                                           └────────────┴───────┴───────────┘
                                                                          ↓
                                                                    [활동 기록] → [보상 수령]
```

### C. Tech Stack Summary

**Frontend (GitHub Pages)**
| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Next.js 14 (Static Export) | React framework |
| UI | Tailwind CSS + shadcn/ui | Styling + components |
| State | Zustand | Client state management |
| Forms | React Hook Form + Zod | Form handling + validation |
| PWA | next-pwa | Service Worker + Offline |
| QR Scanner | html5-qrcode | QR 코드 스캔 |
| Deployment | GitHub Pages | Static hosting + CDN |
| Monitoring | Sentry | Frontend error tracking |
| Analytics | Google Analytics | User analytics |

**Backend (기존 서버)**
| Category | Technology | Purpose |
|----------|------------|---------|
| API | REST API (Express/FastAPI 등) | Backend endpoints |
| Database | PostgreSQL | Data storage |
| Auth | JWT | Token-based authentication |
| Realtime | WebSocket | Real-time updates |
| Storage | File System or S3 | File storage |
| Monitoring | 기존 로깅 시스템 | Backend logging |

### D. Key Dependencies

**Frontend (package.json)**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.3.0",
    "html5-qrcode": "^2.3.8",
    "qrcode": "^1.5.3",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "next-pwa": "^5.6.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "gh-pages": "^6.0.0",
    "jest": "^29.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

**Backend (기존 서버 - 예시)**
```json
{
  "dependencies": {
    "express": "^4.18.0",  // 또는 기존 프레임워크
    "pg": "^8.11.0",  // PostgreSQL
    "jsonwebtoken": "^9.0.0",  // JWT
    "cors": "^2.8.5",  // CORS
    "ws": "^8.14.0",  // WebSocket
    "bcrypt": "^5.1.0",  // 암호화
    "dotenv": "^16.0.0"  // 환경 변수
  }
}
```

### E. Glossary

| Term | Definition |
|------|------------|
| **LAB 부스** | 현업 개발자/연구자가 운영하는 기술 데모 부스 (상업적 홍보 X) |
| **페이퍼샵** | 논문 포스터 세션, 저자와 Q&A 가능 |
| **퀘스트** | 사용자 맞춤형 부스/페이퍼 방문 미션 |
| **히든 퀘스트** | 행사장 곳곳에 숨겨진 보너스 미션 |
| **혼잡도** | 공간별 현재 인원 대비 수용 인원 비율 (4단계) |
| **체크인** | 세션 또는 부스 방문 인증 |
| **프로필 교환** | QR 스캔으로 참가자 간 연락처 교환 |
| **배지** | 특정 조건 달성 시 획득하는 디지털 뱃지 |
| **포인트** | 활동에 따라 적립되는 점수 |

### F. Deployment Checklist

#### 프론트엔드 (GitHub Pages)
- [ ] `next.config.js` 정적 빌드 설정
- [ ] `public/CNAME` 파일 생성 (moducon.vibemakers.kr)
- [ ] 환경 변수 설정 (.env.production)
- [ ] DNS A Record 설정 완료
- [ ] GitHub Pages Custom domain 설정
- [ ] HTTPS 활성화 확인
- [ ] 빌드 & 배포 테스트 (`npm run deploy`)
- [ ] PWA manifest.json 확인
- [ ] Service Worker 동작 확인

#### 백엔드 (기존 서버)
- [ ] CORS 설정 (moducon.vibemakers.kr 허용)
- [ ] API 엔드포인트 구현 완료
- [ ] JWT 인증 시스템 구현
- [ ] WebSocket 서버 설정
- [ ] Database 마이그레이션
- [ ] 사전 신청자 DB 임포트
- [ ] Rate limiting 설정
- [ ] 에러 로깅 시스템 활성화
- [ ] 백업 시스템 구성

#### 통합 테스트
- [ ] 프론트엔드 → 백엔드 API 호출 테스트
- [ ] WebSocket 실시간 연결 테스트
- [ ] QR 코드 스캔 → API 검증 테스트
- [ ] 로그인 → 서명 → 출입증 발급 플로우 테스트
- [ ] 오프라인 모드 동작 확인
- [ ] 1,000명 동시 접속 부하 테스트

### G. References

- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [QR Code Best Practices](https://www.qr-code-generator.com/qr-code-marketing/qr-codes-basics/)

---

## 📝 Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-11 | Planning Team | 초안 작성 |
| 1.1 | 2025-01-13 | Planning Team | 아키텍처 변경: Vercel → GitHub Pages + 기존 백엔드 |
| 1.2 | 2025-01-13 | Planning Team | 커스텀 도메인 추가 (moducon.vibemakers.kr) |
| 1.3 | 2025-01-13 | Planning Team | 로그인 플로우 수정 (현장 QR → 로그인 → 서명) |

---

**문서 상태**: ✅ 아키텍처 확정 (GitHub Pages + 기존 백엔드)
**다음 단계**: 백엔드 API 스펙 확정 → 프론트엔드 개발 착수 → 통합 테스트

---

끝.
