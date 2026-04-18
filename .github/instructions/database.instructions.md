---
applyTo: '**'
---

# DB 규칙

- 테이블과 컬럼은 프로젝트의 기존 네이밍을 우선 따르되 일반적으로 snake_case를 유지한다.
- `SELECT *`는 피하고 필요한 컬럼만 조회한다.
- 인덱스, 정렬, 페이지네이션이 얽힌 쿼리는 성능 영향을 먼저 확인한다.
- MySQL과 PostgreSQL 차이를 고려해 방언 의존 SQL은 최소화한다.
- `codeit-allplaylist`는 MySQL, `AI_Link_Archive`는 MySQL + MongoDB 계획을 고려해 저장소 책임을 섞지 않는다.
- QueryDSL, JPA repository, SQL 스크립트 중 이미 쓰는 접근 방식을 우선 재사용한다.
