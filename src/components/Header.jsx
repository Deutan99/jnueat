import { Link } from 'react-router-dom';

export default function Header({ children, onBack }) {
  return (
    <header className="flex items-center gap-2 px-4 pt-5 pb-3">
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="뒤로가기"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-2xl text-slate-500 transition hover:bg-white hover:text-brand"
        >
          ←
        </button>
      ) : (
        <span className="h-9 w-9 shrink-0" aria-hidden />
      )}
      <h1 className="flex-1 text-center font-jua text-2xl text-brand">{children}</h1>
      <Link
        to="/"
        aria-label="처음으로"
        title="처음으로"
        className="flex h-9 shrink-0 flex-col items-end justify-center pr-1 leading-none rounded-lg px-1 transition hover:bg-white/70 active:scale-95"
      >
        <span className="font-jua text-[15px] text-mandarin-dark tracking-wide">JNU</span>
        <span className="font-jua text-[10px] text-slate-400 tracking-[0.25em]">EAT</span>
      </Link>
    </header>
  );
}
