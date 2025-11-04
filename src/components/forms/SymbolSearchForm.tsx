import { useEffect, useState } from "react";

type Props = {
  symbol: string;
  isLoading?: boolean;
  onSubmit: (symbol: string) => void;
};

const SymbolSearchForm = ({ symbol, isLoading = false, onSubmit }: Props) => {
  const [value, setValue] = useState(symbol);

  useEffect(() => {
    setValue(symbol);
  }, [symbol]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextSymbol = value.trim().toUpperCase();

    if (!nextSymbol) {
      return;
    }

    onSubmit(nextSymbol);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
      <label className="flex flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2">
        <span className="text-xs uppercase tracking-widest text-slate-500">
          Symbol
        </span>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="예: A005930"
          className="flex-1 bg-transparent text-base text-slate-100 outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-1 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "로딩 중..." : "차트 불러오기"}
      </button>
    </form>
  );
};

export default SymbolSearchForm;
