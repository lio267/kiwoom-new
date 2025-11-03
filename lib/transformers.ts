import { Candle, KiwoomChartItem, KiwoomChartResponse } from "../types/stock";

const parseTimestamp = (raw: string): number | null => {
  if (!raw) {
    return null;
  }

  const normalized = raw.trim();

  if (normalized.length === 8) {
    const year = Number(normalized.slice(0, 4));
    const month = Number(normalized.slice(4, 6)) - 1;
    const day = Number(normalized.slice(6, 8));

    return Date.UTC(year, month, day);
  }

  if (normalized.length === 12) {
    const year = Number(normalized.slice(0, 4));
    const month = Number(normalized.slice(4, 6)) - 1;
    const day = Number(normalized.slice(6, 8));
    const hour = Number(normalized.slice(8, 10));
    const minute = Number(normalized.slice(10, 12));

    return Date.UTC(year, month, day, hour, minute);
  }

  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : parsed;
};

const safeParseNumber = (value: string | number): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const next = Number(value);
    return Number.isFinite(next) ? next : null;
  }

  return null;
};

export const normalizeCandle = (item: KiwoomChartItem): Candle | null => {
  const timestamp = parseTimestamp(
    item.stck_bsop_date ?? item.time ?? item.timestamp ?? ""
  );

  const open = safeParseNumber(item.stck_oprc ?? item.open);
  const high = safeParseNumber(item.stck_hgpr ?? item.high);
  const low = safeParseNumber(item.stck_lwpr ?? item.low);
  const close = safeParseNumber(item.stck_prpr ?? item.close);

  if (
    timestamp === null ||
    open === null ||
    high === null ||
    low === null ||
    close === null
  ) {
    return null;
  }

  return {
    time: timestamp / 1000,
    open,
    high,
    low,
    close
  };
};

export const extractCandles = (payload: KiwoomChartResponse): Candle[] => {
  const source = payload.output1 ?? payload.candles ?? [];
  const normalized = source
    .map((item) => normalizeCandle(item))
    .filter((item): item is Candle => Boolean(item));

  return normalized.sort((a, b) => a.time - b.time);
};
