const STEPS = [
  { n: 1, t: '조건 선택', d: '현재 위치(건물)와 도보 소요 시간, 그리고 기분/상황을 입력합니다.' },
  { n: 2, t: '음식 선택', d: '룰렛을 돌리거나 제록이의 AI 추천으로 음식 카테고리를 정합니다.' },
  { n: 3, t: '식당 표시', d: '조건과 카테고리에 맞는 식당이 지도에 표시됩니다.' },
  { n: 4, t: '식당 선택', d: '룰렛 또는 AI로 식당 한 곳을 정합니다. 별로면 이유 입력하고 다른 거 추천받기.' },
  { n: 5, t: '완료', d: '카카오맵 링크를 열어 위치와 메뉴를 확인하세요.' },
];

export default function ManualPopup({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <img
            src="/img/제록이4.png"
            alt="학사 제록이"
            className="h-14 w-14 shrink-0"
          />
          <div>
            <h3 className="font-jua text-2xl text-brand">사용 방법</h3>
            <p className="text-xs text-slate-500">제록이가 차근차근 알려줄게요</p>
          </div>
        </div>
        <ol className="mt-4 space-y-3">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                {s.n}
              </span>
              <div>
                <div className="font-semibold">{s.t}</div>
                <div className="text-sm text-slate-500">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>
        <button className="btn-primary mt-5 w-full" onClick={onClose}>
          알겠어요
        </button>
      </div>
    </div>
  );
}
