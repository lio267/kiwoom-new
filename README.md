# Kiwoom Securities Mock Trading Chart

Next.js(App Router) 기반으로 Kiwoom Securities REST API 모의투자 환경과 연동되는
주식 차트 웹 애플리케이션 골격입니다. PRD 요구사항에 맞춰 **보안 프록시 계층**을
구성하고, **클라이언트에는 어떠한 가상 데이터도 주입하지 않습니다.**\
실제 모의투자 API 자격 증명을 연결했을 때만 차트가 렌더링됩니다.

## 1. 사전 준비

1. 모의투자 환경용 Kiwoom REST API 자격 증명 확보
2. (선택) Upstash Redis 프로젝트를 생성하여 속도 제한 키 발급
3. 프로젝트 루트에 `.env.local` 생성 후 아래 항목 정의

```bash
KIWOOM_API_BASE_URL="https://openapi.koreainvestment.com:9443"  # 예시
KIWOOM_API_APP_KEY="YOUR_APP_KEY"
KIWOOM_API_APP_SECRET="YOUR_APP_SECRET"
# 액세스 토큰을 프록시 레이어에서 직접 갱신하도록 구현할 수 있습니다.
# 일단은 수동으로 발급한 토큰을 주입하는 방식만 제공합니다.
KIWOOM_API_ACCESS_TOKEN="YOUR_ACCESS_TOKEN"
# 요청 TR ID는 모의/실거래 환경, 조회 종류에 따라 기입해주세요.
KIWOOM_API_TR_ID="FHKST03010100"

# @upstash/ratelimit 를 사용하려면 아래 환경 변수가 필요합니다.
# 설정하지 않으면 속도 제한은 비활성화된 상태로 동작합니다.
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="YOUR_UPSTASH_TOKEN"
```

> ❗️ 환경 변수가 설정되지 않은 상태에서 `/api/stock/chart/[symbol]` 엔드포인트를 호출하면
> **503(Service Unavailable)** 과 함께 설정 방법이 담긴 메시지를 반환합니다.

## 2. 설치 및 실행

```bash
pnpm install # 또는 npm install / yarn install
pnpm dev     # 개발 서버 실행 (http://localhost:3000)
```

Tailwind CSS, Zustand, Lightweight Charts가 이미 설정되어 있으며
클라이언트 렌더링은 `next/dynamic`으로 강제 CSR로 구성되어 있습니다.

## 3. 아키텍처 개요

- **API 프록시:** `app/api/stock/chart/[symbol]/route.ts`\
  - Upstash 기반 속도 제한(`lib/rateLimit.ts`) 적용\
  - 환경 변수 검증(`lib/env.ts`)\
  - 지수 백오프 재시도(`lib/retryFetch.ts`)\
  - 응답 정규화(`lib/transformers.ts`)
- **상태 관리(Zustand):**\
  - `store/chart.ts` : 차트 데이터/상태\
  - `store/ui.ts` : 테마/사이드바(로컬 스토리지 유지)\
  - `store/auth.ts` : 세션/토큰(sessionStorage 유지)
- **클라이언트 컴포넌트:**\
  - `ChartDashboard` : 심볼 검색 → 프록시 호출 → 차트 표시\
  - `ChartViewport` : Lightweight Charts 초기화 및 정리 로직\
  - `ChartPlaceholder` : 데이터 미존재/에러 상태 안내

## 4. Kiwoom 모의 API 연동 가이드

1. **Access Token 관리**\
   샘플 구현에서는 미리 발급 받은 토큰을 환경 변수로 주입하도록 처리했습니다.\
   운영 시에는 `/oauth2/tokenP` 엔드포인트를 프록시 레이어에서 호출하여
   자동으로 토큰을 갱신하는 로직을 추가하세요.

2. **차트 조회 경로**\
   `lib/kiwoomClient.ts` 내 `buildChartUrl` 함수에서 모의 API 스펙에 맞게
   엔드포인트 및 쿼리 파라미터를 조정하세요 (`/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice` 등).

3. **TR ID 관리**\
   `KIWOOM_API_TR_ID` 환경 변수에 모의투자용 TR ID를 주입하세요.\
   요청 종류에 따라 동적으로 바꿔야 한다면, 클라이언트에서 전달받은 interval/range를 기준으로
   `lib/kiwoomClient.ts`에서 분기처리할 수 있습니다.

4. **속도 제한 정책**\
   Upstash 환경 변수를 설정하지 않으면 속도 제한이 비활성화됩니다.\
   프록시에서 사용자 식별자(IP 또는 사용자 ID)를 기준으로 `enforceChartRateLimit`를 확장할 수 있습니다.

## 5. 테스트 체크리스트

- [ ] `.env.local` 작성 후 `pnpm dev` 실행 시 오류 없이 서버가 기동되는지\
- [ ] 유효한 심볼과 인터벌을 입력 시 차트가 렌더링되는지\
- [ ] 환경 변수를 제거하면 `/api/stock/chart/[symbol]`이 503을 반환하는지\
- [ ] 속도 제한이 설정된 경우 429 응답과 재시도 로직이 정상 동작하는지\
- [ ] 테마 토글 시 차트 색상 및 UI가 즉시 반영되는지

## 6. 다음 단계 제안

- OAuth 토큰 자동 발급 및 캐싱 로직 추가\
- 거래량/이동평균선 등의 보조지표 시리즈 추가\
- React Query 혹은 SWR을 통한 데이터 캐시 전략 적용\
- 실시간 체결(WebSocket) 데이터와의 합성 업데이트 구현
