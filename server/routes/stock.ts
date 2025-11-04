import { Router } from "express";

import { enforceChartRateLimit } from "../lib/rateLimit";
import { fetchChartFromKiwoom } from "../services/kiwoom";

const router = Router();

router.get("/chart/:symbol", async (request, response) => {
  const identifier =
    request.ip ?? request.headers["x-forwarded-for"]?.toString() ?? "anonymous";

  const quota = await enforceChartRateLimit(identifier);

  if (!quota.success) {
    response
      .status(429)
      .set(buildRateLimitHeaders(quota))
      .json({ error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." });
    return;
  }

  const { symbol } = request.params;
  const interval = request.query.interval?.toString() ?? "1m";
  const range = request.query.range?.toString();

  const result = await fetchChartFromKiwoom({
    symbol,
    interval,
    range: range ?? undefined
  });

  response.status(result.status).json(result.body);
});

const buildRateLimitHeaders = (quota: { limit?: number; reset?: number }) => {
  const headers: Record<string, string> = {};

  if (typeof quota.limit === "number") {
    headers["X-RateLimit-Limit"] = String(quota.limit);
  }

  if (typeof quota.reset === "number") {
    headers["X-RateLimit-Reset"] = String(quota.reset);
  }

  return headers;
};

export default router;
