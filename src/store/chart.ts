import { create } from "zustand";

import type { Candle, ChartInterval, ChartRange } from "@/types/stock";

export type ChartStatus = "idle" | "loading" | "success" | "error";

type ChartState = {
  symbol: string;
  interval: ChartInterval;
  range: ChartRange;
  candles: Candle[];
  status: ChartStatus;
  message: string | null;
};

type ChartActions = {
  setSymbol: (symbol: string) => void;
  setInterval: (interval: ChartInterval) => void;
  setRange: (range: ChartRange) => void;
  setCandles: (candles: Candle[]) => void;
  setStatus: (status: ChartStatus, message?: string | null) => void;
  reset: () => void;
};

const INITIAL_STATE: ChartState = {
  symbol: "",
  interval: "1m",
  range: "1d",
  candles: [],
  status: "idle",
  message: null
};

export const useChartStore = create<ChartState & ChartActions>((set) => ({
  ...INITIAL_STATE,
  setSymbol: (symbol) => set({ symbol }),
  setInterval: (interval) =>
    set((state) => ({
      interval,
      candles: state.interval === interval ? state.candles : []
    })),
  setRange: (range) => set({ range }),
  setCandles: (candles) => set({ candles }),
  setStatus: (status, message = null) => set({ status, message }),
  reset: () => set(INITIAL_STATE)
}));
