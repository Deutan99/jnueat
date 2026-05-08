const MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

let mapPromise = null;
let sharePromise = null;

export function loadKakaoMap() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.kakao?.maps) return Promise.resolve(window.kakao);
  if (!MAP_KEY) return Promise.reject(new Error('VITE_KAKAO_MAP_KEY missing'));
  if (mapPromise) return mapPromise;

  mapPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${MAP_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
    script.onerror = () => reject(new Error('Kakao Map SDK load failed'));
    document.head.appendChild(script);
  });
  return mapPromise;
}

export function loadKakaoShare() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (!MAP_KEY) return Promise.reject(new Error('VITE_KAKAO_MAP_KEY가 .env에 비어있어요'));
  if (window.Kakao?.Share && window.Kakao.isInitialized()) return Promise.resolve(window.Kakao);
  if (sharePromise) return sharePromise;

  sharePromise = new Promise((resolve, reject) => {
    const init = () => {
      try {
        if (!window.Kakao) {
          reject(new Error('Kakao SDK가 로드됐지만 window.Kakao가 없어요'));
          return;
        }
        if (!window.Kakao.isInitialized()) window.Kakao.init(MAP_KEY);
        if (!window.Kakao.Share) {
          reject(new Error('Kakao.Share 모듈이 없어요 (SDK 버전 확인)'));
          return;
        }
        resolve(window.Kakao);
      } catch (err) {
        reject(new Error(`Kakao.init 실패: ${err.message}`));
      }
    };
    if (window.Kakao?.Share) return init();
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = init;
    script.onerror = () =>
      reject(new Error('Kakao SDK 스크립트 로드 실패 (네트워크/CDN 차단?)'));
    document.head.appendChild(script);
  });
  return sharePromise;
}

export const kakaoKeysPresent = {
  map: Boolean(MAP_KEY),
  share: Boolean(MAP_KEY),
};
