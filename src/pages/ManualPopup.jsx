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
    name: '카테고리만 보기',
    desc: '전체 식당을 카테고리로 분류해서 둘러봐요. 위치 입력 불필요.',
    bg: 'bg-mandarin/10',
    accent: 'text-mandarin-dark',
  },
  {
    icon: '🗺️',
    name: '거리순으로 직접',
    desc: '위치·시간을 입력하고 지도와 리스트에서 직접 골라요.',
    bg: 'bg-brand/10',
    accent: 'text-brand',
  },
];

const TIPS = [
  { icon: '📍', text: '거리 기반 모드는 출발 건물과 도보 시간을 알려주세요.' },
  { icon: '🚶', text: '5·10·15분 거리로 후보를 좁힐 수 있어요.' },
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
        <div className="relative bg-gradient-to-br from-mandarin-soft via-cream to-white px-5 pt-6 pb-5 text-center">
          <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-mandarin/25 blur-2xl" />
          <div className="pointer-events-none absolute -top-4 -left-8 h-20 w-20 rounded-full bg-brand/10 blur-2xl" />

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/70 text-slate-500 ring-1 ring-slate-200 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-700 active:scale-95"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>

          {/* 제록이 */}
          <div className="relative mx-auto inline-block">
            <div className="absolute inset-0 -z-10 m-auto h-20 w-20 rounded-full bg-white/70 blur-md" />
            <div className="absolute inset-0 -z-20 m-auto h-24 w-24 rounded-full bg-gradient-to-br from-mandarin/25 to-brand/10 blur-xl" />
            <img
              src="/img/deer-graduate.png"
              alt="학사 제록이"
              className="h-20 w-auto"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))' }}
            />
          </div>

          <h3 className="mt-2 font-jua text-2xl text-brand leading-tight">사용 방법</h3>
          <p className="mt-0.5 text-xs text-slate-500">제록이가 차근차근 알려줄게요</p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {/* 3가지 방식 */}
          <p className="text-[11px] font-semibold tracking-wider text-slate-500">
            4가지 방식 중 골라요
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
