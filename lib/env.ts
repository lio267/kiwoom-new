type KiwoomEnv = {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  accessToken?: string;
};

const trimOrUndefined = (value: string | undefined): string | undefined =>
  value?.trim() || undefined;

export const getKiwoomEnv = (): KiwoomEnv | null => {
  const baseUrl = trimOrUndefined(process.env.KIWOOM_API_BASE_URL);
  const appKey = trimOrUndefined(process.env.KIWOOM_API_APP_KEY);
  const appSecret = trimOrUndefined(process.env.KIWOOM_API_APP_SECRET);
  const accessToken = trimOrUndefined(process.env.KIWOOM_API_ACCESS_TOKEN);

  if (!baseUrl || !appKey || !appSecret) {
    return null;
  }

  return {
    baseUrl,
    appKey,
    appSecret,
    accessToken
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
