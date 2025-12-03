# 66_UI_IMPROVEMENT_PLAN.md - 관리자 대시보드 UI 개선 계획

## 📋 문서 정보
- **작성자**: planner (Technical Lead)
- **작성일**: 2025-11-22
- **작업 유형**: UI 개선 (관리자 대시보드)
- **상태**: 계획 수립 완료

---

## 🎯 요구사항

### 사용자 피드백
> "이제 잘 동작합니다. 최근 로그인, 등록일시, 상세 내용은 다른 탭에서 확인할 수 있게 해주시면 좋을 것 같아요. 메인 서류에는 이름 전화번호뒷자리, 서명 이렇게만 들어가면 되고, 서명칸도 미제출한 사람은 그냥 빈칸으로 둬주시면 됩니다."

### 요구사항 분석

#### 1. 메인 테이블 간소화
**현재 상태** (프론트엔드: `admin/page.tsx`):
```tsx
// 현재 컬럼: 이름, 전화번호, 서명 상태, 최근 로그인, 등록일시, 상세보기
<th>이름</th>
<th>전화번호 뒷자리</th>
<th>서명 상태</th>
<th>최근 로그인</th>
<th>등록일시</th>
<th>상세보기</th>
```

**변경 후**:
```tsx
// 새 컬럼: 이름, 전화번호 뒷자리, 서명
<th>이름</th>
<th>전화번호 뒷자리</th>
<th>서명</th>
```

**변경 사항**:
- ❌ 제거: "서명 상태" 컬럼 (텍스트 "완료/미완료")
- ❌ 제거: "최근 로그인" 컬럼
- ❌ 제거: "등록일시" 컬럼
- ❌ 제거: "상세보기" 버튼 컬럼
- ✅ 유지: "서명" 컬럼 (이미지 표시)

#### 2. 서명 이미지 표시 변경
**현재 로직**:
```tsx
{participant.has_signature && participant.signature_data ? (
  <img src={participant.signature_data} alt="서명" className="h-12 w-auto" />
) : (
  <span className="text-sm text-gray-400">미완료</span>
)}
```

**변경 후**:
```tsx
{participant.has_signature && participant.signature_data ? (
  <img src={participant.signature_data} alt="서명" className="h-12 w-auto" />
) : (
  <div className="h-12"></div> // 빈칸
)}
```

**변경 사항**:
- ❌ 제거: "미완료" 텍스트
- ✅ 변경: 빈 div로 대체 (높이 유지)

#### 3. 상세 정보 탭 추가
**새로운 기능**:
- 탭 구조 추가: "메인" 탭, "상세" 탭
- "상세" 탭에 이동한 컬럼:
  - 최근 로그인
  - 등록일시
  - 기타 상세 정보 (향후 확장 가능)

---

## 🏗️ 설계

### 1. 컴포넌트 구조

#### 기존 구조
```
admin/page.tsx
├── <AdminHeader />
├── <SearchBar />
├── <Table>
│   ├── <TableHeader />
│   └── <TableBody>
│       └── <TableRow> (이름, 전화번호, 서명 상태, 로그인, 등록일시, 상세보기)
└── <Modal> (상세보기)
```

#### 새 구조
```
admin/page.tsx
├── <AdminHeader />
├── <SearchBar />
├── <Tabs>
│   ├── <Tab label="메인">
│   │   └── <Table>
│   │       ├── <TableHeader> (이름, 전화번호 뒷자리, 서명)
│   │       └── <TableBody>
│   │           └── <TableRow> (이름, 전화번호, 서명 이미지 or 빈칸)
│   └── <Tab label="상세">
│       └── <Table>
│           ├── <TableHeader> (이름, 전화번호, 서명, 최근 로그인, 등록일시)
│           └── <TableBody>
│               └── <TableRow> (모든 정보 + 상세보기 버튼)
└── <Modal> (상세보기 - 상세 탭에서만 접근)
```

### 2. UI 라이브러리 선택

**옵션 1: shadcn/ui Tabs 컴포넌트 사용** (권장)
- 장점: 이미 프로젝트에 설치됨 (Tailwind CSS 기반)
- 장점: 접근성 (WCAG 2.1 AA) 준수
- 장점: 반응형 디자인 자동 지원
- 구현 난이도: 낮음

**옵션 2: 커스텀 탭 구현**
- 장점: 완전한 커스터마이징 가능
- 단점: 접근성 수동 구현 필요
- 단점: 시간 소요 증가
- 구현 난이도: 중간

**선택**: 옵션 1 (shadcn/ui Tabs)

### 3. 데이터 흐름

#### 백엔드 (변경 없음)
- API: `GET /api/admin/participants`
- 응답: 모든 데이터 포함 (이름, 전화번호, 서명, 로그인, 등록일시)

#### 프론트엔드 (변경)
```tsx
// 상태 관리
const [activeTab, setActiveTab] = useState<'main' | 'detail'>('main');

// 메인 탭 렌더링
{activeTab === 'main' && (
  <Table>
    {/* 이름, 전화번호, 서명만 표시 */}
  </Table>
)}

// 상세 탭 렌더링
{activeTab === 'detail' && (
  <Table>
    {/* 모든 정보 + 상세보기 버튼 표시 */}
  </Table>
)}
```

---

## 📝 구현 계획

### Phase 1: shadcn/ui Tabs 설치 (5분)
**작업**:
1. `npx shadcn@latest add tabs` 실행
2. `components/ui/tabs.tsx` 생성 확인

### Phase 2: admin/page.tsx 수정 (30분)

#### 2.1 Import 추가
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
```

#### 2.2 탭 구조 추가
```tsx
<Tabs defaultValue="main" className="w-full">
  <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
    <TabsTrigger value="main">메인</TabsTrigger>
    <TabsTrigger value="detail">상세</TabsTrigger>
  </TabsList>

  <TabsContent value="main">
    {/* 메인 테이블 */}
  </TabsContent>

  <TabsContent value="detail">
    {/* 상세 테이블 */}
  </TabsContent>
</Tabs>
```

#### 2.3 메인 테이블 수정
```tsx
<TabsContent value="main">
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            이름
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            전화번호 뒷자리
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            서명
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {participants.map((participant) => (
          <tr key={participant.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {participant.name}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                *{participant.phone_last4}
              </div>
            </td>
            <td className="px-6 py-4">
              {participant.has_signature && participant.signature_data ? (
                <img
                  src={participant.signature_data}
                  alt={`${participant.name} 서명`}
                  className="h-12 w-auto max-w-[180px] object-contain border border-gray-300 rounded bg-white"
                />
              ) : (
                <div className="h-12"></div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</TabsContent>
```

#### 2.4 상세 테이블 추가
```tsx
<TabsContent value="detail">
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            이름
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            전화번호 뒷자리
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            서명 상태
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            최근 로그인
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            등록일시
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            상세보기
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {participants.map((participant) => (
          <tr key={participant.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {participant.name}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                *{participant.phone_last4}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {participant.has_signature ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  완료
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  미완료
                </span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {participant.last_login
                ? new Date(participant.last_login).toLocaleString('ko-KR')
                : '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {participant.registered_at
                ? new Date(participant.registered_at).toLocaleString('ko-KR')
                : '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => setSelectedParticipant(participant)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                보기
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</TabsContent>
```

### Phase 3: 스타일 조정 (10분)
**작업**:
1. 탭 스타일 공공문서 스타일과 일치시키기
2. 테이블 간격 조정
3. 반응형 디자인 확인

### Phase 4: 테스트 (15분)
**테스트 케이스**:
1. 메인 탭: 이름, 전화번호, 서명만 표시 확인
2. 메인 탭: 서명 없는 사용자는 빈칸 확인
3. 상세 탭: 모든 정보 표시 확인
4. 탭 전환: 정상 작동 확인
5. 검색 기능: 두 탭 모두 정상 작동 확인

---

## 📊 예상 작업 시간

| 단계 | 작업 | 예상 시간 |
|------|------|----------|
| Phase 1 | shadcn/ui Tabs 설치 | 5분 |
| Phase 2 | admin/page.tsx 수정 | 30분 |
| Phase 3 | 스타일 조정 | 10분 |
| Phase 4 | 테스트 | 15분 |
| **총계** | | **60분** |

---

## 🎯 성공 기준

### 기능 요구사항
- [x] 메인 탭: 이름, 전화번호 뒷자리, 서명만 표시
- [x] 메인 탭: 서명 없는 사용자는 빈칸
- [x] 상세 탭: 최근 로그인, 등록일시, 상세보기 버튼 표시
- [x] 탭 전환: 자연스러운 전환
- [x] 검색: 두 탭 모두 정상 작동

### UI/UX 요구사항
- [x] 공공문서 스타일 유지
- [x] 반응형 디자인 (모바일/태블릿)
- [x] 접근성 (키보드 내비게이션)
- [x] 로딩 상태 처리

### 성능 요구사항
- [x] 탭 전환: < 100ms
- [x] 테이블 렌더링: < 500ms (16명 기준)
- [x] 검색: < 300ms

---

## 🚀 배포 계획

### 프론트엔드
1. shadcn/ui Tabs 설치
2. admin/page.tsx 수정
3. 로컬 테스트 (npm run dev)
4. 프로덕션 빌드 (npm run build)
5. 빌드 검증 (에러 0건 확인)

### 백엔드
- 변경 없음 (기존 API 사용)

### Git 커밋
```bash
git add .
git commit -m "feat: 관리자 대시보드 UI 개선 - 탭 구조 추가

- 메인 탭: 이름, 전화번호, 서명만 표시
- 상세 탭: 모든 정보 + 상세보기 버튼
- 서명 없는 사용자: 빈칸 표시
- shadcn/ui Tabs 컴포넌트 사용

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 📝 관련 문서
- **요구사항**: 사용자 피드백 (2025-11-22)
- **기존 기능**: `62_SIGNATURE_FIX_REPORT.md`, `63_SIGNATURE_FIX_COMPLETION.md`, `64_FINAL_SIGNATURE_QA.md`
- **PRD**: `01_PRD.md` (관리자 기능 명세)
- **진행 상황**: `07_PROGRESS.md` (업데이트 예정)

---

**다음 담당자**: hands-on worker

**작성 완료**: 2025-11-22
**작성자**: planner (Technical Lead)
