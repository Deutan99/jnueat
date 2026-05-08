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
  const [rejectMode, setRejectMode] = useState(false);
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
    setRejectMode(false);
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
            <div className="relative grid h-full place-items-center px-3 text-center">
              <div className="pointer-events-none absolute inset-0 -z-0 m-auto h-32 w-32 rounded-full bg-mandarin/20 blur-3xl" />
              <div>
                <img
                  src="/img/deer-graduate.png"
                  alt="제록이"
                  className="mx-auto h-28 w-auto"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(255, 138, 61, 0.2))' }}
                />
                <p className="mt-2 text-sm text-slate-500">조건과 기분만 알려주면<br />제록이가 한 번에 골라줄게요</p>
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
                        <p className="font-jua text-xs text-brand">이거 어때? 🍊</p>
                      </div>
                      <div className="absolute -left-1 bottom-2 h-2.5 w-2.5 rotate-45 bg-white ring-1 ring-slate-100" />
                    </div>
                  </div>

                  {/* 식당 카드 */}
                  <div className="rounded-2xl bg-white px-4 py-4 shadow-md ring-1 ring-slate-100">
                    <p className="text-[10px] font-semibold tracking-[0.25em] text-mandarin-dark">
                      PICKED FOR YOU
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
            ) : rejectMode ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="왜 별로? (선택)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyReject(rejectReason); }}
                  className="w-full rounded-lg border-2 border-slate-300 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn-ghost text-base" onClick={() => { setRejectMode(false); setRejectReason(''); }}>
                    취소
                  </button>
                  <button className="btn-danger text-base" onClick={() => applyReject(rejectReason)}>
                    다른 거 추천
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-danger text-base" onClick={() => setRejectMode(true)}>
                  별로에요
                </button>
                <button className="btn-primary text-base" onClick={() => setStage(3)}>
                  좋아요
                </button>
              </div>
            )}
          </Footer>
        </>
      )}
    </Layout>
  );
}
