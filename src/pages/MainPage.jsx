import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import MapStage from '../components/MapStage';
import RouletteStage from '../components/RouletteStage';
import ResultStage from '../components/ResultStage';
import { walkingMinutes } from '../lib/distance';

const STAGE_TITLES = {
  1: '어디서 출발할까요?',
  2: '오늘 음식은?',
  3: '근처 식당이에요',
  4: '식당을 골라볼까요?',
  5: '오늘의 픽',
};

const initialState = {
  curStage: 1,
  location: null,
  time: '',
  mood: '',
  mapList: [],
  rouletteList: [],
  rouletteResult: null,
  rejections: [],
};

export default function MainPage() {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const nextStage = (patch) => {
    setHistory((h) => [...h, state]);
    setState((s) => ({ ...s, ...(patch || {}), curStage: Math.min(5, s.curStage + 1) }));
    window.history.pushState(null, '');
  };

  const prevStage = () => {
    if (history.length === 0) {
      navigate('/');
      return;
    }
    window.history.back();
  };

  useEffect(() => {
    const onPopState = () => {
      setHistory((h) => {
        if (h.length === 0) return h;
        setState(h[h.length - 1]);
        return h.slice(0, -1);
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const isMapStage =
    state.curStage !== 5 && state.curStage % 2 === 1;
  const isRouletteStage =
    state.curStage !== 5 && state.curStage % 2 === 0;

  const resultMeta = useMemo(() => {
    if (state.curStage !== 5 || !state.rouletteResult?.text) return {};
    const r = state.mapList.find((m) => m.RES_NAME === state.rouletteResult.text);
    if (!r) return {};
    const min = state.location
      ? walkingMinutes(state.location.lat, state.location.lng, r.RES_LAT, r.RES_LNG)
      : null;
    return { category: r.RES_GB, walkingMin: min, address: r.RES_ADDR };
  }, [state.curStage, state.rouletteResult, state.mapList, state.location]);

  return (
    <Layout>
      <Header onBack={prevStage}>{STAGE_TITLES[state.curStage]}</Header>
      <ProgressBar curStage={state.curStage} />

      {state.curStage === 5 && (
        <ResultStage
          resName={state.rouletteResult?.text}
          resUrl={state.rouletteResult?.url}
          category={resultMeta.category}
          walkingMin={resultMeta.walkingMin}
          address={resultMeta.address}
        />
      )}
      {isMapStage && (
        <MapStage state={state} setState={setState} nextStage={nextStage} />
      )}
      {isRouletteStage && (
        <RouletteStage state={state} setState={setState} nextStage={nextStage} />
      )}
    </Layout>
  );
}
