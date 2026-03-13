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
- IP 위치 정보 조회 (국가, 도시, ASN/ISP)
- Redis TTL 캐싱으로 성능 최적화 (캐시 사용 시 권장)

### 🔎 IP 검색 (IP Lookup)

- 입력한 IPv4/IPv6 주소 조회
- 국가/지역/도시/시간대/좌표 정보 표시
- ASN/ISP 정보 요약 표시
- 좌표가 있으면 OpenStreetMap iframe으로 위치를 지도에서 확인
- IP 기반 위치 정보이므로 실제 위치와 다를 수 있음

> **지도 임베드 참고**: 조회 결과에서 위·경도 좌표가 확인되면, 아래 형식의 URL을 iframe으로 자동 렌더링합니다.  
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

- **API Client**: undici
- **Weather**: Open-Meteo
- **Calendar Holiday API**: apis.data.go.kr (공공데이터포털)
- **Cache**: Redis (ioredis, 캐시 사용 시 권장)

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

| 변수                   | 설명                                    | 필수               | 예시                           |
| ---------------------- | --------------------------------------- | ------------------ | ------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL (robots/sitemap)        | 아니오             | `https://tools.yourdomain.com` |
| `GEO_API_BASE`         | IP Geo API 베이스 URL                   | 예                 | `https://geo.yourdomain.com`   |
| `PUBLIC_DATA_API_KEY`  | apis.data.go.kr 서비스키(캘린더/공휴일) | 예(캘린더 사용 시) | `...`                          |
| `REDIS_URL`            | Redis 연결 문자열 (캐시 사용 시 권장)   | 아니오             | `redis://localhost:6379`       |
| `REDIS_PREFIX`         | Redis 키 프리픽스 (캐시 사용 시 권장)   | 아니오             | `tools-hub`                    |

> `PUBLIC_DATA_API_KEY`는 공공데이터포털(apis.data.go.kr) 서비스키를 사용합니다.  
> (운영 환경에서는 `.env.production` 또는 k8s ConfigMap/Secret로 주입하는 것을 권장)

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

### Lint

```bash
# 코드 검사
pnpm lint

# 자동 수정
pnpm lint:fix
```

### Docker

```bash
# Docker 이미지 빌드 및 실행
pnpm docker

# 또는 개별 실행
pnpm docker:build  # 이미지 빌드
pnpm docker:run    # 컨테이너 실행
pnpm docker:stop   # 컨테이너 중지
```

컨테이너가 실행되면 http://localhost:3000 에서 접근할 수 있습니다.

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

### Vercel (권장)

가장 쉬운 배포 방법은 Next.js 제작자인 Vercel을 사용하는 것입니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tools-hub)

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참조하세요.

## 📄 라이선스

MIT

## 🤝 기여

이슈와 PR을 환영합니다!
