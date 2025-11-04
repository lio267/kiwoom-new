import fs from "node:fs";
import path from "node:path";

import { config } from "dotenv";

config();

const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  config({ path: envLocalPath, override: true });
}

type KiwoomEnv = {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  accessToken?: string;
  trId?: string;
};

const trimOrUndefined = (value: string | undefined): string | undefined =>
  value?.trim() || undefined;

export const getKiwoomEnv = (): KiwoomEnv | null => {
  const baseUrl = trimOrUndefined(process.env.KIWOOM_API_BASE_URL);
  const appKey = trimOrUndefined(process.env.KIWOOM_API_APP_KEY);
  const appSecret = trimOrUndefined(process.env.KIWOOM_API_APP_SECRET);

  if (!baseUrl || !appKey || !appSecret) {
    return null;
  }

  return {
    baseUrl,
    appKey,
    appSecret,
    accessToken: trimOrUndefined(process.env.KIWOOM_API_ACCESS_TOKEN),
    trId: trimOrUndefined(process.env.KIWOOM_API_TR_ID)
  };
};

export type UpstashEnv = {
  redisUrl: string;
  redisToken: string;
};

export const getUpstashEnv = (): UpstashEnv | null => {
  const redisUrl = trimOrUndefined(process.env.UPSTASH_REDIS_REST_URL);
  const redisToken = trimOrUndefined(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (!redisUrl || !redisToken) {
    return null;
  }

  return {
    redisUrl,
    redisToken
  };
};
