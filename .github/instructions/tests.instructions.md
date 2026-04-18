---
applyTo: "**/{*Test.java,*IntegrationTest.java,*.test.js,*.test.ts,*.spec.js,*.spec.ts,__tests__/**}"
---

# 테스트 규칙

- 테스트 이름은 `method_condition_expected` 패턴을 우선하고 의도가 바로 보이게 작성한다.
- Java 테스트는 가능하면 `@DisplayName`을 한국어로 작성하고 `given / when / then` 구조를 유지한다.
- 최소한 happy path, 잘못된 입력, 리소스 없음, 권한/인증 실패, 엣지 케이스를 검토한다.
- 외부 API, 시간, 난수, 네트워크는 제어 가능한 mock 또는 fixture로 고정한다.
- `Thread.sleep()` 같은 임의 대기는 피하고 기존 테스트 도구의 대기 유틸리티를 사용한다.
- 테스트 간 상태 공유와 순서 의존성을 만들지 않는다.
