const STAGES = ['조건 선택', '음식 선택', '식당 표시', '식당 선택', '선택 완료'];

function statusOf(idx, cur) {
  if (idx + 1 < cur) return 'completed';
  if (idx + 1 === cur) return cur === 5 ? 'completed' : 'active';
  return 'idle';
}

export default function ProgressBar({ curStage }) {
  return (
    <ol className="flex w-full items-start gap-0 px-2 pb-3">
      {STAGES.map((name, idx) => {
        const status = statusOf(idx, curStage);
        const dotBg =
          status === 'completed'
            ? 'bg-emerald-500 text-white border-emerald-500'
            : status === 'active'
            ? 'bg-white text-brand border-brand'
            : 'bg-white text-slate-400 border-slate-300';
        const labelColor =
          status === 'completed' ? 'text-emerald-600'
          : status === 'active' ? 'text-brand'
          : 'text-slate-400';
        const lineColor =
          status === 'completed' ? 'bg-emerald-400'
          : status === 'active' ? 'bg-brand'
          : 'bg-slate-200';
        return (
          <li key={name} className="flex flex-1 flex-col items-center relative">
            <div className="flex items-center w-full">
              <span className={`h-1 flex-1 ${idx === 0 ? 'opacity-0' : lineColor}`} />
              <span className={`mx-1 grid h-7 w-7 place-items-center rounded-full border text-sm font-bold ${dotBg}`}>
                {status === 'completed' ? '✓' : idx + 1}
              </span>
              <span className={`h-1 flex-1 ${idx === STAGES.length - 1 ? 'opacity-0' : lineColor}`} />
            </div>
            <span className={`mt-1 text-xs ${labelColor}`}>{name}</span>
          </li>
        );
      })}
    </ol>
  );
}
