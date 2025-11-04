type Fetcher = typeof fetch;

const DEFAULT_MAX_ATTEMPTS = 4;
const DEFAULT_INITIAL_DELAY_MS = 1000;

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export interface RetryFetchOptions extends RequestInit {
  fetchImpl?: Fetcher;
  attempts?: number;
  initialDelayMs?: number;
}

export const fetchWithBackoff = async (
  input: RequestInfo | URL,
  {
    fetchImpl,
    attempts = DEFAULT_MAX_ATTEMPTS,
    initialDelayMs = DEFAULT_INITIAL_DELAY_MS,
    ...init
  }: RetryFetchOptions = {}
): Promise<Response> => {
  const executor = fetchImpl ?? fetch;

  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < attempts) {
    const response = await executor(input, init);

    if (!shouldRetry(response)) {
      return response;
    }

    attempt += 1;
    if (attempt >= attempts) {
      return response;
    }

    await sleep(delay);
    delay *= 2;
  }

  throw new Error("fetchWithBackoff exhausted all retries");
};

const shouldRetry = (response: Response): boolean => {
  if (response.status === 429 || response.status === 503) {
    return true;
  }

  return false;
};
