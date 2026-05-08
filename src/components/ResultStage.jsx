import { Link } from 'react-router-dom';
import { Contents, Footer } from './Layout';

export default function ResultStage({ resName, resUrl, category, walkingMin, address }) {
  const placeUrl = `https://place.map.kakao.com/${resUrl}`;
  const validUrl = resUrl && resUrl !== 'null';

  return (
    <>
      <Contents>
        <div className="relative grid h-full place-items-center px-6 text-center overflow-hidden">
          {/* 배경 그라데이션 + confetti */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-mandarin-soft/40" />
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-mandarin/25 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
            <span className="absolute left-6 top-8 h-2 w-2 rounded-full bg-mandarin" />
            <span className="absolute right-8 top-12 h-3 w-3 rounded-full bg-brand" />
            <span className="absolute left-10 bottom-16 h-2 w-2 rounded-full bg-mandarin-dark" />
            <span className="absolute right-12 bottom-20 h-2 w-2 rounded-full bg-brand-dark" />
            <span className="absolute right-1/3 top-6 h-1.5 w-1.5 rounded-full bg-mandarin" />
            <span className="absolute left-1/3 bottom-6 h-1.5 w-1.5 rounded-full bg-brand/60" />
          </div>

          <div className="space-y-4">
            <span className="chip-brand">🦌 제록이의 PICK</span>

            <div className="relative inline-block">
              <div className="absolute inset-0 -z-10 m-auto h-32 w-32 rounded-full bg-gradient-to-br from-mandarin/35 to-brand/25 blur-2xl" />
              <img
                src="/img/제록이3.png"
                alt="신난 제록이"
                className="mx-auto h-32 w-auto drop-shadow-md"
              />
            </div>

            <div>
              <p className="text-[10px] tracking-[0.3em] text-slate-400">TODAY'S CHOICE</p>
              <h2 className="mt-1 font-jua text-4xl leading-tight text-brand drop-shadow-sm">{resName}</h2>
            </div>

            {(category || walkingMin != null) && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {category && <span className="chip-mandarin">{category}</span>}
                {walkingMin != null && <span className="chip-brand">도보 {walkingMin}분</span>}
              </div>
            )}

            {address && (
              <p className="px-2 text-xs leading-relaxed text-slate-500">📍 {address}</p>
            )}
          </div>
        </div>
      </Contents>
      <Footer>
        {validUrl ? (
          <a
            href={placeUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary block w-full text-center text-base"
          >
            카카오맵에서 보기
          </a>
        ) : (
          <button disabled className="btn-secondary block w-full text-base opacity-60 cursor-not-allowed">
            카카오맵 링크 없음
          </button>
        )}
        <Link
          to="/"
          className="mt-2 block text-center text-sm text-slate-500 underline underline-offset-4"
        >
          처음으로 돌아가기
        </Link>
      </Footer>
    </>
  );
}
