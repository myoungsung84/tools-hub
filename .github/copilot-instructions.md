# Copilot 저장소 전용 지침 (tools-hub)

## 언어/리뷰 규칙

- 모든 답변, 코드 코멘트, PR 리뷰는 한국어로 작성합니다.
- PR 리뷰도 반드시 한국어로 작성합니다.
- 리뷰는 우선 아래를 확인합니다.
  - 구조/책임 분리
  - 타입 안정성 (`any`, 불필요한 optional, 과한 타입 단언, 검증 없는 외부 입력)
  - 잠재적 런타임 버그
  - 성능 이슈
  - 보안 리스크
- 리뷰 서술은 가능하면 `문제 → 근거 → 개선안` 순서를 사용합니다.
- 타입 관련 리뷰에서는 특히 `any`, 느슨한 optional, `as` 남용, 검증 없는 API 입력/응답을 우선적으로 지적합니다.

## 패키지 매니저/명령 규칙

- 이 저장소 작업에서는 `pnpm`을 기본 패키지 매니저로 사용합니다.
- 의존성 설치, 개발 서버 실행, 빌드, 린트는 우선 `pnpm` 기준으로 제안합니다.
- `npm` 명령은 사용자가 명시적으로 요청했거나, 저장소 설정상 꼭 필요한 경우에만 사용합니다.
- 실행/검증 명령은 실제 `package.json`에 존재하는 스크립트 기준으로만 안내합니다.
- 저장소에 `packageManager`와 `pnpm-lock.yaml`이 있으면 이를 우선 신뢰하고, `package-lock.json`이 함께 있어도 기본 기준은 `pnpm`으로 둡니다.
- 날짜/시간 처리와 포맷은 가능하면 `dayjs`를 우선 사용합니다.
- 컬렉션 처리, debounce/throttle, 중복 제거, 데이터 변형은 가능하면 `lodash-es`를 우선 사용합니다.
- 이미 의존성에 포함된 검증된 라이브러리로 충분히 해결 가능한 경우, 같은 성격의 유틸을 새로 직접 만들기보다 기존 라이브러리 사용을 먼저 검토합니다.

## 코드베이스 구조 요약

- `src/app`은 App Router 엔트리입니다.
  - `src/app/(tools)/*/page.tsx`는 주로 라우트 엔트리와 feature page 연결 역할을 담당합니다.
  - 필요 시 메타데이터, 접근성 텍스트, 라우트 레벨 설정을 함께 둡니다.
  - API는 `src/app/api/**`에 둡니다.
- `src/features` 중심 구조가 반복됩니다.
  - feature 루트 `index.ts`에서 page UI를 re-export하는 패턴이 자주 보입니다.
  - feature 내부는 주로 `ui`, `ui/components`, `lib`, `types`, `hook`으로 분리되는 패턴이 보입니다.
- 공용 UI와 feature UI 경계:
  - 공용 재사용 UI는 `src/components/ui`, 레이아웃 공통은 `src/components/layout`.
  - 도메인 특화 UI는 `src/features/*/ui` 아래에 둡니다.

## 네이밍/파일 구성 패턴

- 파일/폴더는 kebab-case가 기본 패턴입니다. (`weather-hourly.get.ts`, `ip-lookup-page.tsx`)
- API route는 `route.ts`에서 HTTP 핸들러를 re-export하고, 실제 구현은 `*.get.ts`/`*.post.ts`로 분리하는 패턴이 보입니다.
- 외부 API 호출/데이터 소스 코드는 같은 라우트 디렉터리의 `*.source.ts`로 분리하는 패턴이 반복됩니다.
- barrel export(`index.ts`)는 feature 루트, 일부 하위 모듈(`weather/types`, `lib/server/core` 등)에서 사용됩니다. 모든 폴더에 강제하지 않습니다.

## 타입/검증/훅 패턴

- 타입은 `type` 별칭 사용이 우세하며, 계약이 큰 모델은 별도 `types` 파일로 분리합니다.
- 컴포넌트 로컬 props/state 타입은 파일 내부 인라인 타입 선언 패턴이 많습니다.
- 런타임 검증은 주로 API 계층에서 `zod` + `safeParse` 또는 `parseParams`로 처리합니다.
- 외부 입력, API params, 응답 매핑처럼 런타임 불확실성이 있는 값은 타입 선언만으로 신뢰하지 말고 검증과 함께 다룹니다.
- 공통 스키마/헬퍼는 `src/lib/shared/zod.ts`.
- API 에러 응답은 `src/lib/server/core`의 `ApiErrors`, `handleApi`, `success/failure`를 사용합니다.
- 클라이언트 훅은 feature 하위 `hook` 디렉터리에 두는 패턴이 관찰됩니다. 신규 작업은 같은 feature 주변 구조를 우선 따릅니다.

## 유틸/서버-클라이언트 분리

- `src/lib/server`: 서버 전용 유틸, API 응답/에러 처리, 파라미터 파싱, 캐시(redis) 코드.
- `src/lib/client`: `api-client`, `cn` 등 클라이언트 유틸.
- `src/lib/shared`: 공통 타입/숫자/날짜/zod 유틸. 현재 `cn`도 re-export되어 일부 feature에서 `@/lib/shared` 경유 import가 존재합니다.

## 스타일링 패턴

- Tailwind 유틸리티 클래스 중심입니다.
- 클래스 결합은 `cn`(`clsx` + `tailwind-merge`)을 사용합니다.
- 공용 UI 컴포넌트는 Radix + shadcn 스타일(`cva`, variant props) 패턴을 따릅니다.

## 구현 원칙

- 새 규칙을 발명하지 말고, 기존 feature/route의 반복 패턴을 먼저 따릅니다.
- page 파일은 얇게 유지하고, 도메인 로직은 feature 또는 API 구현 파일로 이동합니다.
- 기존 import 경로 별칭(`@/*`)과 파일 분리 결을 유지합니다.
- API를 수정하거나 추가할 때는 먼저 `src/app/api/**`의 인접 구현을 찾아 `route.ts` / `*.get.ts` / `*.post.ts` / `*.source.ts` 분리 패턴과 응답/에러 처리 방식을 맞춥니다.
- 패키지 설치/실행 명령을 제안할 때는 기본적으로 `pnpm` 명령을 사용합니다.
- API 입력 검증과 응답 처리는 가능하면 기존처럼 `parseParams`, `zod.safeParse`, `success`, `handleApi`, `ApiErrors` 재사용을 먼저 검토합니다.
- 날짜/시간, 컬렉션 유틸, debounce/throttle 같은 공통 문제는 먼저 `dayjs`, `lodash-es` 사용 가능 여부를 확인합니다.
