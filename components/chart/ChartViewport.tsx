'use client';

import { useEffect, useRef } from "react";
import {
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  LineStyle,
  UTCTimestamp,
  createChart
} from "lightweight-charts";

import type { Candle, ChartInterval } from "@/types/stock";

type Props = {
  data: Candle[];
  interval: ChartInterval;
  theme: "dark" | "light";
};

const SERIES_LINE_STYLE = LineStyle.Solid;

const ChartViewport = ({ data, interval, theme }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: theme === "dark" ? "#0f172a" : "#ffffff"
        },
        textColor: theme === "dark" ? "#e2e8f0" : "#1e293b"
      },
      grid: {
        vertLines: {
          color: theme === "dark" ? "#1e293b" : "#e2e8f0",
          style: SERIES_LINE_STYLE
        },
        horzLines: {
          color: theme === "dark" ? "#1e293b" : "#cbd5f5",
          style: SERIES_LINE_STYLE
        }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: theme === "dark" ? "#38bdf8" : "#0284c7",
          width: 1,
          style: LineStyle.Solid
        },
        horzLine: {
          color: theme === "dark" ? "#38bdf8" : "#0284c7",
          width: 1,
          style: LineStyle.Solid
        }
      },
      rightPriceScale: {
        borderVisible: false
      },
      timeScale: {
        rightOffset: 2,
        borderVisible: false,
        fixLeftEdge: true
      }
    });

    const series = chart.addCandlestickSeries({
      upColor: theme === "dark" ? "#22c55e" : "#16a34a",
      downColor: theme === "dark" ? "#ef4444" : "#dc2626",
      borderVisible: false,
      wickUpColor: theme === "dark" ? "#22c55e" : "#16a34a",
      wickDownColor: theme === "dark" ? "#ef4444" : "#dc2626"
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const observer = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = containerRef.current ?? {
        clientWidth: 0,
        clientHeight: 0
      };
      chart.applyOptions({
        width: clientWidth,
        height: clientHeight
      });
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [theme]);

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) {
      return;
    }

    seriesRef.current.setData(
      data.map((item) => ({
        time: item.time as UTCTimestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close
      }))
    );

    chartRef.current?.timeScale().fitContent();
  }, [data, interval]);

  return (
    <div className="h-[480px] w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2 shadow-lg shadow-slate-950/40">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default ChartViewport;
