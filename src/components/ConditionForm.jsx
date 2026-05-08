import building from '../data/building.json';

export default function ConditionForm({
  location,
  time,
  mood,
  onLocation,
  onTime,
  onMood,
  onSubmit,
  submitDisabled,
  submitLabel = '다음',
  showMood = true,
  showTime = true,
}) {
  return (
    <div className="space-y-2">
      <Row label="위치">
        <select
          className="field"
          value={location ? JSON.stringify(location) : ''}
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
      {showTime && (
        <Row label="시간">
          <select className="field" value={time || ''} onChange={(e) => onTime(e.target.value)}>
            <option value="">소요 시간 선택</option>
            <option value="5">5분 이내</option>
            <option value="10">10분 이내</option>
            <option value="15">15분 이내</option>
          </select>
        </Row>
      )}
      {showMood && (
        <Row label="기분">
          <input
            className="field"
            type="text"
            placeholder="예: 비 오는 날 따뜻한 거 (선택)"
            value={mood || ''}
            onChange={(e) => onMood(e.target.value)}
          />
        </Row>
      )}
      <button
        className={`w-full text-base mt-1 ${submitDisabled ? 'btn-secondary' : 'btn-primary'}`}
        onClick={onSubmit}
        disabled={submitDisabled}
      >
        {submitLabel}
      </button>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-sm font-semibold text-slate-600">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
