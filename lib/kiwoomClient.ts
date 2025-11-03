import { NextResponse } from "next/server";

import { ChartQuery, KiwoomChartResponse } from "../types/stock";

import { getKiwoomEnv } from "./env";
import { fetchWithBackoff } from "./retryFetch";
import { extractCandles } from "./transformers";

const buildChartUrl = (baseUrl: string, { symbol, interval, range }: ChartQuery) => {
  const endpoint = new URL("/stock/chart", baseUrl);
  endpoint.searchParams.set("symbol", symbol);
  endpoint.searchParams.set("interval", interval);

  if (range) {
    endpoint.searchParams.set("range", range);
  }

  return endpoint.toString();
};

const buildKiwoomHeaders = (accessToken?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    appkey: process.env.KIWOOM_API_APP_KEY ?? "",
    appsecret: process.env.KIWOOM_API_APP_SECRET ?? ""
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const trId = process.env.KIWOOM_API_TR_ID;
  if (trId) {
    headers["tr_id"] = trId;
  }

  return headers;
};

export const fetchChartFromKiwoom = async (query: ChartQuery) => {
  const env = getKiwoomEnv();

  if (!env) {
    return NextResponse.json(
      {
        error:
          "Kiwoom API 환경 변수가 설정되지 않았습니다. .env.local 파일에 KIWOOM_API_BASE_URL, KIWOOM_API_APP_KEY, KIWOOM_API_APP_SECRET 값을 추가해주세요."
      },
      { status: 503 }
    );
  }

  const requestUrl = buildChartUrl(env.baseUrl, query);

  const response = await fetchWithBackoff(requestUrl, {
    method: "GET",
    headers: buildKiwoomHeaders(env.accessToken)
  });

  if (!response.ok) {
    const errorPayload = await safeJson(response);

    return NextResponse.json(
      {
        error: "Kiwoom API 호출에 실패했습니다.",
        status: response.status,
        details: errorPayload
      },
      { status: response.status }
    );
  }

  const payload = (await response.json()) as KiwoomChartResponse;
  const candles = extractCandles(payload);

  if (candles.length === 0) {
    return NextResponse.json(
      {
        candles: [],
        message:
          "정상적으로 응답을 수신했지만 차트 데이터가 비어있습니다. 요청 파라미터 또는 변환 로직을 확인해주세요."
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      candles,
      metadata: {
        count: candles.length,
        symbol: query.symbol,
        interval: query.interval,
        range: query.range ?? null
      }
    },
    { status: 200 }
  );
};

const safeJson = async (response: Response) => {
  try {
    return await response.json();
  } catch (error) {
    return { message: "JSON 파싱 실패", error: String(error) };
  }
};
