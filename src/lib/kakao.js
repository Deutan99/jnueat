const MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

let mapPromise = null;

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

export const kakaoKeysPresent = {
  map: Boolean(MAP_KEY),
};
