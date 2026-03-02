# CommitSearch (v0.0.0)

**CommitSearch**는 사용자의 모든 GitHub 커밋 메시지를 '구글 검색'처럼 실시간으로 검색할 수 있게 해주는 고성능 크롬 확장 프로그램입니다.
**CommitSearch** is a high-performance Chrome extension that allows you to search through all your GitHub commit messages in real-time, just like Google search.

---

## 주요 기능 (Key Features)

- **초고속 로컬 검색 (Ultra-Fast Local Search)**: `FlexSearch` 엔진을 사용하여 수만 개의 커밋도 밀리초 단위로 검색합니다.
  (Uses the `FlexSearch` engine to search tens of thousands of commits in milliseconds.)
- **강력한 필터링 (Powerful Filtering)**: 리포지토리별, 공개/비공개 여부별 필터링을 지원합니다.
  (Supports filtering by repository and visibility - Public/Private.)
- **스마트 정렬 (Smart Sorting)**: 최신순 또는 오래된순으로 검색 결과를 정렬할 수 있습니다.
  (Sort results by newest or oldest.)
- **보안 중심 (Security Focused)**: GitHub 토큰을 브라우저의 로컬 보안 저장소에만 보관하며, 외부 서버로 전송하지 않습니다.
  (Stores tokens securely in local storage and never sends them to external servers.)
- **유려한 UI (Premium UI)**: 세련된 다크 모드 인터페이스와 커스텀 SVG 아이콘을 제공합니다.
  (Provides a sleek dark mode interface and custom SVG icons.)

## 설치 방법 (Installation)

1. 이 저장소를 클론하거나 ZIP으로 다운로드합니다.
   (Clone this repo or download as ZIP.)
2. `npm install` 후 `npm run build`를 실행합니다.
   (Run `npm install` then `npm run build`.)
3. 크롬 브라우저에서 `chrome://extensions/`로 이동합니다.
   (Go to `chrome://extensions/` in your Chrome browser.)
4. '개발자 모드'를 활성화합니다.
   (Enable 'Developer mode'.)
5. '압축해제된 확장 프로그램을 로드합니다'를 클릭하고 `dist` 폴더를 선택합니다.
   (Click 'Load unpacked' and select the `dist` folder.)

## 사용 방법 (Usage)

1. 확장을 실행하고 **Settings** 버튼을 눌러 GitHub Personal Access Token을 입력한 뒤 저장하세요.
   (Run the extension, click **Settings**, enter your GitHub PAT, and save.)
2. **Sync GitHub** 버튼을 눌러 데이터를 로컬로 가져오세요.
   (Click **Sync GitHub** to bring your data to local storage.)
3. 검색창에 검색어를 입력하여 커밋을 찾으세요!
   (Enter search terms in the search bar to find your commits!)

## 기술 스택 (Tech Stack)

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Search Engine**: FlexSearch
- **Storage**: IndexedDB (idb)
- **Icons**: Lucide React, Custom SVG
- **Animations**: Framer Motion

## 라이선스 (License)

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE) for details.
(저작권자: Rheehose (Rhee Creative) 2008-2026)
