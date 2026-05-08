import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout, { Contents, Footer } from '../components/Layout';
import Header from '../components/Header';
import ConditionForm from '../components/ConditionForm';
import ResultStage from '../components/ResultStage';
import restaurant from '../data/restaurant.json';
import palette from '../lib/palette';
import { walkingMinutes } from '../lib/distance';

const STAGE_TITLES = {
  1: '어디서 출발할까요?',
  2: '카테고리 선택',
  3: '식당 둘러보기',
  4: '오늘의 픽',
};

export default function BrowsePage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(1);
  const [location, setLocation] = useState(null);
  const [time, setTime] = useState('');
  const [category, setCategory] = useState(null);
  const [picked, setPicked] = useState(null);

  const filtered = useMemo(() => {
    if (!location || !time) return [];
    const t = Number(time);
    return restaurant
      .map((r) => ({ ...r, _min: walkingMinutes(location.lat, location.lng, r.RES_LAT, r.RES_LNG) }))
      .filter((r) => r._min <= t)
      .sort((a, b) => a._min - b._min);
  }, [location, time]);

  const categories = useMemo(() => {
    const counts = new Map();
    for (const r of filtered) counts.set(r.RES_GB, (counts.get(r.RES_GB) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const inCategory = useMemo(
    () => (category ? filtered.filter((r) => r.RES_GB === category) : []),
    [filtered, category],
  );

  const goBack = () => {
    if (stage === 1) return navigate('/');
    setStage((s) => s - 1);
    if (stage === 3) setCategory(null);
    if (stage === 4) setPicked(null);
  };

  if (stage === 4 && picked) {
    return (
      <Layout>
        <Header onBack={goBack}>{STAGE_TITLES[4]}</Header>
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
            <div className="grid h-full place-items-center px-3 text-center">
              <div>
                <img src="/img/제록이2.png" alt="제록이" className="mx-auto h-28 w-auto" />
                <p className="mt-2 text-sm text-slate-500">위치와 도보 시간을 알려줘</p>
              </div>
            </div>
          </Contents>
          <Footer>
            <ConditionForm
              location={location}
              time={time}
              onLocation={setLocation}
              onTime={setTime}
              onSubmit={() => setStage(2)}
              submitDisabled={!location || !time || filtered.length === 0}
              submitLabel={filtered.length === 0 && location && time ? '조건에 맞는 식당이 없어요' : '둘러보기'}
              showMood={false}
            />
          </Footer>
        </>
      )}

      {stage === 2 && (
        <>
          <Contents banner={`도보 ${time}분 이내 식당 ${filtered.length}곳`}>
            <div className="grid h-full grid-cols-2 gap-2 overflow-auto p-2 content-start">
              {categories.map(([cat, count], i) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setStage(3); }}
                  className="rounded-xl px-3 py-4 text-center font-jua text-base shadow-sm ring-1 ring-slate-200 transition hover:scale-[1.02] hover:ring-mandarin"
                  style={{ backgroundColor: `${palette[i % palette.length]}33` }}
                >
                  <div>{cat}</div>
                  <div className="mt-1 text-xs font-normal text-slate-600">{count}곳</div>
                </button>
              ))}
            </div>
          </Contents>
          <Footer>
            <p className="text-center text-xs text-slate-400">카테고리를 골라줘</p>
          </Footer>
        </>
      )}

      {stage === 3 && (
        <>
          <Contents banner={`${category} · 가까운 순`}>
            <div className="h-full overflow-auto p-2 space-y-2">
              {inCategory.map((r) => (
                <button
                  key={r.RES_ID}
                  onClick={() => { setPicked(r); setStage(4); }}
                  className="block w-full rounded-xl bg-white px-3 py-3 text-left ring-1 ring-slate-200 transition hover:ring-brand"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-jua text-base text-slate-900">{r.RES_NAME}</div>
                    <div className="shrink-0 text-xs font-semibold text-mandarin-dark">도보 {r._min}분</div>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{r.RES_ADDR}</div>
                </button>
              ))}
              {inCategory.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-8">이 카테고리에 식당이 없어요</p>
              )}
            </div>
          </Contents>
          <Footer>
            <p className="text-center text-xs text-slate-400">탭하면 카카오맵으로 연결돼요</p>
          </Footer>
        </>
      )}
    </Layout>
  );
}
