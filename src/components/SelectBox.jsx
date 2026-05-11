import building from '../data/building.json';

export default function SelectBox({ state, onLocation, onTime, onMood, onNext }) {
  if (state.curStage !== 1) {
    return (
      <button className="btn-primary w-full text-base" onClick={onNext}>
        식당 고르기
      </button>
    );
  }

  const ready = state.location && state.time && state.rouletteList.length > 0;

  return (
    <div className="space-y-2">
      <Row label="위치">
        <select
          className="field"
          value={state.location ? JSON.stringify(state.location) : ''}
          onChange={(e) => onLocation(e.target.value ? JSON.parse(e.target.value) : null)}
        >
          <option value="">현재 위치 선택</option>
          {building.map((b) => (
            <option
              key={b.building_id}
              value={JSON.stringify({ lat: b.building_lat, lng: b.building_lng, name: b.building_name })}
            >
              {b.building_name}
            </option>
          ))}
        </select>
      </Row>
      <Row label="도보 시간">
        <select className="field" value={state.time || ''} onChange={(e) => onTime(e.target.value)}>
          <option value="">소요 시간 선택</option>
          <option value="5">5분 이내</option>
          <option value="10">10분 이내</option>
          <option value="15">15분 이내</option>
        </select>
      </Row>
      <Row label="기분 (선택)">
        <input
          className="field"
          type="text"
          placeholder="예: 따끈한 국물, 가벼운 한 끼"
          value={state.mood || ''}
          maxLength={100}
          onChange={(e) => onMood(e.target.value)}
        />
      </Row>
      <button
        className={`w-full text-base mt-1 ${ready ? 'btn-primary' : 'btn-secondary'}`}
        onClick={onNext}
        disabled={!ready}
      >
        룰렛 시작
      </button>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-sm font-semibold text-slate-600 whitespace-nowrap">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
