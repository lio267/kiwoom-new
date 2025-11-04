import { ChartQuery, KiwoomChartResponse } from "../../src/types/stock";
import { getKiwoomEnv } from "../config/env";
import { fetchWithBackoff } from "../lib/retryFetch";
import { extractCandles } from "../lib/transformers";

const buildChartUrl = (baseUrl: string, { symbol, interval, range }: ChartQuery) => {
  const endpoint = new URL("/stock/chart", baseUrl);
  endpoint.searchParams.set("symbol", symbol);
  endpoint.searchParams.set("interval", interval);

  if (range) {
    endpoint.searchParams.set("range", range);
  }

  return endpoint.toString();
};

const buildKiwoomHeaders = (accessToken?: string, trId?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    appkey: process.env.KIWOOM_API_APP_KEY ?? "",
    appsecret: process.env.KIWOOM_API_APP_SECRET ?? ""
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (trId) {
    headers["tr_id"] = trId;
  }

  return headers;
};

export const fetchChartFromKiwoom = async (query: ChartQuery) => {
  const env = getKiwoomEnv();

  if (!env) {
    return {
      status: 503,
      body: {
        error:
          "Kiwoom API 환경 변수가 설정되지 않았습니다. .env.local 파일에 KIWOOM_API_BASE_URL, KIWOOM_API_APP_KEY, KIWOOM_API_APP_SECRET 값을 추가해주세요."
      }
    };
  }

  const requestUrl = buildChartUrl(env.baseUrl, query);

  const response = await fetchWithBackoff(requestUrl, {
    method: "GET",
    headers: buildKiwoomHeaders(env.accessToken, env.trId)
  });

  if (!response.ok) {
    const errorPayload = await safeJson(response);

    return {
      status: response.status,
      body: {
        error: "Kiwoom API 호출에 실패했습니다.",
        status: response.status,
        details: errorPayload
      }
    };
  }

  const payload = (await response.json()) as KiwoomChartResponse;
  const candles = extractCandles(payload);

  if (candles.length === 0) {
    return {
      status: 200,
      body: {
        candles: [],
        message:
          "정상적으로 응답을 수신했지만 차트 데이터가 비어있습니다. 요청 파라미터 또는 변환 로직을 확인해주세요."
      }
    };
  }

  return {
    status: 200,
    body: {
      candles,
      metadata: {
        count: candles.length,
        symbol: query.symbol,
        interval: query.interval,
        range: query.range ?? null
      }
    }
  };
};

const safeJson = async (response: Response) => {
  try {
    return await response.json();
  } catch (error) {
    return { message: "JSON 파싱 실패", error: String(error) };
  }
};
