---
trigger: always_on
---

# Hackathon Survival Rules (CRITICAL)

너는 지금 5시간 안에 무조건 동작하는 결과물(MVP)을 내야 하는 해커톤에 참여 중이다. 
아래의 규칙을 **무조건(ABSOLUTELY)** 준수하여 코드를 작성하고 계획을 세워라.

## 1. 🚀 Speed Over Perfection (속도 > 완벽함)
- **오버엔지니어링 절대 금지:** 클린 코드, 완벽한 폴더 구조, 재사용성을 위한 과도한 컴포넌트 분리는 사치다. 필요하다면 한 파일(`page.tsx`)에 다 때려 넣어도 좋다.
- **가장 단순한 방법 선택:** 복잡한 알고리즘이나 상태 관리 라이브러리(Redux, Zustand 등)를 절대 도입하지 마라. `useState`와 `Context API`만 사용해라.

## 2. 🚫 Strict Constraints (절대 하지 말아야 할 것)
- **DB 구축 금지:** Prisma, Supabase, Firebase 등의 DB 연동을 시도하지 마라. 모든 상태는 메모리(React State)나 LocalStorage에만 저장한다.
- **인증(Auth) 금지:** NextAuth 등 로그인 구현을 하지 마라.
- **새로운 패키지 설치 최소화:** `npm install`을 제안하기 전에, 이미 있는 Next.js, Tailwind, shadcn/ui 만으로 해결할 수 있는지 먼저 2번 고민해라. 꼭 설치해야 한다면 내 허락을 받아라.

## 3. 🎨 UI/UX & Development Workflow
- **Mock Data First (필수):** API 연동 로직을 짜기 전에, **무조건 하드코딩된 Mock JSON 데이터**를 변수로 선언해서 UI가 화면에 예쁘게 나오는지부터 확인해라. UI가 완벽해지면 그때 실제 API(LLM/Google Maps)를 연결해라.
- **shadcn/ui 적극 활용:** UI 컴포넌트를 직접 CSS로 짜지 말고, shadcn/ui 컴포넌트(Card, Button, Input, Skeleton 등)를 조합해서 빠르게 만들어라.

## 4. 🛠 Error Handling (에러 대처법)
- 에러가 발생해서 2번 이상 디버깅을 시도했는데도 안 고쳐지면, **즉시 해당 기능의 구현을 포기하고 하드코딩된 우회 방법(Fallback)을 제시**해라.
- 사용자가 에러를 겪지 않게, 에러가 나면 "현재 트래픽이 많습니다. 잠시 후 다시 시도해주세요" 같은 토스트 메시지만 띄우고 앱이 크래시되지 않게 해라.

## 5. 🤖 API (LLM & Maps)
- K-드라마 촬영지 정보는 LLM(Gemini/OpenAI)에게 프롬프트를 보내서 JSON 형태로 받아오는 방식으로 퉁친다. 
- 구조화된 데이터(JSON) 응답을 강제하는 프롬프트를 짜서 파싱 에러를 막아라.

이 규칙을 이해했다면, 작업 시 항상 이 규칙을 최우선으로 적용해라.