# 📘 제품 요구사항 정의서 (PRD)

**프로젝트명:** Kiwoom Securities REST API 기반 실시간 주식 차트 웹
애플리케이션\
**작성일:** 2025년 11월\
**작성자:** 리오

------------------------------------------------------------------------

## 1. Executive Summary & Project Goals (요약 및 목표)

본 프로젝트는 **Kiwoom Securities REST API**를 활용하여 **고성능,
보안성, 반응형 주식 차트 웹 애플리케이션**을 구축하는 것을 목표로
합니다.\
애플리케이션은 **Next.js (App Router)**를 기반으로 한 **Full-Stack
구조**를 채택하며, API 라우트를 서버 측 **보안 프록시 계층(Secure Proxy
Layer)**으로 활용하여 민감 정보 보호 및 데이터 신뢰성을 보장합니다.

### 핵심 기술 스택

-   **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS\
-   **State Management:** Zustand\
-   **Chart Engine:** TradingView Lightweight Charts\
-   **Backend Proxy:** Next.js API Routes + @upstash/ratelimit

### 핵심 목표 (Critical Success Factors, CSFs)

1.  **보안 강화:**
    -   Kiwoom API 인증 정보는 서버 환경 변수(process.env)에만 저장\
    -   서버 프록시를 통해 IP 인증을 통합 관리하여 사용자 개별 인증
        불필요
2.  **성능 최적화:**
    -   Dynamic Import (`ssr: false`)를 통한 CSR 강제\
    -   Lightweight Charts 활용으로 LCP/TBT 개선
3.  **데이터 무결성 및 신뢰성:**
    -   서버 측 속도 제한(Rate Limiting) 및 429 대응\
    -   클라이언트 측 Exponential Backoff 기반 자동 재시도
4.  **유지보수성 확보:**
    -   TypeScript 기반 엄격한 타입 정의\
    -   Zustand 스토어 슬라이싱을 통한 모듈화 및 유지보수 용이성 확보

------------------------------------------------------------------------

## 2. Architectural Specification: Next.js API Proxy Layer (보안 및 신뢰성 아키텍처)

### 2.1. 프록시 모델 도입 배경

-   Kiwoom REST API의 인증 정보(API Key, Secret)는 **서버 환경
    변수**로만 접근 가능해야 함.\
-   클라이언트는 `/api/stock/chart` 등 내부 API 엔드포인트를 통해
    요청하며, 서버 프록시가 Kiwoom API와 통신.\
-   IP 보안정책 대응: 서버 단일 IP(Vercel 배포 환경)만 Kiwoom 측에 등록
    → 관리 효율성 극대화.

### 2.2. 신뢰성 및 속도 제한

#### 서버 측 Rate Limiting

-   **@upstash/ratelimit + Redis** 기반의 Edge Middleware 적용.\
-   요청 유형별 차등 정책 적용:

  Endpoint                      기능          정책(Rate)       보안 수준
  ----------------------------- ------------- ---------------- --------------
  `/api/auth/login`             사용자 인증   1 req/3s/IP      Strict
  `/api/stock/chart/{symbol}`   차트 데이터   5 req/s/user     Standard
  `/api/stock/price/{symbol}`   실시간 시세   10 req/s/user    High
  `/api/account/balance`        계좌 현황     1 req/10s/user   Conservative

#### 클라이언트 측 429 대응

-   429 응답 시 **Exponential Backoff Retry** 전략 적용\
    (대기시간: 1s → 2s → 4s → 8s)\
-   사용자는 오류를 거의 인지하지 못하며 자동 복구됨.

------------------------------------------------------------------------

## 3. Frontend Technology Stack (Next.js, TypeScript, Zustand)

### 3.1. 렌더링 전략 및 성능 최적화

-   **CSR 강제 렌더링:**\
    Lightweight Charts는 브라우저 전용이므로
    `next/dynamic({ ssr: false })`를 통해 클라이언트 전용 렌더링.\
-   **메모리 관리:**\
    `useEffect` 내 `chart.remove()`를 호출하여 컴포넌트 언마운트 시
    메모리 누수 방지.

### 3.2. 상태 관리 요구사항 (Zustand 설계)

#### 스토어 구조

  -----------------------------------------------------------------------------------------
  Store Slice           역할          주요 필드         Persistence      Hydration 전략
  --------------------- ------------- ----------------- ---------------- ------------------
  `useAuthStore`        로그인/세션   `isLoggedIn`,     sessionStorage   skipHydration +
                                      `accessToken`                      수동 rehydrate

  `useChartDataStore`   OHLC 데이터   `symbol`,         None             API Fetch 기반
                        캐시          `chartData`                        

  `useUIStore`          테마/UI 상태  `theme`,          localStorage     클라이언트 동기화
                                      `isSidebarOpen`                    
  -----------------------------------------------------------------------------------------

#### Hydration 문제 해결

-   `persist` 미들웨어에서 `skipHydration: true` 사용.\
-   클라이언트 전용 컴포넌트에서 `useEffect`를 통한 수동 rehydrate 구현.

------------------------------------------------------------------------

## 4. Data Visualization Engine (Lightweight Charts)

### 4.1. 선택 근거

-   35KB의 경량 차트 엔진으로 고성능 및 낮은 렌더링 부하 제공.\
-   TypeScript 선언 지원 → 안전한 타입 기반 개발 가능.

### 4.2. 데이터 변환 스펙

  필드    타입         Kiwoom 원본      변환 요구사항
  ------- ------------ ---------------- -------------------------
  time    string/UTC   `YYYYMMDDHHMM`   ISO 날짜 또는 Timestamp
  open    number       시가             float 파싱
  high    number       고가             float 파싱
  low     number       저가             float 파싱
  close   number       종가             float 파싱

### 4.3. 실시간 업데이트

-   전체 리렌더링 대신 `ISeriesApi.update(dataItem)` 사용\
-   Kiwoom API가 웹소켓 미지원 시 폴링 기반 incremental update 적용.

------------------------------------------------------------------------

## 5. UI/UX Specification (Tailwind CSS)

### 5.1. 디자인 시스템

-   **Utility-First 접근:** Tailwind CSS 기반 반응형 UI 설계.\
-   **다크 모드:** Zustand 상태(`theme`)에 따라 차트 색상 및 UI 자동
    동기화.

### 5.2. 차트 뷰 요구사항

  기능          설명                       요구사항
  ------------- -------------------------- -----------------------
  기본 차트     캔들스틱/라인/면적 지원    OHLC 분석 중심
  기간 선택기   1분\~1년 단위 선택         버튼/드롭다운
  상호작용      줌, 패닝, 크로스헤어       60FPS 반응성 유지
  데이터 툴팁   마우스 오버 시 정보 표시   시가/고가/저가/종가
  기술적 지표   MA, Volume                 Custom Primitive 활용

------------------------------------------------------------------------

## 6. Implementation Plan & Technical Deliverables

### 6.1. 개발 산출물 (Deliverables)

1.  **API Proxy Module (TS)** -- 인증 및 속도 제한 포함\
2.  **Data Transformation Module (TS)** -- OHLC 변환 유틸리티\
3.  **Zustand Store 정의 (TS)** -- Auth/Chart/UI Slice\
4.  **Chart Component (React)** -- `next/dynamic` + 클린업 로직 포함\
5.  **UI/UX Library (Tailwind)** -- 기간 선택기, 종목 검색, 대시보드
    컴포넌트

### 6.2. 배포 후 점검 항목 (Post-Deployment Checklist)

-   **성능 측정:** Lighthouse 점수 90+ 확인\
-   **메모리 프로파일링:** `chart.remove()` 호출 여부 검증\
-   **부하 테스트:** Rate Limiter 정책 정확성 및 클라이언트 자동 복구
    테스트

------------------------------------------------------------------------

## 7. 결론

본 프로젝트는 Kiwoom API를 안전하게 통합한 고성능 실시간 주식 차트
서비스를 구축하는 것을 목표로 합니다.\
보안, 성능, 유지보수성을 모두 고려한 Full-Stack Next.js 아키텍처를 통해,
**국내 증권 API 기반 차트 서비스의 새로운 표준**을 제시합니다.
