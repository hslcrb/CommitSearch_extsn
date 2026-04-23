# 상세 계획서: 커밋 목표 관리 및 상세 히스토리 연동

이 문서는 CommitSearch 확장 프로그램에 커밋 목표 설정, 상세 히스토리 동기화, 그리고 다국어 지원 기능을 추가하기 위한 상세 실행 계획을 담고 있습니다.

## 1. 개요
사용자가 단순히 커밋을 검색하는 것을 넘어, 자신의 개발 목표(일/주/월/년 단위)를 설정하고 이를 시각적으로 추적할 수 있도록 하여 동기부여를 제공합니다.

---

## 2. 주요 기능 및 변경 사항

### A. 상세 히스토리 동기화 (Enhanced Data Fetching)
- **GitHub API 페이지네이션 구현**: `GitHubService.ts`에서 현재 1페이지(100개)만 가져오는 로직을 수정하여 설정된 한도까지 모든 페이지를 순회하도록 개선합니다.
- **증분 업데이트(Incremental Update)**: 이미 로컬에 저장된 마지막 커밋 이후의 데이터만 가져오도록 최적화하여 API 호출 횟수를 줄입니다.

### B. 커밋 목표 시스템 (Commit Goal System)
- **목표 설정 모델**:
  - `Daily`: 일일 커밋 목표 (예: 1회)
  - `Weekly`: 주간 목표 (예: 5회)
  - `Monthly`: 월간 목표 (예: 20회)
  - `Yearly`: 연간 목표 (예: 365회)
- **진행도 계산 로직**: `StorageService`에서 현재 날짜/주/월/년을 기준으로 필터링하여 커밋 수를 집계합니다.

### C. UI/UX 개선 (Popup Interface)
- **상단 프로그레스 대시보드**: `App.tsx` 최상단에 현재 목표 달성률을 보여주는 컴포넌트를 추가합니다.
  - **ProgressBar**: 시각적 막대 그래프 (Framer Motion 애니메이션 적용).
  - **수치 전환**: "60%" ↔ "6/10 Commits" 클릭 시 토글.
- **실시간 새로고침**: 동기화 버튼 클릭 시 즉시 프로그레스가 업데이트되도록 연동합니다.
- **설정 창 확장**: 목표 수치를 입력하고 토큰을 관리할 수 있는 영역을 개선합니다.

### D. 다국어 지원 (i18n Support)
- **번역 파일 구조**: `src/i18n/` 폴더 내에 `en.json`, `ko.json`을 정의합니다.
- **i18n Hook**: 현재 브라우저 설정 혹은 사용자 선택에 따라 텍스트를 반환하는 경량화된 다국어 지원 로직을 구현합니다.

---

## 3. 기술적 세부 설계

### 1) 데이터 스키마 확장 (`storageService.ts`)
```typescript
interface GoalSettings {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  displayMode: 'percentage' | 'count';
  language: 'en' | 'ko';
}
```

### 2) 다국어 처리 예시
```typescript
const translations = {
  ko: {
    sync: "동기화 중...",
    goal: "오늘의 목표",
    noResults: "검색 결과가 없습니다."
  },
  en: {
    sync: "Syncing...",
    goal: "Today's Goal",
    noResults: "No matches found."
  }
};
```

---

## 4. 단계별 실행 계획

### 1단계: 기반 로직 강화 (Service Layer)
- `githubService.ts`: 페이지네이션 지원 및 상세 데이터 Fetch 로직 구현.
- `storageService.ts`: 목표(Goal) 설정을 위한 새로운 Object Store 추가 및 CRUD 로직 작성.

### 2단계: 진행도 계산 로직 구현
- 현재 시간을 기준으로 `Daily/Weekly/Monthly/Yearly` 기간 내의 커밋 수를 합산하는 유틸리티 함수 작성.

### 3단계: UI 컴포넌트 개발
- `GoalProgressBar`: Framer Motion을 이용한 애니메이션 프로그레스 바.
- `SettingsForm`: 목표 수치 및 언어 설정을 위한 UI.

### 4단계: 통합 및 검증
- 전체 기능을 연결하고 API 호출 제한(Rate Limit)을 고려한 예외 처리.
- 다국어 텍스트 적용 확인.

---

## 5. 기대 효과
- 사용자가 자신의 개발 습관을 시각적으로 파악할 수 있음.
- 과거 데이터부터 현재까지의 상세한 커밋 히스토리를 한곳에서 관리.
- 글로벌 사용자(KR/EN) 접근성 확보.
