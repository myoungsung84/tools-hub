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

### 🌍 IP 주소 조회 / IP 검색 (IP)

- 내 IP 주소 및 상세 위치·네트워크 정보 확인
- `/ip`는 내 IP 확인 전용, `/ip-lookup`은 임의의 IPv4/IPv6 주소 검색 전용
- 기본 provider는 [ipwho.is](https://ipwho.is)이며, 로컬/환경에 따라 403이 발생하면 서버에서 [ipapi.co](https://ipapi.co) fallback provider를 사용
- 위치·ISP·타임존 정보 제공 (API Key 불필요)
- IP 단위 24시간 서버 메모리 TTL 캐시 적용
- 위·경도가 있으면 OpenStreetMap embed 지도 표시 (API Key 불필요)
- 브라우저에서 geo provider를 직접 호출하지 않고, Next.js 서버 API(`/api/ip`)에서만 호출합니다

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

- **Framework**: Next.js (App Router)
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

### Analytics

- **Vercel Analytics**: 사용 (페이지뷰 및 이벤트 수집)
- **Vercel Speed Insights**: 미사용 — Hobby 플랜에서 프로젝트 1개 제한이며, 현재 다른 프로젝트(onnuri-center)에서 사용 중

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

- **Weather**: Open-Meteo (API Key 불필요)
- **Calendar Holiday API**: apis.data.go.kr (공공데이터포털)
- **IP Geo**: [ipwho.is](https://ipwho.is) 기본 사용, 로컬/환경 403 시 [ipapi.co](https://ipapi.co) fallback 사용 (API Key 불필요, 서버에서만 호출)
- **IP 지도**: OpenStreetMap embed iframe (API Key 불필요)
- **Cache**: Next.js fetch cache/revalidate + 서버 메모리 TTL 캐시 (IP geo 24시간)
- **배포**: Vercel

## 📁 프로젝트 구조

```text
tools-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (tools)/            # 도구 그룹 라우팅
│   │   │   ├── animal-race/
│   │   │   ├── age/
│   │   │   ├── calendar/
│   │   │   ├── count/
│   │   │   ├── decide/
│   │   │   ├── home/
│   │   │   ├── ip/             # 내 IP 확인 페이지
│   │   │   ├── ip-lookup/      # IP 검색 페이지
│   │   │   ├── lorem/
│   │   │   ├── qr/
│   │   │   ├── time/
│   │   │   ├── unit-converter/
│   │   │   └── weather/
│   │   ├── api/                # API Routes
│   │   │   ├── calendar/
│   │   │   ├── ip/             # GET /api/ip, GET /api/ip?ip=X
│   │   │   ├── weather/
│   │   │   └── health/
│   │   ├── layout.tsx
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── ip/
│   │   │   ├── lib/            # ipwhois.ts(ipwho.is → ipapi.co fallback), ip-map.ts
│   │   │   ├── types/
│   │   │   └── ui/             # ip-page.tsx, ip-map-card.tsx
│   │   └── ...
│   └── lib/
│       ├── client/
│       ├── server/             # ttl-cache.ts, ip-utils.ts, core/
│       └── shared/
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 20 이상
- pnpm 10.28.2 이상

### 설치

```bash
pnpm install
```

### 환경 변수

`.env.example`을 참고해 `.env.local`을 작성하세요.

| 변수                     | 설명                                                                           | 필수               |
| ------------------------ | ------------------------------------------------------------------------------ | ------------------ |
| `NEXT_PUBLIC_SITE_URL`   | 사이트 기본 URL (metadata/robots/sitemap). 미설정 시 Vercel URL 또는 localhost | 아니오             |
| `DATA_GO_KR_SERVICE_KEY` | apis.data.go.kr 서비스키 (캘린더/공휴일)                                       | 예(캘린더 사용 시) |

> **IP Geo**: 기본 provider는 ipwho.is입니다. 로컬/환경에 따라 403이 발생할 수 있어 서버 API(`/api/ip`)에서 ipapi.co fallback provider를 사용합니다. API Key는 필요 없습니다.  
> **OpenStreetMap embed**: API Key 불필요.  
> **Vercel 배포**: Project Settings → Environment Variables에 필요한 값을 등록하세요.

### Vercel 배포

1. Vercel에서 저장소를 연결합니다.
2. Framework Preset: **Next.js**
3. Install Command: `pnpm install --frozen-lockfile`
4. Build Command: `pnpm build`
5. 필요한 환경 변수를 Project Settings → Environment Variables에 등록합니다.
6. Preview 배포에서 주요 페이지와 API를 확인한 뒤 Production으로 배포합니다.

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 http://localhost:3000 을 열어 확인하세요.

### 빌드 / 검증

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

### E2E QA (Playwright)

```bash
# Playwright 브라우저 설치 (최초 1회)
pnpm exec playwright install chromium

pnpm qa:e2e
pnpm qa:e2e:headed
```

결과: `test-results/qa-summary.md`

## 🎨 UI 컴포넌트

이 프로젝트는 shadcn/ui를 사용합니다.

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
- **파일 네이밍**: 파일/폴더는 kebab-case 기준

## 📄 라이선스

MIT

## 🤝 기여

이슈와 PR을 환영합니다!
