# AGENTS.md (tools-hub 작업 지침)

## 1) 작업 시작 전 필수 확인

- 아래 경로를 먼저 읽고, 현재 반복 패턴을 파악한 뒤 수정합니다.
  - `src/app`
  - `src/features`
  - `src/components`
  - `src/lib`
  - `.github`
  - `package.json`
  - `pnpm-lock.yaml`
  - 필요 시 루트 설정 파일(`tsconfig.json`, `next.config.ts`, `eslint.config.mjs`)
- 기본 작업 범위에서 `deploy/**`, `docker/**`, `scripts/**`는 제외합니다.

## 2) 의사결정 원칙

- 새 규칙을 발명하지 말고, 현재 코드에서 더 많이 반복되는 패턴을 우선합니다.
- 패턴이 섞이면 아래 우선순위로 판단합니다.
  - 더 많이 반복되는 패턴
  - 더 최근 구조로 보이는 패턴
  - 더 일관된 패턴
  - 더 넓게 재사용되는 패턴
- 구조 변경은 최소화하고, 현재 네이밍/타입/폴더 결을 유지합니다.
- 공용화/추상화는 실제 중복 근거가 있을 때만 적용합니다.
- 날짜/시간 처리와 포맷은 가능하면 `dayjs` 사용을 먼저 검토합니다.
- 컬렉션 처리, debounce/throttle, 중복 제거, 데이터 변형은 가능하면 `lodash-es` 사용을 먼저 검토합니다.
- 이미 의존성에 포함된 검증된 라이브러리로 해결 가능한 문제는, 같은 성격의 유틸을 새로 직접 만들기보다 기존 라이브러리 사용을 우선 검토합니다.

## 3) 구조 판단 기준

- 라우트와 feature 책임 분리:
  - `src/app/(tools)/*/page.tsx`는 주로 라우트 엔트리, 메타데이터, 접근성 텍스트, 조립 역할을 담당합니다.
  - 실제 UI/상태/도메인 로직은 `src/features/*/ui`로 배치하는 패턴이 많이 보입니다.
- page와 feature page 관계:
  - 다수 페이지가 `@/features/*`(주로 `index.ts`)에서 feature page를 가져와 렌더링합니다.
  - 일부 예외(직접 경로 import)가 있어도 신규 작업은 기존 주변 코드 패턴을 우선 맞춥니다.
- 공용 UI vs feature UI 경계:
  - `src/components/ui`, `src/components/layout`: 범용 재사용 컴포넌트.
  - `src/features/*/ui`: 도메인 전용 화면/컴포넌트.
- 유틸 위치:
  - `src/lib/server`: API 처리, 서버 유틸, cache.
  - `src/lib/client`: API client, `cn`.
  - `src/lib/shared`: 공통 타입/유틸/zod.
- feature 내부 구성:
  - 주로 `ui`, `ui/components`, `lib`, `types`, `hook` 패턴이 관찰됩니다.
  - 신규 작업은 같은 feature 주변 구조를 먼저 따릅니다.
- API route 구성:
  - API는 `src/app/api/**` 아래에 둡니다.
  - `route.ts`는 HTTP 핸들러 re-export.
  - 실제 핸들러는 `*.get.ts`/`*.post.ts`.
  - 외부 연동/소스 접근은 `*.source.ts`.
- `index.ts` 사용:
  - feature 루트와 일부 하위 모듈에서만 선택적으로 사용.
  - 무조건 추가하지 말고, 같은 영역의 기존 패턴을 따릅니다.

## 4) API 작업 규칙

- API 기본 위치는 `src/app/api/**`입니다.
- 현재 반복되는 API 파일 구성:
  - `route.ts`: 라우트 엔트리 파일. HTTP 메서드를 실제 핸들러 파일에서 re-export.
  - `*.get.ts`, `*.post.ts`: 입력 파싱/검증, 필요 시 source 호출, 최종 응답 조립을 담당하는 핸들러 구현.
  - `*.source.ts`: 외부 API 호출, 데이터 소스 접근, 캐시 적용, 소스 응답 정규화.
  - `_shared/*`: 같은 API 도메인 내부에서 공통으로 쓰는 fetch/변환 유틸.
- API 책임 분리:
  - `route.ts`는 얇게 유지하고 엔트리 책임만 둡니다.
  - 입력 파싱/검증과 최종 응답 payload 조립은 `*.get.ts`/`*.post.ts`에서 처리합니다.
  - 외부 연동/IO/캐시 로직은 `*.source.ts`로 분리하는 패턴이 우세합니다.
  - `*.source.ts`는 가능하면 데이터 접근/정규화에 집중하고, `NextResponse` 같은 라우트 응답 객체는 핸들러 레이어에서 마무리합니다.
  - 공통 응답/에러/파라미터 처리는 `src/lib/server/core` 유틸(`handleApi`, `success`, `ApiErrors`, `parseParams`)을 우선 사용합니다.
- 입력 검증 규칙(현재 관찰 패턴):
  - query/search params: `parseParams(zodSchema, Object.fromEntries(searchParams), ...)` 패턴.
  - body(JSON): body가 필요한 요청에서는 `req.json()`을 `try/catch`로 읽고 `zod.safeParse`로 검증합니다.
  - 검증 실패는 `ApiErrors.badRequest(...)`로 처리.
  - 외부 입력은 타입 선언만으로 신뢰하지 않고 런타임 검증을 함께 둡니다.
- 응답/에러 처리 규칙:
  - 성공 응답은 `success(data, init?)`로 `{ success: true, data }` 포맷 반환.
  - 핸들러 export는 `export const GET/POST = handleApi(handler, { ... })` 패턴이 기본.
  - 예외는 `ApiErrors.badRequest/upstream/internal` 등으로 throw하고, `handleApi`가 `failure(...)`로 변환.
  - 캐시 제어 같은 응답 헤더가 필요하면 `success(..., { headers: ... })`를 사용.
- 캐시/서버 유틸 사용:
  - Redis 캐시는 `src/lib/server/cache`의 `cacheGetJson`, `cacheSetJson` 재사용이 기본.
  - 캐시 키/TTL/in-flight dedupe(`Map`)는 주로 `*.source.ts`에 둡니다.
  - 핸들러 레이어는 캐시 세부 구현보다 입력/응답 책임에 집중합니다.
- 신규 API 추가 판단 기준:
  - 먼저 `src/app/api`의 유사 API(weather/ip/calendar/health) 구조를 찾아 맞춥니다.
  - 단순 API는 `route.ts + *.get.ts`(또는 `*.post.ts`)로 시작합니다.
  - 외부 연동/캐시/소스 정규화가 생기면 `*.source.ts`를 분리합니다.
  - 네이밍, 응답 포맷, 검증 방식, 에러 처리 유틸은 인접 API 패턴과 동일하게 맞춥니다.

## 5) 타입/클라이언트/하이드레이션 판단

- 타입 선언:
  - `type` 별칭이 우세합니다.
  - 큰 계약 타입은 별도 `types` 파일, 로컬 props는 파일 내부 타입 선언 경향이 큽니다.
  - `any`, 불필요하게 넓은 optional, 과한 타입 단언(`as`)은 지양하고 더 좁은 타입과 검증 흐름을 우선합니다.
  - 외부 입력, API params, 응답 매핑처럼 런타임 불확실성이 있는 값은 타입 선언만으로 끝내지 말고 검증과 함께 다룹니다.
- 런타임 검증:
  - API 계층에서 `zod`, `safeParse`, `parseParams` 사용이 반복됩니다.
- hydration 가능성 있는 로직:
  - 시간/브라우저 API 의존 로직은 client 컴포넌트 또는 client hook(`useEffect`)에서 처리합니다.
  - 실제로 시간 동기화 훅(`useSyncedNow`)과 `dynamic = 'force-dynamic'` 페이지가 존재합니다.
- 클라이언트 컴포넌트 최소화:
  - route/page는 기본적으로 서버 컴포넌트로 두고, 상호작용이 필요한 feature UI에만 `'use client'`를 붙이는 경향이 보입니다.

## 6) 실행/검증 명령 원칙

- 실행/검증 명령은 반드시 `package.json` 기준으로만 사용합니다.
- 패키지 매니저 관련 작업은 기본적으로 `pnpm` 기준으로 진행하고, `npm`은 사용자가 명시적으로 요청한 경우에만 사용합니다.
- 이 저장소의 스크립트:
  - `pnpm dev`
  - `pnpm build`
  - `pnpm start`
  - `pnpm lint`
  - `pnpm lint:fix`
- `packageManager`는 `pnpm@10.28.2`이며 `pnpm-lock.yaml`이 존재합니다. 관련 작업은 pnpm 기준으로 맞춥니다.

## 7) UI/UX 수정 원칙

- UI 규칙을 새로 만들지 말고, 기존 컴포넌트 조합 방식(공용 `components/ui` + feature 전용 UI)을 따릅니다.
- 클래스 조합은 기존처럼 Tailwind + `cn` 패턴을 우선합니다.
- 공용 컴포넌트 변경은 영향 범위를 먼저 확인하고, feature 단위 변경으로 해결 가능한지 우선 검토합니다.
- 날짜/시간, debounce/throttle, 데이터 변형 같은 공통 문제는 먼저 `dayjs`, `lodash-es`로 일관되게 풀 수 있는지 확인합니다.

## 8) 네이밍/일관성

- 파일/폴더 네이밍은 kebab-case를 유지합니다.
- API 파일명은 역할이 드러나게 `*.get.ts`, `*.post.ts`, `*.source.ts` 패턴을 유지합니다.
- import alias(`@/*`)와 기존 배럴 export 사용 범위를 유지합니다.

## 9) 작업 후 체크리스트

- [ ] 수정한 코드가 인접 feature/route의 기존 구조를 따르는가
- [ ] page 파일이 과도하게 비대해지지 않았는가(도메인 로직이 feature/lib로 분리되었는가)
- [ ] 공용 UI와 feature UI 경계가 유지되는가
- [ ] 타입이 느슨해지지 않았는가(`any`, 불필요한 optional, 과한 `as` 단언 여부)
- [ ] API 입력 검증/응답/에러 처리 패턴(`zod`, `parseParams`, `success`, `handleApi`, `ApiErrors`)을 유지했는가
- [ ] 클라이언트 전용 로직이 서버 컴포넌트로 새어 나오지 않았는가
- [ ] 네이밍/파일 위치/index.ts 사용이 주변 코드와 일관적인가
- [ ] 검증 명령을 `package.json` 스크립트 기준으로 실행했는가
- [ ] 패키지 매니저/실행 명령이 `pnpm` 기준으로 유지되었는가
- [ ] 날짜/시간/공통 유틸 구현에서 `dayjs`, `lodash-es` 활용 가능성을 먼저 검토했는가
- [ ] `route.ts` / `*.get.ts|*.post.ts` / `*.source.ts` 분리가 주변 API와 일관적인가
- [ ] 입력 검증이 타입 선언만으로 끝나지 않았는가(`parseParams`, `safeParse` 적용 여부)
- [ ] 성공/실패 응답 포맷이 `success`/`handleApi`/`ApiErrors` 패턴과 일치하는가
- [ ] 외부 연동/데이터 접근/캐시가 source 계층 또는 기존 패턴에 맞게 분리되었는가
- [ ] `src/lib/server/core`, `src/lib/server/cache`로 재사용 가능한 로직을 중복 구현하지 않았는가
