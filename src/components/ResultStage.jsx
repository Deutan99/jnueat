import { Link } from 'react-router-dom';
import { Contents, Footer } from './Layout';

export default function ResultStage({ resName, resUrl, category, walkingMin, address }) {
  const placeUrl = `https://place.map.kakao.com/${resUrl}`;
  const validUrl = resUrl && resUrl !== 'null';

  return (
    <>
      <Contents>
        <div className="relative grid h-full place-items-center px-4 text-center overflow-hidden">
          {/* 배경 */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-mandarin-soft/30" />
            <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-mandarin/25 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-brand/15 blur-3xl" />
            {/* 컨페티 */}
            <span className="absolute left-6 top-6 h-1.5 w-1.5 rounded-full bg-mandarin" />
            <span className="absolute right-8 top-10 h-2 w-2 rounded-full bg-brand" />
            <span className="absolute left-12 bottom-20 h-2 w-2 rounded-full bg-mandarin-dark" />
            <span className="absolute right-1/4 top-3 h-1.5 w-1.5 rounded-full bg-brand/60" />
          </div>

          <div className="w-full max-w-xs space-y-3">
            {/* 제록이 + 말풍선 */}
            <div className="flex items-end justify-center gap-1">
              <div className="relative animate-bob">
                <div className="absolute inset-0 -z-10 m-auto h-28 w-28 rounded-full bg-gradient-to-br from-mandarin/40 to-brand/20 blur-2xl" />
                <img
                  src="/img/deer-happy.png"
                  alt="신난 제록이"
                  className="h-28 w-auto"
                  style={{
                    filter:
                      'drop-shadow(0 4px 10px rgba(255, 138, 61, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                  }}
                />
              </div>
              <div className="relative mb-3 -ml-2">
                <div className="rounded-2xl bg-white px-3 py-1.5 shadow-md ring-1 ring-slate-100">
                  <p className="font-jua text-xs text-brand">오늘은 이거! 🎉</p>
                </div>
                <div className="absolute -left-1 bottom-2 h-2.5 w-2.5 rotate-45 bg-white ring-1 ring-slate-100" />
              </div>
            </div>

            {/* 식당 카드 */}
            <div className="rounded-2xl bg-white px-4 py-4 shadow-md ring-1 ring-slate-100">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-mandarin-dark">
                TODAY'S PICK
              </p>
              <h2 className="mt-1 font-jua text-3xl leading-tight text-brand">
                {resName}
              </h2>

              {(category || walkingMin != null) && (
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {category && <span className="chip-mandarin">{category}</span>}
                  {walkingMin != null && (
                    <span className="chip-brand">🚶 도보 {walkingMin}분</span>
                  )}
                </div>
              )}

              {address && (
                <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-left">
                  <span className="text-sm">📍</span>
                  <p className="text-[11px] leading-relaxed text-slate-600">{address}</p>
                </div>
              )}
            </div>
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
            카카오맵에서 보기 →
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
