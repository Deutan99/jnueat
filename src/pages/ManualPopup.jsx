const MODES = [
  {
    icon: '🦌',
    name: '제록이가 골라줘',
    desc: '기분과 상황만 말해주면 AI가 한 번에 골라줘요.',
    bg: 'bg-mandarin/10',
    accent: 'text-mandarin-dark',
  },
  {
    icon: '🎰',
    name: '룰렛으로 정하기',
    desc: '음식 카테고리 → 식당까지 룰렛 두 번으로 결정.',
    bg: 'bg-brand/10',
    accent: 'text-brand',
  },
  {
    icon: '📋',
    name: '카테고리별 보기',
    desc: '도보 시간 안에 있는 식당을 거리순으로 직접 골라요.',
    bg: 'bg-slate-100',
    accent: 'text-slate-700',
  },
];

const TIPS = [
  { icon: '📍', text: '먼저 학교 안 출발 건물과 도보 시간을 알려주세요.' },
  { icon: '🚶', text: '5·10·15분 거리로 후보를 좁혀줘요.' },
  { icon: '🗺️', text: '결과 화면에서 카카오맵으로 위치·메뉴 확인.' },
];

export default function ManualPopup({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="relative bg-gradient-to-br from-mandarin-soft via-cream to-white px-5 pt-5 pb-4">
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-mandarin/20 blur-2xl" />
          <div className="flex items-start gap-3">
            <img
              src="/img/deer-graduate.png"
              alt="학사 제록이"
              className="h-16 w-16 shrink-0"
              style={{ filter: 'drop-shadow(0 3px 6px rgba(255, 138, 61, 0.25))' }}
            />
            <div>
              <h3 className="font-jua text-2xl text-brand leading-tight">사용 방법</h3>
              <p className="mt-0.5 text-xs text-slate-500">제록이가 차근차근 알려줄게요</p>
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {/* 3가지 방식 */}
          <p className="text-[11px] font-semibold tracking-wider text-slate-500">
            3가지 방식 중 골라요
          </p>
          <ul className="mt-2 space-y-2">
            {MODES.map((m) => (
              <li
                key={m.name}
                className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ring-1 ring-slate-200 ${m.bg}`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-xl shadow-sm">
                  {m.icon}
                </span>
                <div className="min-w-0">
                  <div className={`font-jua text-sm leading-tight ${m.accent}`}>{m.name}</div>
                  <div className="mt-0.5 text-xs text-slate-600 leading-snug">{m.desc}</div>
                </div>
              </li>
            ))}
          </ul>

          {/* 공통 흐름 */}
          <p className="mt-4 text-[11px] font-semibold tracking-wider text-slate-500">
            공통 사용 팁
          </p>
          <ul className="mt-2 space-y-1.5">
            {TIPS.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-base leading-tight">{t.icon}</span>
                <span className="pt-0.5 leading-snug">{t.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-5 pb-5 pt-1">
          <button className="btn-primary w-full" onClick={onClose}>
            알겠어요!
          </button>
        </div>
      </div>
    </div>
  );
}
