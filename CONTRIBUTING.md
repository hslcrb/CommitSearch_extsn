# 기여 가이드 (Contributing Guide)

CommitSearch 프로젝트에 관심을 가져주셔서 감사합니다! 원활한 협업을 위해 아래 가이드를 준수해 주세요.
Thank you for your interest in the CommitSearch project! Please follow the guide below for smooth collaboration.

---

## 🛠 개발 환경 구축 (Development Setup)

1. 저장소를 클론합니다. (Clone the repository.)
2. 의존성을 설치합니다. (Install dependencies.)
   ```bash
   npm install
   ```
3. 개발 서버를 실행합니다. (Run development server.)
   ```bash
   npm run dev
   ```

## 📝 커밋 메시지 규칙 (Commit Message Rules)

우리는 명확한 히스토리 관리를 위해 **Conventional Commits** 스타일을 따르며, 모든 메시지는 **한영 병기**를 원칙으로 합니다.
We follow the **Conventional Commits** style for clear history management, and all messages must be **bilingual (Korean/English)**.

### 메시지 구조 (Structure)
`<type>: <description (Korean)> (<description (English)>)`

### 주요 타입 (Key Types)
- `feat`: 새로운 기능 추가 (New feature)
- `fix`: 버그 수정 (Bug fix)
- `docs`: 문서 관련 변경 (Documentation changes)
- `style`: 코드 스타일 변경 (포맷팅 등) (Code style changes/formatting)
- `refactor`: 코드 리팩토링 (Code refactoring)
- `chore`: 빌드 업무, 패키지 매니저 설정 등 (Maintenance/build tasks)

### 예시 (Example)
- `feat: 검색 필터 기능 추가 (Add search filter functionality)`
- `docs: 리드미 한영 병기 업데이트 (Update README with bilingual content)`

## 🚀 풀 리퀘스트 절차 (Pull Request Process)

1. 새로운 기능을 위한 브랜치를 생성합니다 (`feat/feature-name`).
   (Create a branch for a new feature.)
2. 변경 사항을 구현하고 빌드 테스트를 수행합니다 (`npm run build`).
   (Implement changes and run build tests.)
3. `main` 브랜치로 Pull Request를 생성합니다.
   (Create a Pull Request to the `main` branch.)
4. 상세한 설명(한영 병기)을 작성하여 리뷰를 요청합니다.
   (Write a detailed description (bilingual) and request a review.)

## 🛡 라이선스 및 저작권 (License & Copyright)

기여한 모든 코드는 **Apache License 2.0**에 따라 배포되는 것에 동의하는 것으로 간주됩니다.
All contributed code is deemed to be agreed to be distributed under the **Apache License 2.0**.

저작권자 (Copyright Holder): **Rheehose (Rhee Creative) 2008-2026**
