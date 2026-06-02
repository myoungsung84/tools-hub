# 🛠️ Tools Hub

개발자를 위한 유용한 도구 모음 웹 애플리케이션입니다.  
자주 쓰는 계산/조회 도구를 빠르게 실행하고, 결과를 한 화면에서 확인할 수 있도록 구성했습니다.

## ✨ 주요 기능

### ⏰ 시간 도구 (Time)

- 실시간 시계 표시 (12시간 형식)
- 한국어 날짜 표시
- 주요 거점 도시 세계 시간 표시

### 🌤️ 세계 날씨 (Global Weather)

- 주요 거점 도시의 실시간 날씨 조회
- 메인 도시 기준 시간별 예보 차트 제공
- 하단 보조 도시 카드로 전 세계 날씨 비교

### 🧮 나이 계산 (Age)

- 만나이/한국나이 계산
- 띠/간지 정보 제공
- 음력/절기 기준 보정

### 📅 달력 (Calendar)

- 양력/음력/절기 정보를 한 화면에서 확인
- 공휴일/기념일/잡절을 선택적으로 표시(스위치)
- 월 이동(이전/다음/오늘) + 년/월 선택 지원
- 모바일 대응 UI

### 🎯 살까 말까 결정 (Decide)

- 룰렛으로 구매 결정을 도와주는 랜덤 결정기
- 애니메이션/컨페티 효과 제공

### 🌍 IP 주소 조회 (IP)

- 사용자 IP 주소 확인
- User Agent 정보 표시
- Vercel/request headers가 제공하는 범위의 위치 정보 표시

### 🔎 IP 검색 (IP Lookup)

- 입력한 IPv4/IPv6 주소 조회
- 유효한 IP 주소 형식 확인
- 외부 위치 조회 API 연동은 추후 단계에서 지원 예정

> **지도 임베드 참고**: 조회 결과에서 위·경도 좌표가 확인되면, 아래 형식의 URL을 iframe으로 렌더링합니다.  
> 브라우저 CSP(`frame-src`)에 `https://www.openstreetmap.org`이 허용되어 있어야 합니다.  
> bbox는 `위도·경도 ± 0.1` 범위로 설정합니다.
>
> ```
> https://www.openstreetmap.org/export/embed.html?bbox={경도-0.1},{위도-0.1},{경도+0.1},{위도+0.1}&layer=mapnik&marker={위도},{경도}
> ```
>
> 예시 (위도 37.5665, 경도 126.9780):
>
> ```
> https://www.openstreetmap.org/export/embed.html?bbox=126.8780,37.4665,127.0780,37.6665&layer=mapnik&marker=37.5665,126.9780
> ```

### 🔤 글자 수 세기 (Count)

- 텍스트 길이/단어 수 통계
- 빠른 복사와 리셋

### 🧩 QR 코드 (QR)

- 입력 텍스트 기반 QR 생성
- 다운로드 지원

### 📏 유니트 컨버터 (Unit Converter)

- 길이 / 무게 / 면적 / 온도 / 데이터 / 부피 단위 변환
- 한국 생활 단위(평, 근, 돈) 지원
- 데이터 단위는 decimal(`KB/MB/GB/TB`)과 binary(`KiB/MiB/GiB/TiB`)를 함께 제공
- 선택한 카테고리의 전체 결과를 한 번에 확인 가능

### 📄 더미 텍스트 생성 (Lorem)

- 문단/문장/단어/글자 단위 생성
- 시작 단어 포함, HTML/Markdown 포맷 옵션
- 즉시 복사 및 재생성

### 🏁 동물 레이싱 (Animal Race)

- 최대 14마리 참가자 레이싱 미니 게임
- requestAnimationFrame 기반 실시간 진행/순위 반영
- 미니카 서킷 스타일 트랙 UI + 결승선 순위 표시
- 카운트다운/리더 변경/HUD/결과 패널 연출 제공

## 🛠️ 기술 스택

### Frontend

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Theme**: next-themes (다크 테마 적용)
- **Notifications**: Sonner
- **Data Fetching**: SWR (stale-while-revalidate)
- **Animation**: Framer Motion
- **Date/Time**: dayjs
- **Calendar**: @fullstackfamily/manseryeok
- **3D**: three, @react-three/fiber, three-stdlib

### Development Tools

- **Linting**: ESLint 9
- **Code Quality**:
  - eslint-plugin-simple-import-sort
  - eslint-plugin-unused-imports

### UI Libraries

- **Radix UI**: 접근성 중심의 UI 컴포넌트
  - Checkbox, Dropdown Menu, Label, Navigation Menu
  - Popover, Scroll Area, Select, Separator
  - Slot, Switch, Tabs, Tooltip

### Backend & Infra

- **Weather**: Open-Meteo
- **Calendar Holiday API**: apis.data.go.kr (공공데이터포털)
- **Cache**: Next.js fetch cache/revalidate (Weather/Calendar 외부 API)

## 📁 프로젝트 구조

```text
tools-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (tools)/            # 도구 그룹 라우팅
│   │   │   ├── animal-race/    # 동물 레이싱 페이지
│   │   │   ├── age/            # 나이 계산 페이지
│   │   │   ├── calendar/       # 캘린더 페이지
│   │   │   ├── count/          # 글자 수 세기 페이지
│   │   │   ├── decide/         # 살까 말까 결정 페이지
│   │   │   ├── home/           # 홈 페이지
│   │   │   ├── ip/             # IP 주소 조회 페이지
│   │   │   ├── ip-lookup/      # IP 검색 페이지
│   │   │   ├── lorem/          # 더미 텍스트 생성 페이지
│   │   │   ├── qr/             # QR 코드 페이지
│   │   │   ├── time/           # 시간 도구 페이지
│   │   │   ├── unit-converter/ # 유니트 컨버터 페이지
│   │   │   └── weather/        # 세계 날씨 페이지
│   │   ├── api/                # API Routes
│   │   │   ├── calendar/       # 캘린더(공휴일/기념일/잡절) API
│   │   │   ├── ip/             # IP 주소 API
│   │   │   ├── weather/        # 날씨 API
│   │   │   └── health/         # 헬스 체크
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── robots.ts           # robots.txt 생성
│   │   ├── sitemap.ts          # sitemap 생성
│   │   └── globals.css         # 전역 스타일
│   ├── components/
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   └── ui/                 # shadcn/ui 컴포넌트
│   ├── features/               # 기능별 모듈
│   │   ├── animal-race/
│   │   ├── age/
│   │   ├── calendar/
│   │   ├── decide/
│   │   ├── home/
│   │   ├── ip/
│   │   ├── ip-lookup/
│   │   ├── lorem/
│   │   ├── qr/
│   │   ├── text-count/
│   │   ├── time/
│   │   ├── unit-converter/
│   │   └── weather/
│   └── lib/                    # 공통 유틸리티
│       ├── client/
│       ├── server/
│       └── shared/
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 20 이상
- pnpm 10.28.2 이상

### 설치

```bash
# 의존성 설치
pnpm install
```

### 환경 변수

다음 환경 변수를 설정할 수 있습니다.

| 변수                     | 설명                                                   | 필수               | 예시                           |
| ------------------------ | ------------------------------------------------------ | ------------------ | ------------------------------ |
| `NEXT_PUBLIC_SITE_URL`   | 사이트 기본 URL (metadata/robots/sitemap). 미설정 시 Vercel URL 또는 localhost를 사용합니다. | 아니오             | `https://tools.yourdomain.com` |
| `DATA_GO_KR_SERVICE_KEY` | apis.data.go.kr 서비스키(캘린더/공휴일)                | 예(캘린더 사용 시) | `...`                          |

> `DATA_GO_KR_SERVICE_KEY`는 공공데이터포털(apis.data.go.kr) 서비스키를 사용합니다.  
> Vercel에서는 Project Settings > Environment Variables에 필요한 값을 등록하세요.
> 날씨와 캘린더 외부 API 응답은 Next.js fetch cache/revalidate를 사용합니다.
> 기존 로컬 또는 self-hosted 배포 파일에 실제 서비스키를 넣어 사용한 적이 있다면 키 회전을 권장합니다.

### Vercel 배포

1. Vercel에서 저장소를 연결합니다.
2. Framework Preset은 Next.js를 사용합니다.
3. Install Command는 `pnpm install --frozen-lockfile`, Build Command는 `pnpm build`를 사용합니다.
4. 필요한 환경 변수를 Project Settings > Environment Variables에 등록합니다.
5. Preview 배포에서 주요 페이지와 API를 확인한 뒤 Production으로 배포합니다.

IP 조회는 현재 요청 헤더 기반으로 동작합니다. Vercel이 제공하는 geo header가 없으면 위치 정보는 표시되지 않습니다.

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 http://localhost:3000 을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

Vercel 배포에서는 `pnpm build`를 사용하며, 런타임 서버는 Vercel이 관리합니다.

### Lint

```bash
# 코드 검사
pnpm lint

# 타입 검사
pnpm typecheck

# 자동 수정
pnpm lint:fix
```

### E2E QA (Playwright)

실행 방법:

```bash
# Playwright 브라우저 설치 (최초 1회)
pnpm exec playwright install chromium

# E2E 실행
pnpm qa:e2e

# 브라우저를 보면서 실행
pnpm qa:e2e:headed
```

결과 확인:

- 요약: `test-results/qa-summary.md`
- 실패 시에만 screenshot / trace / video 등 Playwright artifact 생성

## 🎨 UI 컴포넌트

이 프로젝트는 shadcn/ui를 사용합니다. 새로운 컴포넌트를 추가하려면:

```bash
npx shadcn@latest add [component-name]
```

## 📝 개발 가이드

### 새로운 도구 추가하기

1. `src/features/` 아래에 새 기능 폴더 생성
2. `src/app/(tools)/` 아래에 새 라우트 생성
3. feature 전용 UI는 `src/features/<feature>/ui` 아래에 두고, 재사용 가능한 조각만 `ui/components`로 분리
4. 비즈니스 로직/상수/타입/검증은 `lib`, `types`, `schema` 성격에 맞게 분리

### 코드 스타일

- **Import 순서**: eslint-plugin-simple-import-sort에 의해 자동 정렬
- **미사용 Import**: eslint-plugin-unused-imports에 의해 자동 제거
- **컴포넌트**: React Server Components 우선 사용
- **클라이언트 컴포넌트**: 필요한 경우에만 `use client` 지시어 사용
- **Feature 구조**: page는 얇게 유지하고, 기능 구현은 `src/features/*` 중심으로 구성
- **파일 네이밍**: 파일/폴더는 kebab-case 기준, feature 내부 파일은 가능한 한 기능 접두를 유지
- **라이브러리 우선 사용**: 날짜/시간은 dayjs, 컬렉션/변형 유틸은 lodash-es를 우선 검토

## 🌐 배포

### Vercel

이 프로젝트는 Vercel 배포를 기본 기준으로 둡니다. 배포 전 `pnpm lint`, `pnpm typecheck`, `pnpm build`를 실행해 확인합니다.

## 📄 라이선스

MIT

## 🤝 기여

이슈와 PR을 환영합니다!
