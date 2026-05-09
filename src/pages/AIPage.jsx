import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout, { Contents, Footer } from '../components/Layout';
import Header from '../components/Header';
import ConditionForm from '../components/ConditionForm';
import ResultStage from '../components/ResultStage';
import restaurant from '../data/restaurant.json';
import { walkingMinutes } from '../lib/distance';
import { aiRecommend } from '../lib/aiRecommend';

const STAGE_TITLES = {
  1: '제록이가 골라줄게요',
  2: '추천 결과',
  3: '오늘의 픽',
};

export default function AIPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(1);
  const [location, setLocation] = useState(null);
  const [time, setTime] = useState('');
  const [mood, setMood] = useState('');
  const [picked, setPicked] = useState(null);
  const [reason, setReason] = useState('');
  const [rejections, setRejections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = useMemo(() => {
    if (!location || !time) return [];
    const t = Number(time);
    return restaurant
      .map((r) => ({ ...r, _min: walkingMinutes(location.lat, location.lng, r.RES_LAT, r.RES_LNG) }))
      .filter((r) => r._min <= t);
  }, [location, time]);

  const remaining = useMemo(
    () => filtered.filter((r) => !rejections.find((x) => x.text === r.RES_NAME)),
    [filtered, rejections],
  );

  async function fetchPick() {
    if (remaining.length === 0) {
      setError('남은 후보가 없어요. 조건을 넓히거나 처음부터 다시.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const candidates = remaining.map((r) => ({
        text: r.RES_NAME,
        category: r.RES_GB,
        walkingMinutes: r._min,
        address: r.RES_ADDR,
      }));
      const res = await aiRecommend({ mode: 'restaurant', candidates, mood, rejections });
      const found = filtered.find((r) => r.RES_NAME === res.pickedText) ?? remaining[0];
      setPicked(found);
      setReason(res.reason || '');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function start() {
    setStage(2);
    await fetchPick();
  }

  function applyReject(text) {
    setRejections((prev) => [...prev, { text: picked?.RES_NAME, reason: text || '' }]);
    setRejectReason('');
    setPicked(null);
    setReason('');
    fetchPick();
  }

  function goBack() {
    if (stage === 1) return navigate('/');
    if (stage === 3) {
      setStage(2);
      setPicked(null);
      setReason('');
      return;
    }
    setStage(1);
    setPicked(null);
    setReason('');
    setRejections([]);
    setError(null);
  }

  if (stage === 3 && picked) {
    return (
      <Layout>
        <Header onBack={goBack}>{STAGE_TITLES[3]}</Header>
        <ResultStage
          resName={picked.RES_NAME}
          resUrl={picked.RES_URL}
          category={picked.RES_GB}
          walkingMin={picked._min}
          address={picked.RES_ADDR}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header onBack={goBack}>{STAGE_TITLES[stage]}</Header>

      {stage === 1 && (
        <>
          <Contents>
            <div className="relative grid h-full place-items-center px-4 text-center overflow-hidden">
              {/* 배경 그라디언트 */}
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-mandarin-soft/40 via-white to-cream/40" />
                <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-mandarin/25 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-brand/15 blur-3xl" />
              </div>

              <div className="w-full max-w-xs space-y-4">
                {/* 말풍선 */}
                <div className="relative mx-auto inline-block animate-float-slow">
                  <div className="rounded-2xl bg-white px-4 py-2 shadow-md ring-1 ring-slate-100">
                    <p className="font-jua text-sm text-mandarin-dark">기분만 알려줘! 🦌</p>
                  </div>
                  <div className="absolute left-1/2 -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45 bg-white ring-1 ring-slate-100" />
                </div>

                {/* 캐릭터 */}
                <div className="relative animate-bob">
                  <div className="absolute inset-0 -z-10 m-auto h-28 w-28 rounded-full bg-white/70 blur-xl" />
                  <div className="absolute inset-0 -z-20 m-auto h-40 w-40 rounded-full bg-gradient-to-br from-mandarin/25 to-brand/10 blur-2xl" />
                  <img
                    src="/img/deer-graduate.png"
                    alt="학사 제록이"
                    className="mx-auto h-32 w-auto"
                    style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))' }}
                  />
                </div>

                {/* 안내 */}
                <p className="text-sm leading-relaxed text-slate-600">
                  조건과 기분을 알려주면<br />
                  <span className="font-jua text-mandarin-dark">AI가 한 번에</span> 골라줄게요
                </p>

                {/* 기분 예시 칩 */}
                <div className="flex flex-wrap justify-center gap-1.5">
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 shadow-sm backdrop-blur">🍜 따끈한</span>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 shadow-sm backdrop-blur">🥗 가벼운</span>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 shadow-sm backdrop-blur">🥩 든든한</span>
                </div>
              </div>
            </div>
          </Contents>
          <Footer>
            <ConditionForm
              location={location}
              time={time}
              mood={mood}
              onLocation={setLocation}
              onTime={setTime}
              onMood={setMood}
              onSubmit={start}
              submitDisabled={!location || !time || filtered.length === 0}
              submitLabel={
                filtered.length === 0 && location && time ? '조건에 맞는 식당이 없어요' : '제록이에게 맡기기'
              }
            />
          </Footer>
        </>
      )}

      {stage === 2 && (
        <>
          <Contents banner={error ? `오류: ${error}` : null}>
            <div className="relative grid h-full place-items-center px-4 text-center overflow-hidden">
              {/* 배경 데코 */}
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-mandarin-soft/30" />
                <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-mandarin/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
              </div>

              {loading ? (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 -z-10 m-auto h-32 w-32 rounded-full bg-mandarin/30 blur-2xl animate-pulse" />
                    <img
                      src="/img/deer-mandarin.png"
                      alt="고민중"
                      className="mx-auto h-28 w-auto animate-pulse"
                      style={{ filter: 'drop-shadow(0 4px 8px rgba(255, 138, 61, 0.25))' }}
                    />
                  </div>
                  <p className="text-sm text-slate-500">제록이가 고르는 중…</p>
                  <p className="text-xs text-slate-400">{remaining.length}곳 후보 검토</p>
                </div>
              ) : picked ? (
                <div className="w-full max-w-xs space-y-3">
                  {/* 제록이 + 말풍선 */}
                  <div className="flex items-end justify-center gap-1">
                    <div className="relative animate-bob">
                      <div className="absolute inset-0 -z-10 m-auto h-24 w-24 rounded-full bg-white/70 blur-xl" />
                      <div className="absolute inset-0 -z-20 m-auto h-32 w-32 rounded-full bg-gradient-to-br from-mandarin/25 to-brand/10 blur-2xl" />
                      <img
                        src="/img/deer-happy.png"
                        alt="추천!"
                        className="h-28 w-auto"
                        style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))' }}
                      />
                    </div>
                    <div className="relative mb-3 -ml-2">
                      <div className="rounded-2xl bg-white px-3 py-1.5 shadow-md ring-1 ring-slate-100">
                        <p className="font-jua text-xs text-brand">오늘은 이거! 🎉</p>
                      </div>
                      <div className="absolute -left-1 bottom-2 h-2.5 w-2.5 rotate-45 bg-white ring-1 ring-slate-100" />
                    </div>
                  </div>

                  {/* 식당 카드 */}
                  <div className="rounded-2xl bg-white px-4 py-4 shadow-md ring-1 ring-slate-100">
                    <p className="text-xs font-semibold text-mandarin-dark">
                      🦌 제록이 추천
                    </p>
                    <h2 className="mt-1 font-jua text-3xl leading-tight text-brand">
                      {picked.RES_NAME}
                    </h2>

                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                      <span className="chip-mandarin">{picked.RES_GB}</span>
                      <span className="chip-brand">🚶 도보 {picked._min}분</span>
                    </div>

                    {picked.RES_ADDR && (
                      <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-left">
                        <span className="text-sm">📍</span>
                        <p className="text-[11px] leading-relaxed text-slate-600">{picked.RES_ADDR}</p>
                      </div>
                    )}
                  </div>

                  {/* AI 추천 사유 — 인용 카드 */}
                  {reason && (
                    <div className="relative rounded-2xl bg-gradient-to-br from-mandarin-soft to-cream px-4 py-3 text-left ring-1 ring-mandarin/20 shadow-sm">
                      <span className="absolute -top-2 left-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-mandarin-dark ring-1 ring-mandarin/30 shadow-sm">
                        🦌 제록이의 한 마디
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-slate-700">{reason}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">결과를 받지 못했어요</p>
              )}
            </div>
          </Contents>
          <Footer>
            {loading ? (
              <p className="text-center text-xs text-slate-400">잠시만요…</p>
            ) : !picked ? (
              <button onClick={fetchPick} className="btn-primary w-full text-base">
                다시 시도
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="왜 별로인지 알려주면 다음엔 더 잘 골라볼게! (선택)"
                  value={rejectReason}
                  maxLength={200}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn-danger text-base" onClick={() => applyReject(rejectReason)}>
                    다른 거 보여줘
                  </button>
                  <button className="btn-primary text-base" onClick={() => setStage(3)}>
                    이걸로!
                  </button>
                </div>
              </div>
            )}
          </Footer>
        </>
      )}
    </Layout>
  );
}
