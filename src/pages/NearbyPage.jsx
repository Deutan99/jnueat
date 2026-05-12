import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout, { Contents, Footer } from '../components/Layout';
import Header from '../components/Header';
import ConditionForm from '../components/ConditionForm';
import ResultStage from '../components/ResultStage';
import restaurant from '../data/restaurant.json';
import palette from '../lib/palette';
import { walkingMinutes } from '../lib/distance';
import { loadKakaoMap, kakaoKeysPresent } from '../lib/kakao';

const STAGE_TITLES = {
  input: '어디서 출발할까요?',
  map: '지도로 보기',
  cats: '카테고리 선택',
  list: '식당 둘러보기',
  result: '오늘의 픽',
};

export default function NearbyPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('input');
  const [lastView, setLastView] = useState('map');
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

  const inCategory = useMemo(
    () => (category ? filtered.filter((r) => r.RES_GB === category) : []),
    [filtered, category],
  );

  const nav = (target) => {
    window.history.pushState({ stage: target }, '');
    setStage(target);
  };

  useEffect(() => {
    window.history.replaceState({ ...window.history.state, stage: 'input' }, '');
  }, []);

  useEffect(() => {
    const onPopState = (e) => {
      const target = e.state?.stage;
      if (typeof target !== 'string') return;
      setStage(target);
      if (target !== 'result') setPicked(null);
      if (target === 'input' || target === 'cats' || target === 'map') setCategory(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const goBack = () => {
    if (stage === 'input') return navigate('/');
    window.history.back();
  };

  function pickRestaurant(r, fromView) {
    setPicked(r);
    setLastView(fromView);
    nav('result');
  }

  if (stage === 'result' && picked) {
    return (
      <Layout>
        <Header onBack={goBack}>{STAGE_TITLES.result}</Header>
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

      {stage === 'input' && (
        <>
          <Contents>
            <div className="relative grid h-full place-items-center px-4 text-center overflow-hidden">
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/5 via-white to-mandarin-soft/20" />
                <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-brand/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-mandarin/15 blur-3xl" />
              </div>

              <div className="w-full max-w-xs space-y-4">
                <div className="relative mx-auto inline-block animate-float-slow">
                  <div className="rounded-2xl bg-white px-4 py-2 shadow-md ring-1 ring-slate-100">
                    <p className="font-jua text-sm text-brand">가까운 식당 찾아줄게! 🚶</p>
                  </div>
                  <div className="absolute left-1/2 -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45 bg-white ring-1 ring-slate-100" />
                </div>

                <div className="relative animate-bob">
                  <div className="absolute inset-0 -z-10 m-auto h-28 w-28 rounded-full bg-white/70 blur-xl" />
                  <div className="absolute inset-0 -z-20 m-auto h-40 w-40 rounded-full bg-gradient-to-br from-brand/20 to-mandarin/10 blur-2xl" />
                  <img
                    src="/img/deer-mandarin.png"
                    alt="제록이"
                    className="mx-auto h-32 w-auto"
                    style={{ filter: 'drop-shadow(0 4px 8px rgba(33, 131, 221, 0.2))' }}
                  />
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  위치와 도보 시간을 알려주면<br />
                  <span className="font-jua text-brand">지도</span>또는 <span className="font-jua text-mandarin-dark">카테고리</span>로도 볼 수 있어요
                </p>

                <div className="flex flex-wrap justify-center gap-1.5">
                  {['5', '10', '15'].map((t) => {
                    const active = time === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(active ? '' : t)}
                        className={`rounded-full px-2.5 py-1 text-[11px] shadow-sm backdrop-blur transition active:scale-95 ${
                          active
                            ? 'bg-brand text-white ring-1 ring-brand-dark'
                            : 'bg-white/80 text-slate-600 ring-1 ring-slate-200 hover:bg-white hover:ring-brand'
                        }`}
                      >
                        🚶 {t}분 이내
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Contents>
          <Footer>
            <ConditionForm
              location={location}
              time={time}
              onLocation={setLocation}
              onTime={setTime}
              showMood={false}
            >
              <ViewSelectButtons
                disabled={!location || !time || filtered.length === 0}
                noResult={!!location && !!time && filtered.length === 0}
                onMap={() => nav('map')}
                onCats={() => nav('cats')}
              />
            </ConditionForm>
          </Footer>
        </>
      )}

      {stage === 'map' && (
        <NearbyMapView
          location={location}
          time={time}
          filtered={filtered}
          onPick={(r) => pickRestaurant(r, 'map')}
        />
      )}

      {stage === 'cats' && (
        <NearbyCategoriesView
          filtered={filtered}
          location={location}
          time={time}
          onSelectCategory={(c) => { setCategory(c); nav('list'); }}
        />
      )}

      {stage === 'list' && (
        <NearbyListView
          category={category}
          inCategory={inCategory}
          onPick={(r) => pickRestaurant(r, 'list')}
        />
      )}
    </Layout>
  );
}

function ViewSelectButtons({ disabled, noResult, onMap, onCats }) {
  if (noResult) {
    return (
      <button className="btn-secondary w-full text-base mt-2" disabled>
        조건에 맞는 식당이 없어요
      </button>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <button
        className={`text-base flex items-center justify-center gap-1.5 rounded-2xl px-3 py-3 font-jua ${
          disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-brand text-white shadow-md hover:bg-brand-dark active:scale-[0.98] transition'
        }`}
        onClick={onMap}
        disabled={disabled}
      >
        <span className="text-lg">🗺️</span>
        <span>지도로 보기</span>
      </button>
      <button
        className={`text-base flex items-center justify-center gap-1.5 rounded-2xl px-3 py-3 font-jua ${
          disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-mandarin text-white shadow-md hover:bg-mandarin-dark active:scale-[0.98] transition'
        }`}
        onClick={onCats}
        disabled={disabled}
      >
        <span className="text-lg">📋</span>
        <span>카테고리로</span>
      </button>
    </div>
  );
}

function NearbyMapView({ location, time, filtered, onPick }) {
  const prefix = location?.name && time ? `${location.name} ${time}분 이내` : '근처';
  const mapEl = useRef(null);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      const el = target.closest?.('[data-pick-id]');
      if (!el) return;
      const id = el.getAttribute('data-pick-id');
      const r = filtered.find((x) => String(x.RES_ID) === String(id));
      if (r) onPick(r);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [filtered, onPick]);

  useEffect(() => {
    if (!kakaoKeysPresent.map) {
      setMapError('지도 API 키 없음 (.env에 VITE_KAKAO_MAP_KEY)');
      return;
    }
    let cancelled = false;
    loadKakaoMap().then((kakao) => {
      if (cancelled || !mapEl.current) return;
      const center = location
        ? new kakao.maps.LatLng(location.lat, location.lng)
        : new kakao.maps.LatLng(33.454705, 126.560767);
      const map = new kakao.maps.Map(mapEl.current, { center, level: 4 });

      if (location) {
        const userPos = new kakao.maps.LatLng(location.lat, location.lng);
        new kakao.maps.Marker({ map, position: userPos });
        new kakao.maps.CustomOverlay({
          map,
          position: userPos,
          yAnchor: 2.4,
          content: `<div class="kakao-user-label">📍 ${location.name ?? '내 위치'}</div>`,
        });
      }

      filtered.forEach((r) => {
        const pos = new kakao.maps.LatLng(r.RES_LAT, r.RES_LNG);
        const marker = new kakao.maps.Marker({ map, position: pos, clickable: true });
        const info = new kakao.maps.InfoWindow({
          content: `<div class="kakao-place-info">
            <div class="kakao-place-info__name">${r.RES_NAME}</div>
            <div class="kakao-place-info__meta">${r.RES_GB} · 도보 ${r._min}분</div>
            <div class="kakao-place-info__addr">${r.RES_ADDR}</div>
            <button data-pick-id="${r.RES_ID}" class="kakao-place-info__pick">이걸로! →</button>
          </div>`,
          removable: true,
        });
        kakao.maps.event.addListener(marker, 'click', () => info.open(map, marker));
      });

      if (filtered.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        if (location) bounds.extend(new kakao.maps.LatLng(location.lat, location.lng));
        filtered.forEach((r) => bounds.extend(new kakao.maps.LatLng(r.RES_LAT, r.RES_LNG)));
        map.setBounds(bounds);
      }
    }).catch((e) => setMapError(e.message));

    return () => { cancelled = true; };
  }, [location?.lat, location?.lng, filtered.length]);

  return (
    <>
      <Contents banner={mapError ? `지도 로드 실패: ${mapError}` : `${prefix} 식당 ${filtered.length}곳 · 마커를 눌러서 골라봐`}>
        {mapError ? (
          <div className="h-full overflow-auto p-2 space-y-2">
            {filtered.map((r) => (
              <button
                key={r.RES_ID}
                onClick={() => onPick(r)}
                className="block w-full rounded-xl bg-white px-3 py-3 text-left ring-1 ring-slate-200 hover:ring-brand"
              >
                <div className="font-jua text-base">{r.RES_NAME}</div>
                <div className="text-xs text-slate-500">{r.RES_GB} · 도보 {r._min}분</div>
              </button>
            ))}
          </div>
        ) : (
          <div ref={mapEl} className="h-full w-full" />
        )}
      </Contents>
    </>
  );
}

function NearbyCategoriesView({ filtered, location, time, onSelectCategory }) {
  const categories = useMemo(() => {
    const counts = new Map();
    for (const r of filtered) counts.set(r.RES_GB, (counts.get(r.RES_GB) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const prefix = location?.name && time ? `${location.name} ${time}분 이내` : '도보 거리 안';

  return (
    <>
      <Contents banner={`${prefix} 식당 ${filtered.length}곳 · ${categories.length}개 카테고리`}>
        <div className="grid h-full grid-cols-2 gap-2 overflow-auto p-2 content-start">
          {categories.map(([cat, count], i) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
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
  );
}

function NearbyListView({ category, inCategory, onPick }) {
  return (
    <>
      <Contents banner={`${category} · ${inCategory.length}곳 · 가까운 순`}>
        <div className="h-full overflow-auto p-2 space-y-2">
          {inCategory.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">이 카테고리에 식당이 없어요</p>
          ) : (
            inCategory.map((r) => (
              <button
                key={r.RES_ID}
                onClick={() => onPick(r)}
                className="block w-full rounded-xl bg-white px-3 py-3 text-left ring-1 ring-slate-200 transition hover:ring-brand"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-jua text-base text-slate-900">{r.RES_NAME}</div>
                  <div className="shrink-0 text-xs font-semibold text-mandarin-dark">도보 {r._min}분</div>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{r.RES_ADDR}</div>
              </button>
            ))
          )}
        </div>
      </Contents>
      <Footer>
        <p className="text-center text-xs text-slate-400">탭하면 식당 정보가 보여요</p>
      </Footer>
    </>
  );
}
