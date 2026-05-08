const WALK_KM_PER_MIN = 1 / 15;

const toRad = (deg) => (deg * Math.PI) / 180;

export function walkingMinutes(lat1, lng1, lat2, lng2) {
  const a = toRad(lat1);
  const b = toRad(lat2);
  const c = toRad(lng1);
  const d = toRad(lng2);
  const R = 6371;
  const km =
    Math.acos(
      Math.sin(a) * Math.sin(b) +
        Math.cos(a) * Math.cos(b) * Math.cos(c - d),
    ) * R;
  return Math.round(km / WALK_KM_PER_MIN);
}
