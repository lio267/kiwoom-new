'use client';

type Props = {
  status: "idle" | "loading" | "error";
  message?: string | null;
};

const ChartPlaceholder = ({ status, message }: Props) => {
  const labelByStatus: Record<Props["status"], string> = {
    idle: "Kiwoom 모의투자 API를 연결하면 차트가 여기에 표시됩니다.",
    loading: "데이터를 불러오는 중입니다...",
    error:
      message ??
      "차트를 불러오지 못했습니다. API 연결 상태와 환경 변수를 다시 확인해주세요."
  };

  return (
    <div className="flex h-[480px] w-full items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-sm text-slate-400">
      <p className="max-w-lg text-center leading-relaxed">{labelByStatus[status]}</p>
    </div>
  );
};

export default ChartPlaceholder;
