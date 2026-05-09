import { useEffect, useRef, useState } from 'react';
import { Contents, Footer } from './Layout';
import { aiRecommend } from '../lib/aiRecommend';
import { walkingMinutes } from '../lib/distance';

const CATEGORY_SHORT_LABEL = {
  '찜-탕-찌개': '찌개',
  '백반-죽-국수': '백반',
  '돈까스-회-일식': '일식',
  '고기-구이': '고기',
  '패스트푸드': '패스트',
  '마라요리': '마라',
};

function buildEnrichedCandidates(state) {
  if (state.curStage === 4) {
    return state.rouletteList.map((item) => {
      const r = state.mapList.find((m) => m.RES_NAME === item.text);
      if (!r || !state.location) return { text: item.text };
      return {
        text: item.text,
        category: r.RES_GB,
        walkingMinutes: walkingMinutes(state.location.lat, state.location.lng, r.RES_LAT, r.RES_LNG),
        address: r.RES_ADDR,
      };
    });
  }
  return state.rouletteList.map((item) => ({
    text: item.text,
    count: state.mapList.filter((m) => m.RES_GB === item.text).length,
  }));
}

export default function RouletteStage({ state, setState, nextStage }) {
  const wheelRef = useRef(null);
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState(null);
  const [aiReason, setAIReason] = useState(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (state.rouletteList?.length === 1) {
      nextStage({
        rouletteResult: state.rouletteList[0],
        rouletteList: [],
      });
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !window.Winwheel) return;
    if (!state.rouletteList?.length) return;

    const segCount = state.rouletteList.length;
    const isCategoryStage = state.curStage === 2;
    const fontSize = segCount > 12 ? 16 : segCount > 8 ? 18 : segCount > 5 ? 20 : 22;
    const maxChars = segCount > 12 ? 4 : segCount > 8 ? 5 : segCount > 5 ? 6 : 8;
    const truncate = (t) => {
      if (isCategoryStage && CATEGORY_SHORT_LABEL[t]) return CATEGORY_SHORT_LABEL[t];
      return t.length > maxChars ? t.slice(0, maxChars - 1) + '…' : t;
    };
    const innerRadius = segCount > 8 ? 44 : 36;

    wheelRef.current = new window.Winwheel({
      canvasId: canvasRef.current.id,
      numSegments: segCount,
      outerRadius: 160,
      innerRadius,
      textFontSize: fontSize,
      textFontWeight: 'bold',
      textOrientation: 'horizontal',
      textAlignment: 'outer',
      textMargin: 6,
      lineWidth: 2,
      strokeStyle: '#fff',
      segments: state.rouletteList.map((seg) => ({
        fillStyle: seg.fillStyle,
        text: truncate(seg.text),
      })),
      animation: {
        type: 'spinToStop',
        duration: 5,
        spins: 8,
        callbackFinished: handleStop,
      },
      pointerGuide: { display: false },
    });
    wheelRef.current.draw();

    function handleStop(seg) {
      const picked = state.rouletteList.find((s) => truncate(s.text) === seg.text);
      setWinner(picked);
      setState((prev) => ({ ...prev, rouletteResult: picked }));
      setSpinning(false);
    }

    return () => {
      wheelRef.current?.stopAnimation?.(false);
    };
  }, [state.rouletteList]);

  function startSpin() {
    if (spinning || !wheelRef.current) return;
    setWinner(null);
    setAIReason(null);
    setAIError(null);
    wheelRef.current.stopAnimation(false);
    wheelRef.current.rotationAngle = 0;
    wheelRef.current.draw();
    wheelRef.current.startAnimation();
    setSpinning(true);
  }

  async function handleAI() {
    if (aiLoading || spinning) return;
    if (!state.rouletteList?.length) {
      setAIError('현재 후보가 비어있어요. 뒤로 가서 위치·시간 조건을 넓혀줘.');
      return;
    }
    setAILoading(true);
    setAIError(null);
    setAIReason(null);
    try {
      const mode = state.curStage === 2 ? 'category' : 'restaurant';
      const candidates = buildEnrichedCandidates(state);
      const { pickedText, reason } = await aiRecommend({
        mode,
        candidates,
        mood: state.mood || '',
        rejections: state.rejections || [],
      });
      const picked =
        state.rouletteList.find((s) => s.text === pickedText) ?? state.rouletteList[0];
      setWinner(picked);
      setAIReason(reason);
      setState((prev) => ({ ...prev, rouletteResult: picked }));
    } catch (e) {
      setAIError(e.message);
    } finally {
      setAILoading(false);
    }
  }

  function applyReject(reasonText) {
    const rejected = { text: winner?.text, reason: reasonText || '' };
    if (state.rouletteList.length <= 2) {
      const remaining = state.rouletteList.find((s) => s.text !== winner?.text);
      nextStage({
        rouletteResult: remaining,
        rouletteList: [],
        rejections: [...(state.rejections || []), rejected],
      });
      return;
    }
    setState((prev) => ({
      ...prev,
      rouletteList: prev.rouletteList.filter((s) => s.text !== winner?.text),
      rouletteResult: null,
      rejections: [...(prev.rejections || []), rejected],
    }));
    setWinner(null);
    setAIReason(null);
    setRejectMode(false);
    setRejectReason('');
  }

  function accept() {
    setState((prev) => ({ ...prev, rouletteList: [] }));
    nextStage();
  }

  const winwheelMissing = !window.Winwheel;
  const banner = aiError
    ? `AI 추천 실패: ${aiError}`
    : aiReason
      ? `AI 추천 이유: ${aiReason}`
      : winwheelMissing
        ? 'Winwheel.js 미로드 (public/Winwheel.js 확인)'
        : null;

  return (
    <>
      <Contents banner={banner}>
        <div className="relative h-full w-full">
          <div className="absolute inset-x-0 top-2 text-center font-jua text-lg text-brand">
            {winner ? `"${winner.text}" 어떠신가요?` : '오늘 뭐 먹지? 🎰'}
          </div>
          <div className="grid h-full place-items-center pt-8">
            <div className="relative">
              {/* SVG Pointer */}
              <div className="absolute left-1/2 -top-3 z-20 -translate-x-1/2">
                <svg width="36" height="42" viewBox="0 0 36 42" className="drop-shadow-md">
                  <path
                    d="M18 38 L3 8 L33 8 Z"
                    fill="#ef4444"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Wheel — entire area is tappable */}
              <div
                role="button"
                tabIndex={!winner && !spinning ? 0 : -1}
                onClick={!winner && !spinning ? startSpin : undefined}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !winner && !spinning) {
                    e.preventDefault();
                    startSpin();
                  }
                }}
                className={`relative rounded-full ${!winner && !spinning ? 'cursor-pointer' : ''}`}
                style={{ filter: 'drop-shadow(0 10px 20px rgba(33, 131, 221, 0.18))' }}
              >
                <canvas id="wheel-canvas" ref={canvasRef} width="340" height="340" />
              </div>

              {/* SPIN button */}
              {!winner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startSpin();
                  }}
                  disabled={spinning}
                  className={`absolute inset-0 m-auto h-20 w-20 rounded-full bg-brand text-sm font-bold tracking-wide text-white ring-4 ring-white transition disabled:opacity-60 ${
                    spinning
                      ? 'shadow-md'
                      : 'shadow-xl shadow-brand/40 hover:bg-brand-dark animate-spin-pulse'
                  }`}
                >
                  {spinning ? '돌리는중' : 'SPIN'}
                </button>
              )}
            </div>
          </div>
        </div>
      </Contents>
      <Footer>
        {!winner ? (
          <button
            onClick={handleAI}
            disabled={aiLoading || spinning}
            className="btn-ghost w-full text-base disabled:opacity-50"
          >
            {aiLoading ? 'AI가 고르는 중…' : 'AI에게 추천받기'}
          </button>
        ) : rejectMode ? (
          <div className="space-y-2">
            <input
              autoFocus
              type="text"
              placeholder="왜 별로? (선택, 예: 어제 먹었음 / 느끼함)"
              value={rejectReason}
              maxLength={200}
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
            <button className="btn-danger text-lg" onClick={() => setRejectMode(true)}>별로에요</button>
            <button className="btn-primary text-lg" onClick={accept}>좋아요</button>
          </div>
        )}
      </Footer>
    </>
  );
}
