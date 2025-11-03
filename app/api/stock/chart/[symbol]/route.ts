import { NextRequest, NextResponse } from "next/server";

import { fetchChartFromKiwoom } from "@/lib/kiwoomClient";
import { enforceChartRateLimit } from "@/lib/rateLimit";
import { ChartInterval, ChartRange } from "@/types/stock";

const DEFAULT_INTERVAL: ChartInterval = "1m";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const rateCheck = await enforceChartRateLimit(
    request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous"
  );

  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateCheck)
      }
    );
  }

  const { symbol } = params;
  const interval =
    (request.nextUrl.searchParams.get("interval") as ChartInterval) ??
    DEFAULT_INTERVAL;
  const range = request.nextUrl.searchParams.get("range") as ChartRange | null;

  return fetchChartFromKiwoom({
    symbol,
    interval,
    range: range ?? undefined
  });
}

const buildRateLimitHeaders = (quota: {
  limit?: number;
  reset?: number;
}) => {
  const headers = new Headers();

  if (typeof quota.limit === "number") {
    headers.set("X-RateLimit-Limit", String(quota.limit));
  }

  if (typeof quota.reset === "number") {
    headers.set("X-RateLimit-Reset", String(quota.reset));
  }

  return headers;
};
