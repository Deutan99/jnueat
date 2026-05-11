import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import ManualPopup from './ManualPopup';
import restaurants from '../data/restaurant.json';

const GREETINGS = [
  '오늘은 뭐 먹을까? 🤔',
  '점심 메뉴 고민 끝!',
  '제주대 맛집 다 알려줄게',
  '귀찮으면 나한테 맡겨봐 🦌',
  '오늘도 든든하게 먹자!',
  '뭐 먹을지 모르겠지?',
];

export default function StartPage() {
  const [open, setOpen] = useState(false);
  const greeting = useMemo(
    () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    [],
  );

  return (
    <div className="relative isolate flex min-h-full flex-col overflow-hidden px-5 pt-6 pb-5">
      {/* 배경 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-mandarin/25 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />
        <svg
          className="absolute inset-x-0 bottom-0 h-40 w-full text-mandarin/25"
          viewBox="0 0 400 140"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,140 L0,90 Q70,30 140,75 T260,55 Q310,25 360,60 L400,40 L400,140 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* 상단바: 도움말 아이콘 우측 */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.3em] text-slate-400">
          JEJU NATIONAL UNIV
        </span>
        <button
          onClick={() => setOpen(true)}
          aria-label="사용 방법 보기"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-slate-500 ring-1 ring-slate-200 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand active:scale-95"
        >
          <span className="text-lg leading-none">?</span>
        </button>
      </div>

      {/* Hero */}
      <div className="mt-3 text-center">
        <h1 className="font-jua text-[40px] leading-none text-brand drop-shadow-sm">
          제대로 먹젠!?
        </h1>
        <span className="chip-mandarin mt-3 shadow-sm">
          <span>🍊</span> 제주대학교 주변 식당 추천
        </span>
      </div>

      {/* 캐릭터 + 말풍선 + 스탯 */}
      <div className="my-5 flex flex-col items-center">
        {/* 말풍선 */}
        <div className="relative animate-float-slow">
          <div className="rounded-2xl bg-white px-4 py-2 shadow-md ring-1 ring-slate-100">
            <p className="font-jua text-sm text-slate-700">{greeting}</p>
          </div>
          <div className="absolute left-1/2 -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45 bg-white ring-1 ring-slate-100" />
        </div>

        {/* 제록이 */}
        <div className="relative mt-3 animate-bob">
          <div className="absolute inset-0 -z-10 m-auto h-28 w-28 rounded-full bg-white/70 blur-xl" />
          <div className="absolute inset-0 -z-20 m-auto h-40 w-40 rounded-full bg-gradient-to-br from-mandarin/25 to-brand/10 blur-2xl" />
          <img
            src="/img/deer-mandarin.png"
            alt="귤 들고 있는 제록이"
            className="h-32 w-auto"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))',
            }}
          />
        </div>

        <p className="mt-2 font-jua text-sm text-slate-500">
          안녕! 나는 <span className="text-brand">제록이</span>야 🦌
        </p>

        {/* 스탯 */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200 shadow-sm backdrop-blur">
            <span className="text-mandarin-dark">●</span> {restaurants.length}곳 등록
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200 shadow-sm backdrop-blur">
            <span>🚶</span> 도보 15분 이내
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto space-y-3">
        <p className="text-center text-xs font-semibold tracking-wider text-slate-500">
          어떻게 정할까요?
        </p>

        <Link
          to="/ai"
          className="flex items-center gap-3 rounded-2xl bg-mandarin px-4 py-3.5 text-white shadow-md ring-1 ring-mandarin-dark/20 transition active:scale-[0.98] hover:bg-mandarin-dark"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 text-2xl">
            🦌
          </span>
          <span className="flex-1 text-left">
            <span className="block font-jua text-base leading-tight">제록이가 골라줘</span>
            <span className="block text-[11px] opacity-90">기분과 상황 기반 AI 추천</span>
          </span>
          <span className="text-xl opacity-80">›</span>
        </Link>

        <div className="grid grid-cols-3 gap-2">
          <Link
            to="/main"
            className="flex flex-col items-start gap-1 rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200 shadow-sm transition active:scale-[0.98] hover:ring-brand"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-xl">
              🎰
            </span>
            <span className="font-jua text-sm leading-tight text-slate-800">맡겨봐</span>
            <span className="text-[10px] text-slate-500">운명에 맡기기</span>
          </Link>
          <Link
            to="/categories"
            className="flex flex-col items-start gap-1 rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200 shadow-sm transition active:scale-[0.98] hover:ring-mandarin"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-mandarin/10 text-xl">
              📋
            </span>
            <span className="font-jua text-sm leading-tight text-slate-800">종류별로</span>
            <span className="text-[10px] text-slate-500">음식 종류로 보기</span>
          </Link>
          <Link
            to="/nearby"
            className="flex flex-col items-start gap-1 rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200 shadow-sm transition active:scale-[0.98] hover:ring-brand"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-xl">
              🗺️
            </span>
            <span className="font-jua text-sm leading-tight text-slate-800">가까운 곳</span>
            <span className="text-[10px] text-slate-500">지도로 둘러보기</span>
          </Link>
        </div>
      </div>

      {open && <ManualPopup onClose={() => setOpen(false)} />}
    </div>
  );
}
