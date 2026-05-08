import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Contents, Footer } from './Layout';
import { loadKakaoShare } from '../lib/kakao';

const SITE_URL = 'https://jnueat.vercel.app';
const SHARE_IMAGE = `${SITE_URL}/img/deer-mandarin.png`;

export default function ResultStage({ resName, resUrl, category, walkingMin, address }) {
  const placeUrl = `https://place.map.kakao.com/${resUrl}`;
  const validUrl = resUrl && resUrl !== 'null';
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    try {
      const Kakao = await loadKakaoShare();
      const descParts = [];
      if (category) descParts.push(category);
      if (walkingMin != null) descParts.push(`도보 ${walkingMin}분`);
      if (address) descParts.push(address);

      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `오늘의 픽: ${resName} 🎉`,
          description: descParts.join(' · ') || '제주대 근처 맛집 추천',
          imageUrl: SHARE_IMAGE,
          link: { mobileWebUrl: SITE_URL, webUrl: SITE_URL },
        },
        buttons: [
          ...(validUrl
            ? [{
                title: '식당 보러가기',
                link: { mobileWebUrl: placeUrl, webUrl: placeUrl },
              }]
            : []),
          {
            title: '나도 골라보기',
            link: { mobileWebUrl: SITE_URL, webUrl: SITE_URL },
          },
        ],
      });
    } catch (e) {
      console.error('[Kakao Share]', e);
      alert(`카카오 공유 실패: ${e?.message || e}`);
    } finally {
      setSharing(false);
    }
  }

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
                {/* 색 번짐 방지용 흰색 헤일로 (가까이) */}
                <div className="absolute inset-0 -z-10 m-auto h-24 w-24 rounded-full bg-white/70 blur-xl" />
                {/* 만다린 글로우 (멀리) */}
                <div className="absolute inset-0 -z-20 m-auto h-32 w-32 rounded-full bg-gradient-to-br from-mandarin/25 to-brand/10 blur-2xl" />
                <img
                  src="/img/deer-happy.png"
                  alt="신난 제록이"
                  className="h-28 w-auto"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))',
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
        <div className="grid grid-cols-2 gap-2">
          {validUrl ? (
            <a
              href={placeUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-sm"
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="mr-1 h-4 w-4"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1.5a6.5 6.5 0 0 0-6.5 6.5c0 4.5 6.5 10.5 6.5 10.5s6.5-6 6.5-10.5A6.5 6.5 0 0 0 10 1.5zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                  clipRule="evenodd"
                />
              </svg>
              카카오맵에서 보기
            </a>
          ) : (
            <button disabled className="btn-secondary text-sm opacity-60 cursor-not-allowed">
              지도 링크 없음
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
            className="btn text-sm shadow-sm ring-1 ring-black/5 hover:brightness-95 disabled:opacity-60"
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="mr-1 h-4 w-4"
              fill="currentColor"
            >
              <path d="M10 2.5C5.58 2.5 2 5.27 2 8.69c0 2.21 1.5 4.14 3.76 5.24-.13.43-.49 1.6-.56 1.85-.08.31.11.31.24.23.1-.07 1.61-1.09 2.27-1.54.74.11 1.5.16 2.29.16 4.42 0 8-2.77 8-6.18S14.42 2.5 10 2.5z" />
            </svg>
            {sharing ? '여는 중…' : '카카오톡 공유'}
          </button>
        </div>

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
