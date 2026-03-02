<p align="center">
  <img src="public/icon.svg" width="128" height="128" alt="CommitSearch Logo">
</p>

# CommitSearch (v0.0.0)

**CommitSearch**는 사용자의 모든 GitHub 커밋 메시지를 '구글 검색'처럼 실시간으로 검색할 수 있게 해주는 고성능 크롬 확장 프로그램입니다.
**CommitSearch** is a high-performance Chrome extension that allows you to search through all your GitHub commit messages in real-time, just like Google search.

---

## 🚀 주요 기능 (Key Features)

- **초고속 로컬 검색 (Ultra-Fast Local Search)**: `FlexSearch` 엔진을 사용하여 수만 개의 커밋도 밀리초 단위로 검색합니다.
  (Uses the `FlexSearch` engine to search tens of thousands of commits in milliseconds.)
- **강력한 필터링 (Powerful Filtering)**: 리포지토리별, 공개/비공개 여부별 필터링을 지원합니다.
  (Supports filtering by repository and visibility - Public/Private.)
- **스마트 정렬 (Smart Sorting)**: 최신순 또는 오래된순으로 검색 결과를 정렬할 수 있습니다.
  (Sort results by newest or oldest.)
- **보안 중심 (Security Focused)**: GitHub 토큰을 브라우저의 로컬 보안 저장소에만 보관하며, 외부 서버로 전송하지 않습니다.
  (Stores tokens securely in local storage and never sends them to external servers.)
- **프리미엄 브랜딩 (Premium Branding)**: 새롭게 디자인된 고해상도 프리미엄 SVG 아이콘과 다크 모드 UI를 제공합니다.
  (Features a newly designed high-fidelity premium SVG icon and dark mode UI.)

## 📦 설치 및 사용 (Installation & Usage)

### 1. 릴리즈에서 다운로드 (Download from Releases)
가장 권장되는 설치 방법입니다. (The recommended way to install.)

1.  [Releases](https://github.com/hslcrb/CommitSearch_extsn/releases) 페이지에서 최신 버전의 `commitsearch-v0.0.0.zip` 파일을 다운로드합니다.
2.  압축을 풉니다. (Extract the zip file.)
3.  크롬 브라우저에서 `chrome://extensions/`로 이동하여 **개발자 모드**를 켭니다.
4.  **압축해제된 확장 프로그램을 로드합니다(Load unpacked)**를 클릭하고 압축을 푼 `dist` 폴더를 선택합니다.

### 2. 도커 사용하기 (Using Docker)
빌드 환경을 일관되게 유지하거나 웹 프리뷰를 실행할 때 사용합니다.
(Keep the build environment consistent or run a web preview.)

```bash
# 로컬 빌드 (Local build)
docker build -t commitsearch_extsn .

# 컨테이너 실행 (Run container)
docker run -d -p 8080:80 commitsearch_extsn
```

## 🤝 기여 안내 (Contributing)

이 프로젝트에 기여하고 싶으신가요? [CONTRIBUTING.md](CONTRIBUTING.md)에서 상세한 규칙과 가이드(한영 병기)를 확인하세요!
(To contribute, please check [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines and bilingual commit rules!)

## 📜 라이선스 (License)

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE) for details.
(저작권자: Rheehose (Rhee Creative) 2008-2026)
