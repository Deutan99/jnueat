import { useEffect, useRef, useState } from 'react';
import restaurant from '../data/restaurant.json';
import palette from '../lib/palette';
import { walkingMinutes } from '../lib/distance';
import { loadKakaoMap, kakaoKeysPresent } from '../lib/kakao';
import { Contents, Footer } from './Layout';
import SelectBox from './SelectBox';

const JNU_CENTER = { lat: 33.454705, lng: 126.560767 };

function uniqueRouletteList(list, isCategoryStage) {
  if (isCategoryStage) {
    const cats = [...new Set(list.map((r) => r.RES_GB))];
    return cats.map((text, i) => ({
      fillStyle: palette[i % palette.length],
      text,
      url: '',
    }));
  }
  return list.map((r, i) => ({
    fillStyle: palette[i % palette.length],
    text: r.RES_NAME,
    url: r.RES_URL,
  }));
}

function filterRestaurants(state) {
  if (!state.location || !state.time) return [];
  const t = Number(state.time);
  return restaurant.filter((r) => {
    const m = walkingMinutes(state.location.lat, state.location.lng, r.RES_LAT, r.RES_LNG);
    if (m > t) return false;
    if (state.curStage === 3 && state.rouletteResult?.text) {
      return r.RES_GB === state.rouletteResult.text;
    }
    return true;
  });
}

export default function MapStage({ state, setState, nextStage }) {
  const mapEl = useRef(null);
  const [mapError, setMapError] = useState(null);
  const isCategoryStage = state.curStage === 1;

  useEffect(() => {
    const filtered = filterRestaurants(state);
    setState((s) => ({
      ...s,
      mapList: filtered,
      rouletteList: uniqueRouletteList(filtered, isCategoryStage),
    }));
  }, [state.location, state.time, state.curStage, state.rouletteResult?.text]);

  useEffect(() => {
    if (!kakaoKeysPresent.map) {
      setMapError('지도 API 키가 없습니다 (.env에 VITE_KAKAO_MAP_KEY 추가)');
      return;
    }
    let cancelled = false;
    loadKakaoMap().then((kakao) => {
      if (cancelled || !mapEl.current) return;
      const center = state.location
        ? new kakao.maps.LatLng(state.location.lat, state.location.lng)
        : new kakao.maps.LatLng(JNU_CENTER.lat, JNU_CENTER.lng);
      const map = new kakao.maps.Map(mapEl.current, { center, level: 5 });

      if (state.location) {
        const userPos = new kakao.maps.LatLng(state.location.lat, state.location.lng);
        new kakao.maps.Marker({ map, position: userPos });
        new kakao.maps.CustomOverlay({
          map,
          position: userPos,
          yAnchor: 2.4,
          content: `<div class="kakao-user-label">📍 ${state.location.name ?? '내 위치'}</div>`,
        });
      }

      const filtered = filterRestaurants(state);
      const walkMin = state.location
        ? (r) => walkingMinutes(state.location.lat, state.location.lng, r.RES_LAT, r.RES_LNG)
        : () => null;

      filtered.forEach((r) => {
        const pos = new kakao.maps.LatLng(r.RES_LAT, r.RES_LNG);
        const marker = new kakao.maps.Marker({ map, position: pos, clickable: true });

        const min = walkMin(r);
        const info = new kakao.maps.InfoWindow({
          content: `<div class="kakao-place-info">
            <div class="kakao-place-info__name">${r.RES_NAME}</div>
            <div class="kakao-place-info__meta">${r.RES_GB}${min != null ? ` · 도보 ${min}분` : ''}</div>
            <div class="kakao-place-info__addr">${r.RES_ADDR}</div>
          </div>`,
          removable: true,
        });
        kakao.maps.event.addListener(marker, 'click', () => info.open(map, marker));
      });
    }).catch((e) => setMapError(e.message));

    return () => { cancelled = true; };
  }, [state.location?.lat, state.location?.lng, state.time, state.curStage, state.rouletteResult?.text]);

  return (
    <>
      <Contents banner={mapError}>
        {mapError ? (
          <FallbackList state={state} />
        ) : (
          <div ref={mapEl} className="h-full w-full" />
        )}
      </Contents>
      <Footer>
        <SelectBox
          state={state}
          onLocation={(loc) => setState((s) => ({ ...s, location: loc }))}
          onTime={(t) => setState((s) => ({ ...s, time: t }))}
          onMood={(m) => setState((s) => ({ ...s, mood: m }))}
          onNext={nextStage}
        />
      </Footer>
    </>
  );
}

function FallbackList({ state }) {
  const list = filterRestaurants(state);
  return (
    <div className="h-full overflow-auto p-3 space-y-2">
      <p className="text-xs text-slate-500">
        지도 대신 목록 표시 (조건에 맞는 {list.length}곳)
      </p>
      {list.map((r) => (
        <div key={r.RES_ID} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <div className="font-semibold">{r.RES_NAME}</div>
          <div className="text-xs text-slate-500">{r.RES_GB} · {r.RES_ADDR}</div>
        </div>
      ))}
    </div>
  );
}
