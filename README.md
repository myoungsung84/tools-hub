# 🛠️ Tools Hub

개발자를 위한 유용한 도구 모음 웹 애플리케이션입니다.

## ✨ 주요 기능

### ⏰ 시간 도구 (Time)
- 실시간 시계 표시 (12시간 형식)
- 한국어 날짜 표시
- 전국 주요 도시 날씨 정보 (서울, 부산, 인천, 대구, 광주, 대전, 울산, 제주)

### 🌍 IP 주소 조회 (IP)
- 사용자 IP 주소 확인
- User Agent 정보 표시
- IP 위치 정보 조회 (국가, 도시, ISP)
- TTL 캐싱으로 성능 최적화

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Theme**: next-themes (다크 모드 지원)
- **Notifications**: Sonner
- **Data Fetching**: SWR (stale-while-revalidate)

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

## 📁 프로젝트 구조

```
tools-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (tools)/           # 도구 그룹 라우팅
│   │   │   ├── ip/            # IP 주소 조회 페이지
│   │   │   └── time/          # 시간 도구 페이지
│   │   ├── api/               # API Routes
│   │   │   ├── ip/            # IP 주소 API
│   │   │   └── weather/       # 날씨 API
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   ├── page.tsx           # 홈 페이지
│   │   └── globals.css        # 전역 스타일
│   ├── components/
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   └── ui/                # shadcn/ui 컴포넌트
│   ├── features/              # 기능별 모듈
│   │   ├── ip/                # IP 주소 관련 기능
│   │   └── time/              # 시간 관련 기능
│   │       ├── components/    # 시간 기능 컴포넌트
│   │       ├── constants/     # 상수 정의
│   │       ├── hook/          # 커스텀 훅
│   │       ├── mappers/       # 데이터 매퍼
│   │       ├── types/         # 타입 정의
│   │       └── ui/            # UI 컴포넌트
│   ├── hooks/                 # 커스텀 훅
│   └── lib/                   # 공통 유틸리티
│       ├── client/            # 클라이언트 유틸리티
│       ├── server/            # 서버 유틸리티
│       │   ├── core/          # API 핸들러 코어
│       │   ├── cache.ts       # TTL 캐시
│       │   └── ip-utils.ts    # IP 유틸리티
│       └── shared/            # 공유 유틸리티
├── public/                    # 정적 파일
└── components.json            # shadcn/ui 설정
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

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

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

## 🎨 UI 컴포넌트

이 프로젝트는 [shadcn/ui](https://ui.shadcn.com/)를 사용합니다. 새로운 컴포넌트를 추가하려면:

```bash
npx shadcn@latest add [component-name]
```

## 📝 개발 가이드

### 새로운 도구 추가하기

1. `src/features/` 아래에 새 기능 폴더 생성
2. `src/app/(tools)/` 아래에 새 라우트 생성
3. 필요한 컴포넌트와 로직 구현

### 코드 스타일

- **Import 순서**: eslint-plugin-simple-import-sort에 의해 자동 정렬
- **미사용 Import**: eslint-plugin-unused-imports에 의해 자동 제거
- **컴포넌트**: React Server Components 우선 사용
- **클라이언트 컴포넌트**: 필요한 경우에만 'use client' 지시어 사용

## 🌐 배포

### Vercel (권장)

가장 쉬운 배포 방법은 Next.js 제작자인 Vercel을 사용하는 것입니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tools-hub)

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참조하세요.

## 📄 라이선스

MIT

## 🤝 기여

이슈와 PR을 환영합니다!
