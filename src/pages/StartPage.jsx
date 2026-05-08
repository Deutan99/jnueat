import { Link } from 'react-router-dom';
import { useState } from 'react';
import ManualPopup from './ManualPopup';

const MODES = [
  {
    to: '/main',
    icon: '🎰',
    title: '룰렛으로 정하기',
    desc: '돌려서 운명에 맡기기',
    cls: 'bg-brand text-white hover:bg-brand-dark ring-brand/20',
  },
  {
    to: '/ai',
    icon: '🦌',
    title: '제록이가 골라줘',
    desc: '기분/상황 기반 AI 추천',
    cls: 'bg-mandarin text-white hover:bg-mandarin-dark ring-mandarin/20',
  },
  {
    to: '/browse',
    icon: '📋',
    title: '카테고리별 둘러보기',
    desc: '거리순으로 직접 고르기',
    cls: 'bg-white text-slate-800 hover:bg-cream ring-slate-200',
  },
];

export default function StartPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative isolate flex min-h-full flex-col overflow-hidden px-6 pt-10 pb-6">
      {/* 배경 layers — isolate로 stacking context 격리 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* 상단 부드러운 만다린 글로우 */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-mandarin/30 blur-3xl" />
        {/* 하단 한라산 실루엣 — 진하게 */}
        <svg
          className="absolute inset-x-0 bottom-0 h-48 w-full text-mandarin/35"
          viewBox="0 0 400 140"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,140 L0,90 Q70,30 140,75 T260,55 Q310,25 360,60 L400,40 L400,140 Z"
            fill="currentColor"
          />
        </svg>
        <svg
          className="absolute inset-x-0 bottom-0 h-32 w-full text-brand/20"
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,100 L0,60 Q100,30 200,55 T400,50 L400,100 Z" fill="currentColor" />
        </svg>
        {/* 작은 귤 도트 */}
        <span className="absolute right-8 top-24 h-3 w-3 rounded-full bg-mandarin shadow-sm" />
        <span className="absolute left-6 top-44 h-2 w-2 rounded-full bg-mandarin-dark/70" />
        <span className="absolute right-14 top-56 h-2.5 w-2.5 rounded-full bg-brand/40" />
      </div>

      <div className="text-center">
        <p className="text-[10px] tracking-[0.3em] text-slate-400">JEJU NATIONAL UNIV</p>
        <h1 className="mt-1 font-jua text-5xl leading-tight text-brand drop-shadow-sm">
          제대로<br />먹젠!?
        </h1>
        <span className="chip-mandarin mt-3 shadow-sm">
          <span>🍊</span> 제주대학교 주변 식당 추천
        </span>
      </div>

      <div className="my-6 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 m-auto h-44 w-44 rounded-full bg-mandarin/30 blur-2xl" />
          <img
            src="/img/제록이2.png"
            alt="귤 들고 있는 제록이"
            className="h-44 w-auto drop-shadow-lg"
          />
        </div>
        <div className="mt-2 flex items-baseline gap-1 font-jua">
          <span className="text-sm text-slate-500">안녕! 나는</span>
          <span className="text-base text-brand">제록이</span>
          <span className="text-sm text-slate-500">야 🦌</span>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <p className="text-center text-xs font-semibold tracking-wider text-slate-500">어떻게 정할까요?</p>
        {MODES.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 shadow-sm transition active:scale-[0.98] ${m.cls}`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20 text-2xl">
              {m.icon}
            </span>
            <span className="flex-1 text-left">
              <span className="block font-jua text-base leading-tight">{m.title}</span>
              <span className="block text-xs opacity-80">{m.desc}</span>
            </span>
            <span className="text-xl opacity-60">›</span>
          </Link>
        ))}
        <button
          onClick={() => setOpen(true)}
          className="block w-full pt-2 text-center text-xs text-slate-400 underline underline-offset-4"
        >
          사용 방법 보기
        </button>
      </div>

      {open && <ManualPopup onClose={() => setOpen(false)} />}
    </div>
  );
}
