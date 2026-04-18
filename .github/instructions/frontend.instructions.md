---
applyTo: "**/*.{js,jsx,ts,tsx}"
---

# Frontend 개발 규칙

- React 계열 코드는 함수형 컴포넌트와 hooks를 기본으로 한다.
- TypeScript가 가능하면 우선이며 props, state, API 응답 타입을 명시한다.
- 파일과 컴포넌트 이름은 PascalCase, hooks는 `use` 접두사를 사용한다.
- import 순서는 React/플랫폼 → 외부 라이브러리 → 내부 모듈 순으로 유지한다.
- 비즈니스 로직과 UI 렌더링 로직을 분리하고, 매직 문자열과 인라인 복잡 로직은 피한다.
- `Al_all_playlist`는 구현보다 문서와 설계를 우선 참고하며 `docs/`, `docs_ref/`의 의도를 벗어나지 않는다.
