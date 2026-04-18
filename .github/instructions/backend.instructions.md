---
applyTo: '**/*.java'
---

# Backend 개발 규칙

- Spring Boot 코드는 각 프로젝트의 기존 구조를 우선 따른다: `AI_Link_Archive`는 layered MVC, `codeit-allplaylist`는 서비스별 패키지 구조를 유지한다.
- `controller`, `service`, `repository`, `entity`, `dto` 역할을 섞지 말고 DTO는 개별 파일로 관리한다.
- DTO는 가능하면 `record`를 우선 사용하고, 응답 DTO와 요청 DTO를 분리한다.
- 클래스는 PascalCase, 메서드와 변수는 camelCase, 상수는 UPPER_SNAKE_CASE를 사용한다.
- `LocalDateTime` 필드는 `createdAt`, `updatedAt`처럼 `At` 접미사를, `LocalDate` 필드는 `startDt`, `endDt`처럼 `Dt` 접미사를 사용한다.
- `@Data`, 무분별한 `@Setter`, `FetchType.EAGER`는 피하고 명시적 메서드와 LAZY 로딩을 기본으로 한다.
- 컨트롤러와 서비스 메서드는 `get`, `create`, `update`, `delete` 동사 패턴을 유지한다.
- 예외는 도메인별 custom exception + 전역 handler 패턴을 따른다.
- `AI_Link_Archive`를 수정할 때는 파일 길이를 짧게 유지하고 150줄 이상으로 커지면 분리부터 검토한다.
- `algorithm-study`의 순수 알고리즘 파일은 프레임워크 패턴보다 간결한 문제 풀이를 우선한다.
