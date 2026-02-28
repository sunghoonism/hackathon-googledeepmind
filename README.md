# K-Pilgrimage Assistant (K-드라마 성지순례 도우미)
> Gemini 해커톤 서울 2026 출품작 - 구글 딥마인드 주최

## 📌 프로젝트 개요 (Overview)
K-드라마 팬들을 위해 좋아하는 드라마 제목만 입력하면, **AI가 추천하는 주요 촬영지 및 1일 당일치기 투어 동선(Itinerary)을 자동으로 생성**해주는 서비스입니다.
해커톤의 "Speed Over Perfection" 및 "Mock Data First" 규칙을 준수하여 5시간 내에 빠르고 직관적으로 완성된 최소 기능 제품(MVP)입니다.

### 🎯 핵심 목표
- **간단하고 예쁜 UI/UX**: 복잡한 회원가입이나 옵션 선택 없이 검색 한 번으로 결과를 제공.
- **빠른 시각적 피드백**: Skeleton UI, Toast 알림 등.
- **안전한 Error Fallback**: API 장애가 발생해도 앱이 죽지 않고 미리 준비된 "Mock Data (눈물의 여왕)"를 대신 보여주어 사용자 경험 유지.

---

## 🛠 사용된 기술 스택 (Tech Stack)
- **프레임워크**: Next.js (App Router), React, TypeScript
- **스타일링**: Tailwind CSS
- **UI 라이브러리**: shadcn/ui (Button, Input, Card, Skeleton, Toast 등), Lucide-React
- **지도 연동**: `@react-google-maps/api` (Google Maps API)
- **AI 연동**: `@google/genai` (Gemini 2.5 Flash API - JSON Schema Response)

---

## 🚀 빠른 시작 (Getting Started)

### 1. 환경 변수 설정
프로젝트 루트 경로에 `.env.local` 파일을 생성하고 다음 API 키를 설정합니다.
(API 키들은 구글 디벨로퍼 콘솔, 구글 AI Studio에서 발급받을 수 있습니다.)

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 사용 방법
1. 브라우저에서 `http://localhost:3000` 접속.
2. 메인 화면 중앙의 검색창에 좋아하는 K-드라마 제목(예: "도깨비", "사랑의 불시착") 입력 후 검색.
3. 로딩(탐색 중)이 끝나면 좌측엔 Google Maps 위에 마커가, 우측엔 추천 동선 스케줄이 타임라인 뷰로 렌더링됩니다.

---

## 📂 프로젝트 핵심 구조
```text
📦hackathon-googledeepmind
 ┣ 📂app
 ┃ ┣ 📂api               # Next.js API Routes 백엔드 서버
 ┃ ┃ ┗ 📂generate-route  # Gemini 연동 및 JSON Schema 생성 로직
 ┃ ┣ 📜layout.tsx        # 글로벌 레이아웃 (Toaster Provider)
 ┃ ┗ 📜page.tsx          # 메인 페이지 (검색 Hero + Dashboard 통합)
 ┣ 📂components          
 ┃ ┣ 📂ui              # shadcn/ui 기반 컴포넌트 코드 모음
 ┃ ┗ 📜map-view.tsx      # Google Maps API를 사용해 다중 마커 및 중앙 계산을 처리하는 지도 뷰
 ┣ 📂lib
 ┃ ┣ 📜mock-data.ts      # (해커톤 룰 고려) API 장애 혹은 Fallback 시 출력할 하드코딩 예비 데이터
 ┃ ┗ 📜utils.ts          # 스타일 관리를 위한 tailwind-merge 유틸리티
 ┣ 📜tailwind.config.ts
 ┗ 📜...
```

---

## 🔒 Error Handling 전략 (해커톤 특화)
- **AI 응답 크래시 방지**: `try-catch` 블록으로 `/api/generate-route`를 감싸 API Key 누락이나 Gemini의 응답 파싱 에러(JSON 형태가 아닐 때 등) 발생 시 무조건 HTTP 500 내장 에러가 아닌 정상 `200 OK`와 함께 `mock-data.ts`의 값으로 안전하게 회피(Fallback) 하도록 설계되었습니다.
- **사용자 안내**: 오류 상황에서도 프론트엔드가 이를 감지하여 사용자에게는 "API 에러 - 기본 예제 데이터로 대체합니다"와 같은 부드러운 토스트 알림을 띄웁니다.
