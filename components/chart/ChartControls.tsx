'use client';

import type { ChartInterval, ChartRange } from "@/types/stock";

const INTERVAL_OPTIONS: ChartInterval[] = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
  "1w"
];

const RANGE_OPTIONS: ChartRange[] = ["1d", "5d", "1m", "3m", "6m", "1y"];

type Props = {
  activeInterval: ChartInterval;
  activeRange: ChartRange;
  onChangeInterval: (interval: ChartInterval) => void;
  onChangeRange: (range: ChartRange) => void;
};

const ChartControls = ({
  activeInterval,
  activeRange,
  onChangeInterval,
  onChangeRange
}: Props) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {INTERVAL_OPTIONS.map((interval) => {
          const isActive = interval === activeInterval;

          return (
            <button
              key={interval}
              type="button"
              onClick={() => onChangeInterval(interval)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-sky-500 text-white shadow"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {interval.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="range" className="text-xs uppercase tracking-widest text-slate-500">
          Range
        </label>
        <select
          id="range"
          value={activeRange}
          onChange={(event) => onChangeRange(event.target.value as ChartRange)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-sky-500"
        >
          {RANGE_OPTIONS.map((range) => (
            <option key={range} value={range}>
              {range.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ChartControls;
export { INTERVAL_OPTIONS, RANGE_OPTIONS };
