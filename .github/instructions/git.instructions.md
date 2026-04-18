---
applyTo: "**"
---

# Git 규칙

- `AI_Link_Archive` 커밋은 `<type>(<scope>): <title>` 형식을 사용한다.
- `Al_all_playlist`와 `codeit-allplaylist`는 `{type}: {title}` 형식을 사용한다.
- 타입은 `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert` 범위를 우선 사용한다.
- `.env`, 시크릿 파일, 빌드 산출물, 로컬 전용 설정 파일은 커밋하지 않는다.
- `main`이나 `develop` 직접 수정 전략보다 feature branch + PR 흐름을 우선한다.
- 사용자 변경사항과 무관한 파일을 섞어서 수정하지 않는다.
