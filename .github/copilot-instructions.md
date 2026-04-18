# GitHub Copilot Instructions

This workspace contains four independent projects, each in its own subdirectory.

---

## Projects Overview

| Directory | Type | Stack | Status |
|-----------|------|-------|--------|
| `AI_Link_Archive/` | Spring Boot REST API | Java 17, Spring Boot 4.0.4, H2 (dev), planned MySQL + MongoDB | Early development |
| `Al_all_playlist/` | Design documentation | React + TypeScript + Spring Boot (planned) | Documentation/design phase |
| `algorithm-study/` | Algorithm solutions | Java 17 + Python | Active study repo |
| `codeit-allplaylist/` | Microservices platform | Java 17, Spring Boot 3.4.1, MySQL, Redis, Kafka, Docker | Most mature |

---

## Build & Test Commands

### AI_Link_Archive
```bash
# From AI_Link_Archive/
./gradlew build
./gradlew test
./gradlew test --tests "org.rama.ailinkarchive.SomeClass.someMethod"
```

### codeit-allplaylist (API service)
```bash
# From codeit-allplaylist/services/api/
./gradlew build
./gradlew test
./gradlew test --tests "com.sprint.api.ClassName.methodName"

# Run full stack locally
cd codeit-allplaylist/
docker-compose up
```
CI/CD: GitHub Actions deploys Docker images to AWS ECR on push to `develop`.

### algorithm-study
```bash
# Python (from repo root)
python algorithms/python/problems/two_sum_0001.py

# Java (from app/legacy/)
./gradlew build
```
CI: GitHub Actions runs on push to `main` — builds Java with Gradle and runs Python scripts.

---

## Architecture

### codeit-allplaylist — Microservices
Three services under `services/`:
- **api** — Main REST API (`com.sprint.api`): JWT auth, JPA + QueryDSL, Kafka producer/consumer, SSE for real-time notifications, cursor-based pagination, TMDB batch scheduler
- **batch** — Spring Batch scheduled jobs (TMDB content sync)
- **gateway** — Nginx reverse proxy routing to API

Infrastructure: MySQL + Redis + Kafka + Prometheus (all defined in `docker-compose.yml`).

Spring profiles: `local`, `prod` (configured in `application-{profile}.properties`).

### AI_Link_Archive — Layered MVC
Package root: `org.rama.ailinkarchive`

Planned polyglot persistence:
- **MySQL** — users, links, reminders, notifications (JPA entities in `entity/`)
- **MongoDB** — AI analysis results, raw metadata (document classes in `document/`)

Repositories split: `repository/jpa/` and `repository/mongo/`.

External integrations: OpenAI API (gpt-4o-mini for classification/tagging/summary), FCM (push notifications), Jsoup (link metadata scraping).

### Al_all_playlist — Design Reference
Full design documentation in `docs/` and `docs_ref/`. Covers: requirements, ERD, system architecture, domain flows, screen specs. Use these when implementing the project.

Planned architecture: Stateless (JWT), Event-Driven (Kafka), Cache-First (Redis), Real-time (WebSocket/SSE).

### algorithm-study — File Naming
- Java: `algorithms/java/problems/ProblemId_Description.java` (e.g., `TwoSum_0001.java`)
- Python: `algorithms/python/problems/problemid_description.py` (e.g., `two_sum_0001.py`)

---

## Key Conventions

### Commit Messages
Both projects use the same type vocabulary:

| Project | Format |
|---------|--------|
| AI_Link_Archive | `<type>(<scope>): <title>` — e.g., `feat(link): Jsoup 기반 메타데이터 추출 구현` |
| Al_all_playlist / codeit-allplaylist | `{type}: {title}` — e.g., `feat: 사용자 로그인 기능 추가` |

Types: `feat`, `fix`, `docs`, `style`, `refactor`/`refact`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

Trailers: `Closes #N` / `Resolves: #N`

### Branch Strategy
- AI_Link_Archive: Git Flow — `main` → `develop` → `feature/기능명-상세`
- Al_all_playlist / codeit-allplaylist: `main` → `develop` → `feature/#{issue}` or `feature/#{issue}-description`

PRs use **Squash and Merge**. 1 reviewer approval required. CodeRabbit auto-review is active on Al_all_playlist.

### Java Naming
| Target | Rule | Example |
|--------|------|---------|
| Class | PascalCase | `LinkService`, `UserController` |
| Method/variable | camelCase, verb-first | `saveLink()`, `userId` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Package | lowercase | `org.rama.ailinkarchive.service` |
| `LocalDateTime` fields | suffix `At` | `createdAt`, `modifiedAt` |
| `LocalDate` fields | suffix `Dt` | `startDt`, `endDt` |
| Kafka events | suffix `Event` | `PlaylistSubscribedEvent` |

### DTO Structure & Naming
DTOs are managed as individual files (no inner classes). Prefer `record` types (immutable).

```
dto/
├── request/    # {Entity}CreateRequest, {Entity}UpdateRequest
├── response/   # {Entity}Dto, CursorPageResponse{Entity}Dto
└── data/       # {Entity}SummaryDto (shared sub-data)
```

### API Endpoints
- Plural nouns, kebab-case, versioned: `/api/v1/links`, `/api/v1/ai-categories`
- Actions expressed through HTTP verbs, not URL paths

### Unified API Response Format
All responses (including errors) are wrapped:
```json
{ "success": true, "code": 200, "message": "...", "data": { ... } }
```
HTTP codes: `200` query/update, `201` create, `204` delete, `400`/`401`/`403`/`404`/`500` errors.

### Exception Handling
- Define domain-specific custom exceptions (e.g., `LinkNotFoundException`)
- Single `@RestControllerAdvice` global handler
- Log level: `WARN` for business exceptions, `ERROR` for system exceptions

### Layer Method Naming (codeit-allplaylist / Al_all_playlist)
| Action | Controller & Service | Repository |
|--------|---------------------|------------|
| List | `getOrders()` | `findAll()` |
| Single | `getOrder()` | `findById()` |
| Create | `createOrder()` | `save()` |
| Update | `updateOrder()` | `save()` |
| Delete | `deleteOrder()` | `delete()` |

### File Length (AI_Link_Archive strict rule)
- Recommended: ≤ 50 lines
- Review needed: 51–150 lines
- Must refactor: > 150 lines
- PR blocked: > 200 lines

### Test Conventions
```java
@DisplayName("링크 저장 시 메타데이터가 자동 추출된다")  // Korean display name
@Test
void saveLink_WithValidUrl_ExtractsMetadata() {      // method_condition_expected
    // given / when / then
}
```

Test slices by layer:
- Controller: `@WebMvcTest`
- Service: `@ExtendWith(MockitoExtension.class)`
- Repository: `@DataJpaTest`
- Integration: `@SpringBootTest`

### QueryDSL (codeit-allplaylist)
Custom repositories follow the `{Name}RepositoryCustom` interface + `{Name}RepositoryCustomImpl` implementation pattern. QClass generation output is `build/generated/querydsl/`.

---

## Workspace Harness

- Detailed file-pattern guidance lives in `.github/instructions/*.instructions.md`.
- Shared external MCP connectors live in `~/.copilot/mcp-config.json`.
- Workspace-local MCP connectors live in `.mcp.json`.
- Required private env vars are `MCP_GITHUB_TOKEN`, `MCP_NOTION_TOKEN`, `MCP_POSTGRES_URL`, and the `MCP_MYSQL_*` set loaded from `~/.copilot/copilot-env.sh`.
