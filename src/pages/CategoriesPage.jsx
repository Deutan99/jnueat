import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout, { Contents, Footer } from '../components/Layout';
import Header from '../components/Header';
import ResultStage from '../components/ResultStage';
import restaurant from '../data/restaurant.json';
import palette from '../lib/palette';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(1);
  const [category, setCategory] = useState(null);
  const [picked, setPicked] = useState(null);

  const categories = useMemo(() => {
    const counts = new Map();
    for (const r of restaurant) counts.set(r.RES_GB, (counts.get(r.RES_GB) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const inCategory = useMemo(
    () => (category ? restaurant.filter((r) => r.RES_GB === category) : []),
    [category],
  );

  const nav = (target) => {
    window.history.pushState({ stage: target }, '');
    setStage(target);
  };

  useEffect(() => {
    window.history.replaceState({ ...window.history.state, stage: 1 }, '');
  }, []);

  useEffect(() => {
    const onPopState = (e) => {
      const target = e.state?.stage;
      if (typeof target !== 'number') return;
      setStage(target);
      if (target < 3) setPicked(null);
      if (target < 2) setCategory(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const goBack = () => {
    if (stage === 1) return navigate('/');
    window.history.back();
  };

  if (stage === 3 && picked) {
    return (
      <Layout>
        <Header onBack={goBack}>오늘의 픽</Header>
        <ResultStage
          resName={picked.RES_NAME}
          resUrl={picked.RES_URL}
          category={picked.RES_GB}
          walkingMin={null}
          address={picked.RES_ADDR}
        />
      </Layout>
    );
  }

  const title = stage === 1 ? '카테고리 선택' : `${category} (${inCategory.length}곳)`;

  return (
    <Layout>
      <Header onBack={goBack}>{title}</Header>

      {stage === 1 && (
        <>
          <Contents banner={`전체 ${restaurant.length}곳 · ${categories.length}개 카테고리`}>
            <div className="grid h-full grid-cols-2 gap-2 overflow-auto p-2 content-start">
              {categories.map(([cat, count], i) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); nav(2); }}
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

      {stage === 2 && (
        <>
          <Contents>
            <div className="h-full overflow-auto p-2 space-y-2">
              {inCategory.map((r) => (
                <button
                  key={r.RES_ID}
                  onClick={() => { setPicked(r); nav(3); }}
                  className="block w-full rounded-xl bg-white px-3 py-3 text-left ring-1 ring-slate-200 transition hover:ring-brand"
                >
                  <div className="font-jua text-base text-slate-900">{r.RES_NAME}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{r.RES_ADDR}</div>
                </button>
              ))}
            </div>
          </Contents>
          <Footer>
            <p className="text-center text-xs text-slate-400">탭하면 식당 정보가 보여요</p>
          </Footer>
        </>
      )}
    </Layout>
  );
}
