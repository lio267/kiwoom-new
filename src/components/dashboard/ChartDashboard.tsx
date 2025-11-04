import { useCallback, useEffect, useMemo, useState } from "react";

import ChartControls from "@/components/chart/ChartControls";
import ChartPlaceholder from "@/components/chart/ChartPlaceholder";
import ChartViewport from "@/components/chart/ChartViewport";
import SymbolSearchForm from "@/components/forms/SymbolSearchForm";
import { useStoreHydration } from "@/hooks/useStoreHydration";
import { ChartStatus, useChartStore } from "@/store/chart";
import { useUIStore } from "@/store/ui";
import type { Candle, ChartInterval, ChartRange } from "@/types/stock";

const sanitizeCandles = (input: unknown): Candle[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      const time = Number(item?.time);
      const open = Number(item?.open);
      const high = Number(item?.high);
      const low = Number(item?.low);
      const close = Number(item?.close);

      if (
        Number.isNaN(time) ||
        Number.isNaN(open) ||
        Number.isNaN(high) ||
        Number.isNaN(low) ||
        Number.isNaN(close)
      ) {
        return null;
      }

      return { time, open, high, low, close };
    })
    .filter((item): item is Candle => Boolean(item));
};

const ChartDashboard = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const {
    symbol,
    interval,
    range,
    candles,
    status,
    message,
    setSymbol,
    setInterval,
    setRange,
    setCandles,
    setStatus
  } = useChartStore();

  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const uiHydrated = useStoreHydration(useUIStore);

  useEffect(() => {
    if (!uiHydrated) {
      return;
    }

    document.documentElement.classList.remove(theme === "dark" ? "light" : "dark");
    document.documentElement.classList.add(theme);
  }, [theme, uiHydrated]);

  const fetchCandles = useCallback(
    async (nextSymbol: string, nextInterval: ChartInterval, nextRange: ChartRange) => {
      setSymbol(nextSymbol);
      setInterval(nextInterval);
      setRange(nextRange);
      setStatus("loading");
      setCandles([]);

      const query = new URLSearchParams({
        interval: nextInterval,
        range: nextRange
      });

      try {
        const response = await fetch(
          `/api/stock/chart/${encodeURIComponent(nextSymbol)}?${query.toString()}`,
          {
            method: "GET",
            cache: "no-store"
          }
        );

        const payload = (await response.json()) as {
          candles?: Candle[];
          error?: string;
          message?: string;
        };

        if (!response.ok) {
          setStatus(
            "error",
            payload?.error ??
              "Kiwoom 모의투자 API 호출에 실패했습니다. 로그와 환경 변수를 확인해주세요."
          );
          setCandles([]);
          setLastUpdated(null);
          return;
        }

        const candleData = sanitizeCandles(payload.candles);

        if (!candleData.length) {
          setStatus(
            "idle",
            payload?.message ??
              "응답은 정상적이지만 차트 데이터가 비어 있습니다. 요청 파라미터를 다시 확인해주세요."
          );
          setCandles([]);
          setLastUpdated(null);
          return;
        }

        setCandles(candleData);
        setStatus("success", payload?.message ?? null);
        setLastUpdated(new Date());
      } catch (error) {
        setStatus(
          "error",
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다. 네트워크 상태를 확인해주세요."
        );
        setCandles([]);
        setLastUpdated(null);
      }
    },
    [setCandles, setInterval, setRange, setStatus, setSymbol]
  );

  const handleSymbolSubmit = useCallback(
    (nextSymbol: string) => {
      fetchCandles(nextSymbol, interval, range);
    },
    [fetchCandles, interval, range]
  );

  const handleIntervalChange = useCallback(
    (nextInterval: ChartInterval) => {
      if (!symbol) {
        setInterval(nextInterval);
        return;
      }

      fetchCandles(symbol, nextInterval, range);
    },
    [fetchCandles, range, setInterval, symbol]
  );

  const handleRangeChange = useCallback(
    (nextRange: ChartRange) => {
      if (!symbol) {
        setRange(nextRange);
        return;
      }

      fetchCandles(symbol, interval, nextRange);
    },
    [fetchCandles, interval, setRange, symbol]
  );

  const formattedUpdatedAt = useMemo(() => {
    if (!lastUpdated) {
      return null;
    }

    return lastUpdated.toLocaleString("ko-KR");
  }, [lastUpdated]);

  const effectiveStatus: ChartStatus =
    status === "success" && candles.length === 0 ? "idle" : status;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Kiwoom Securities 모의투자 차트
            </h1>
            <p className="text-sm text-slate-400">
              PRD 요구사항에 맞춰 보안 프록시를 통해 데이터를 가져옵니다. 환경 변수를 설정한
              후 모의투자 API와 연결해주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            disabled={!uiHydrated}
            className="self-start rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-sky-500 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {theme === "dark" ? "라이트 모드" : "다크 모드"}로 전환
          </button>
        </div>
      </header>

      <SymbolSearchForm
        symbol={symbol}
        isLoading={status === "loading"}
        onSubmit={handleSymbolSubmit}
      />

      <ChartControls
        activeInterval={interval}
        activeRange={range}
        onChangeInterval={handleIntervalChange}
        onChangeRange={handleRangeChange}
      />

      {effectiveStatus === "success" && candles.length > 0 ? (
        <ChartViewport data={candles} interval={interval} theme={theme} />
      ) : (
        <ChartPlaceholder status={effectiveStatus} message={message} />
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          {formattedUpdatedAt ? (
            <span>마지막 업데이트: {formattedUpdatedAt}</span>
          ) : (
            <span>API 연결을 완료하면 실시간 시세를 확인할 수 있습니다.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-800 px-2 py-1 font-mono">
            Interval: {interval.toUpperCase()}
          </span>
          <span className="rounded-full bg-slate-800 px-2 py-1 font-mono">
            Range: {range.toUpperCase()}
          </span>
        </div>
      </footer>
    </section>
  );
};

export default ChartDashboard;
