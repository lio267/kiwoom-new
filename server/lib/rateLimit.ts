import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { getUpstashEnv } from "../config/env";

const upstashEnv = getUpstashEnv();

const redis = upstashEnv
  ? new Redis({
      url: upstashEnv.redisUrl,
      token: upstashEnv.redisToken
    })
  : null;

const chartLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 s"),
      prefix: "ratelimit:chart"
    })
  : null;

export const enforceChartRateLimit = async (
  identifier: string
): Promise<{ success: boolean; status?: number; limit?: number; reset?: number }> => {
  if (!chartLimiter) {
    return { success: true };
  }

  const quota = await chartLimiter.limit(identifier);

  return {
    success: quota.success,
    status: quota.success ? 200 : 429,
    limit: quota.limit,
    reset: quota.reset
  };
};
