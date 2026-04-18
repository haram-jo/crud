# CRUD — 업무 & 일정 관리 앱

Next.js 16 (App Router, JavaScript) + Prisma + PostgreSQL + Tailwind v4 + shadcn/ui 기반의 간단한 업무(Todo) / 일정(Schedule) 관리 웹앱입니다.

## 기술 스택

- Node.js 24 LTS
- Next.js 16.2 (App Router, Route Handlers, Turbopack)
- React 19
- Prisma 6 + PostgreSQL
- 인증: bcryptjs + jsonwebtoken (HS256, httpOnly 쿠키)
- UI: Tailwind CSS v4, shadcn/ui, lucide-react, react-day-picker
- 폼/검증: react-hook-form + zod
- 테스트: Vitest + Testing Library, Playwright(E2E)

## 로컬 실행

1. Node 24 설치 (`.nvmrc` 참고)
2. Postgres 준비. 예) `docker run --name crud-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crud -p 5432:5432 -d postgres:16`
3. 환경변수: `.env.example`을 참고해 `.env.local` 작성
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crud?schema=public
   AUTH_JWT_SECRET=<32+ bytes>   # node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   NEXT_PUBLIC_APP_NAME=CRUD
   ```
4. 의존성 설치 및 DB 마이그레이션
   ```bash
   npm install
   npx prisma migrate dev --name init
   npm run dev
   ```
5. 브라우저에서 `http://localhost:3000` 접속 → `/signup`부터 시작.

## 주요 스크립트

| 명령                     | 설명                                |
| ------------------------ | ----------------------------------- |
| `npm run dev`            | 개발 서버                           |
| `npm run build`          | 프로덕션 빌드                       |
| `npm start`              | 프로덕션 서버                       |
| `npm run lint`           | ESLint                              |
| `npm run format`         | Prettier                            |
| `npm run prisma:migrate` | `prisma migrate dev`                |
| `npm run prisma:deploy`  | 운영 마이그레이션 적용              |
| `npm test`               | Vitest 유닛 테스트                  |
| `npm run test:e2e`       | Playwright E2E (dev 서버 자동 기동) |

## 디렉토리 구조 요약

```
app/
  (auth)/{login,signup}/   로그인·회원가입
  (app)/{dashboard,todos,schedules}/  인증 후 영역
  api/{auth,todos,schedules}/  REST Route Handlers
components/
  auth/  todo/  schedule/  ui/(shadcn)
lib/
  prisma.js             Prisma 싱글턴 (lib/generated/prisma 사용)
  auth/                 password, jwt, session, guard
  validation/           zod 스키마
  http.js               응답 래퍼
prisma/schema.prisma    User / Todo / Schedule
proxy.js                Next 16 proxy (구 middleware) — 경로 보호
tests/{unit,e2e}/
```

## API 요약

모든 응답은 `{ success, data|error }` 래퍼. 인증 필요 API는 401 반환 시 로그인 페이지로 리다이렉트됩니다.

- `POST /api/auth/signup` `{email, name, password}` → 쿠키 발급 + 사용자 반환
- `POST /api/auth/login` `{email, password}`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET/POST /api/todos` (필터: `status`, `priority`, `q`)
- `GET/PATCH/DELETE /api/todos/:id`
- `GET/POST /api/schedules` (기간: `from`, `to`)
- `GET/PATCH/DELETE /api/schedules/:id`

## Vercel 배포

1. GitHub 레포 연결 → Vercel 프로젝트 생성.
2. **Storage → Create Database → Postgres**로 Vercel Postgres 추가. 자동으로 `DATABASE_URL` 등 환경변수 주입됨.
3. **Environment Variables**에 `AUTH_JWT_SECRET` 추가 (Production/Preview/Development 모두). 32바이트 이상 난수 권장.
4. Node 버전: 프로젝트 Settings → General → Node.js Version을 **24.x**로 지정 (`package.json`의 `engines`도 맞춰둠).
5. **최초 마이그레이션**: 로컬에서 `DATABASE_URL=<Vercel Postgres URL> npx prisma migrate deploy` 실행하거나, 일회성 `vercel env pull` 후 진행.
6. Build Command는 기본값(`next build`)을 유지. `postinstall`에서 `prisma generate`가 실행됩니다.

## 보안 메모

- 비밀번호는 bcryptjs(cost 10)로 해시 저장.
- JWT는 HS256, 유효기간 7일, `httpOnly` + `secure`(prod) + `SameSite=Lax` 쿠키로만 전달.
- 모든 입력은 zod로 검증. 사용자별 데이터 격리는 Route Handler에서 `userId` 일치 검증으로 수행.
- `.env*`는 절대 커밋 금지 (`.env.example`만 예외로 포함).

## 제한 사항 / 향후 개선

- 캘린더는 단일 일자 선택 + 기간 포함 일정 표시 수준. 반복 일정(RRULE) 미지원.
- CSRF 보호는 `SameSite=Lax`에만 의존. 필요 시 CSRF 토큰 추가 권장.
- 서버리스 환경의 Prisma 커넥션 풀링은 Vercel Postgres 기본 Data Proxy/Pooler 권장.
