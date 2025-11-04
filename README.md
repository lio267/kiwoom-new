# Kiwoom Securities Mock Trading Chart

Vite + React + TypeScript 기반 프론트엔드와 Express 보안 프록시 서버로 구성된
Kiwoom 모의투자 REST API 연동용 차트 애플리케이션 골격입니다.\
**가상의 데이터는 포함하지 않으며**, 외부 API를 연결했을 때만 차트가 렌더링됩니다.

## 1. 사전 준비

1. 모의투자 환경용 Kiwoom REST API 자격 증명 확보
2. (선택) Upstash Redis 프로젝트를 생성하여 속도 제한 키 발급
3. 프로젝트 루트에 `.env.local` 생성 후 아래 항목 정의

```bash
# Kiwoom API
KIWOOM_API_BASE_URL="https://openapi.koreainvestment.com:9443"  # 예시
KIWOOM_API_APP_KEY="YOUR_APP_KEY"
KIWOOM_API_APP_SECRET="YOUR_APP_SECRET"
KIWOOM_API_ACCESS_TOKEN="YOUR_ACCESS_TOKEN"          # 자동 갱신 로직은 미포함
KIWOOM_API_TR_ID="FHKST03010100"                     # 요청 종류에 맞춰 변경

# Express 프록시 서버
SERVER_PORT=4000
CLIENT_ORIGIN=http://localhost:5173

# Vite 개발용 프록시 목적지 (선택)
VITE_PROXY_TARGET=http://localhost:4000

# Upstash Rate Limit (선택)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="YOUR_UPSTASH_TOKEN"
```

> ⛔️ 필수 Kiwoom 환경 변수가 비어있다면 `/api/stock/chart/:symbol` 요청 시
> 503(Service Unavailable)과 함께 설정 안내 메시지가 반환됩니다.

## 2. 설치 & 실행

```bash
npm install
npm run dev          # Vite(5173) + Express(4000)를 동시에 실행
```

빌드/배포용 스크립트:

```bash
npm run build        # Vite 프론트엔드 번들 (dist/)
npm run preview      # dist/ 미리보기 서버 (API 프록시는 별도 실행 필요)
```

Express 프록시는 `server/index.ts`에서 구동되며, Vite 개발 서버는
`/api/*` 요청을 `http://localhost:4000`으로 프록시합니다.

## 3. 아키텍처 개요

- **프론트엔드 (Vite React)**\
  - 진입점: `src/main.tsx`, `src/App.tsx`\
  - 상태 관리: Zustand (`src/store/*`)\
  - UI: Tailwind CSS (`src/index.css`, `tailwind.config.ts`)\
  - 데이터 시각화: Lightweight Charts (`src/components/chart/ChartViewport.tsx`)\
  - API 호출: Fetch → `/api/stock/chart/:symbol`

- **보안 프록시 (Express)**\
  - 라우트: `server/routes/stock.ts`\
  - 기능: Upstash Rate Limit(`server/lib/rateLimit.ts`), 지수 백오프(`server/lib/retryFetch.ts`),
    데이터 정규화(`server/lib/transformers.ts`)\
  - 환경 변수 로딩: `server/config/env.ts`

- **타입 & 유틸**\
  - 공용 타입: `src/types/stock.ts`\
  - Kiwoom 호출 서비스: `server/services/kiwoom.ts`

## 4. Kiwoom 모의 API 연동 가이드

1. **Access Token 관리**\
   현재는 사전에 발급한 토큰을 `.env.local`에 입력하는 형태입니다.\
   실 서비스에서는 `/oauth2/tokenP` 등을 호출하여 서버에서 자동 갱신하도록 확장하세요.

2. **차트 조회 엔드포인트 조정**\
   `server/services/kiwoom.ts` 의 `buildChartUrl`을 Kiwoom REST 스펙에 맞춰 변경합니다.
   (`/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice` 등)

3. **TR ID 동적 관리**\
   필요 시 interval/range 조합에 따라 다른 TR ID를 사용하도록 `buildKiwoomHeaders`에서 분기하세요.

4. **속도 제한 전략**\
   Upstash 변수 미설정 시 속도 제한은 비활성화됩니다.\
   사용자별 Rate Limit이 필요하면 `enforceChartRateLimit` 식별자에 사용자 ID 등을 전달하세요.

## 5. 자체 점검 체크리스트

- [ ] `.env.local` 작성 후 `npm run dev` 실행 시 Express와 Vite가 함께 기동되는가?\
- [ ] 유효한 심볼/인터벌 요청 시 차트 데이터가 정상적으로 표시되는가?\
- [ ] 필수 환경 변수를 제거하면 `/api/stock/chart/:symbol`이 503을 반환하는가?\
- [ ] 속도 제한이 적용된 경우 429가 발생하고 클라이언트 재시도 메시지가 표시되는가?\
- [ ] 테마 토글 시 UI와 차트 컬러가 즉시 동기화되는가?

## 6. 확장 아이디어

1. Express에 OAuth 토큰 자동 갱신 및 캐시 로직 추가
2. 거래량 / 이동평균선 등 보조지표 시리즈 렌더링
3. React Query(SWR) 기반 클라이언트 캐시 & 백오프 통합
4. WebSocket 실시간 체결 데이터와의 합성 업데이트 흐름 구축
