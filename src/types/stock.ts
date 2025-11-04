export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type ChartInterval =
  | "1m"
  | "3m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "1d"
  | "1w";

export type ChartRange = "1d" | "5d" | "1m" | "3m" | "6m" | "1y";

export interface KiwoomChartItem {
  stck_bsop_date?: string;
  stck_oprc?: string;
  stck_hgpr?: string;
  stck_lwpr?: string;
  stck_prpr?: string;
  time?: string;
  open?: string | number;
  high?: string | number;
  low?: string | number;
  close?: string | number;
  [key: string]: unknown;
}

export interface KiwoomChartResponse {
  output1?: KiwoomChartItem[];
  candles?: KiwoomChartItem[];
  [key: string]: unknown;
}

export interface ChartQuery {
  symbol: string;
  interval: ChartInterval;
  range?: ChartRange;
}
