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
  children,
}) {
  return (
    <div className="space-y-1.5">
      <Field label="위치">
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
      </Field>
      {showTime && (
        <Field label="도보 시간">
          <select className="field" value={time || ''} onChange={(e) => onTime(e.target.value)}>
            <option value="">소요 시간 선택</option>
            <option value="5">5분 이내</option>
            <option value="10">10분 이내</option>
            <option value="15">15분 이내</option>
          </select>
        </Field>
      )}
      {showMood && (
        <Field label="기분 (선택)">
          <input
            className="field"
            type="text"
            placeholder="예: 따끈한 국물, 가벼운 한 끼"
            value={mood || ''}
            maxLength={100}
            onChange={(e) => onMood(e.target.value)}
          />
        </Field>
      )}
      {children ?? (
        <button
          className={`w-full text-base mt-1.5 ${submitDisabled ? 'btn-secondary' : 'btn-primary'}`}
          onClick={onSubmit}
          disabled={submitDisabled}
        >
          {submitLabel}
        </button>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-[11px] font-semibold tracking-wide text-slate-500">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </label>
  );
}
