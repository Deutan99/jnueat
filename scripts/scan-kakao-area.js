import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../src/data/restaurant.json');
const REPORT_PATH = path.resolve(__dirname, 'scan-kakao-area.report.json');

const KEY = process.env.KAKAO_REST_KEY;
if (!KEY) {
  console.error('KAKAO_REST_KEY env var missing. Run with: node --env-file=.env scripts/scan-kakao-area.js');
  process.exit(1);
}

const PAD_M = 100;
const GRID = 3;
const SLEEP_MS = 150;
const LAT_PER_M = 1 / 111000;
const LNG_PER_M_33 = 1 / 93000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchCategory({ x1, y1, x2, y2, page }) {
  const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&rect=${x1},${y1},${x2},${y2}&page=${page}&size=15`;
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KEY}` } });
  if (!res.ok) throw new Error(`Kakao API HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function scanCell(x1, y1, x2, y2) {
  const all = [];
  let truncated = false;
  for (let p = 1; p <= 3; p++) {
    const data = await searchCategory({ x1, y1, x2, y2, page: p });
    all.push(...data.documents);
    if (data.meta.is_end) break;
    if (p === 3 && !data.meta.is_end) truncated = true;
    await sleep(SLEEP_MS);
  }
  return { documents: all, truncated };
}

async function main() {
  const restaurants = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));

  const lats = restaurants.map((r) => r.RES_LAT);
  const lngs = restaurants.map((r) => r.RES_LNG);
  const minLat = Math.min(...lats) - PAD_M * LAT_PER_M;
  const maxLat = Math.max(...lats) + PAD_M * LAT_PER_M;
  const minLng = Math.min(...lngs) - PAD_M * LNG_PER_M_33;
  const maxLng = Math.max(...lngs) + PAD_M * LNG_PER_M_33;

  console.log(
    `BBox lat[${minLat.toFixed(6)} ~ ${maxLat.toFixed(6)}] lng[${minLng.toFixed(6)} ~ ${maxLng.toFixed(6)}]  (~${Math.round(
      (maxLat - minLat) / LAT_PER_M,
    )}m x ${Math.round((maxLng - minLng) / LNG_PER_M_33)}m)`,
  );

  const found = new Map();
  const truncatedCells = [];

  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      const x1 = minLng + ((maxLng - minLng) * j) / GRID;
      const x2 = minLng + ((maxLng - minLng) * (j + 1)) / GRID;
      const y1 = minLat + ((maxLat - minLat) * i) / GRID;
      const y2 = minLat + ((maxLat - minLat) * (i + 1)) / GRID;

      const { documents, truncated } = await scanCell(x1, y1, x2, y2);
      for (const d of documents) found.set(d.id, d);
      console.log(
        `Cell [${i},${j}] : ${String(documents.length).padStart(2)} places${truncated ? '  ⚠ TRUNCATED (>45)' : ''}`,
      );
      if (truncated) truncatedCells.push({ i, j, x1, y1, x2, y2 });
      await sleep(SLEEP_MS);
    }
  }

  console.log(`\nUnique places scanned: ${found.size}`);

  const existingByPid = new Map(restaurants.map((r) => [String(r.RES_URL), r]));
  const foundIds = new Set([...found.keys()].map(String));

  const additions = [...found.values()]
    .filter((p) => !existingByPid.has(String(p.id)))
    .map((p) => ({
      place_id: p.id,
      name: p.place_name,
      addr: p.road_address_name || p.address_name,
      category: p.category_name,
      lat: parseFloat(p.y),
      lng: parseFloat(p.x),
      url: p.place_url,
    }));

  const deletions = restaurants
    .filter((r) => !foundIds.has(String(r.RES_URL)))
    .map((r) => ({
      RES_ID: r.RES_ID,
      RES_NAME: r.RES_NAME,
      RES_GB: r.RES_GB,
      place_id: r.RES_URL,
      url: `https://place.map.kakao.com/${r.RES_URL}`,
    }));

  const changes = [];
  for (const r of restaurants) {
    const p = found.get(String(r.RES_URL));
    if (!p) continue;
    const diffs = [];
    if (p.place_name !== r.RES_NAME) diffs.push({ field: 'name', old: r.RES_NAME, new: p.place_name });
    const newAddr = p.road_address_name || p.address_name;
    if (newAddr && newAddr !== r.RES_ADDR) diffs.push({ field: 'addr', old: r.RES_ADDR, new: newAddr });
    const dLat = Math.abs(parseFloat(p.y) - r.RES_LAT);
    const dLng = Math.abs(parseFloat(p.x) - r.RES_LNG);
    if (dLat > 0.0001 || dLng > 0.0001) {
      diffs.push({
        field: 'coord',
        old: [r.RES_LAT, r.RES_LNG],
        new: [parseFloat(p.y), parseFloat(p.x)],
      });
    }
    if (diffs.length) changes.push({ RES_ID: r.RES_ID, RES_NAME: r.RES_NAME, place_id: p.id, diffs });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    bbox: { minLat, maxLat, minLng, maxLng },
    grid: GRID,
    paddingMeters: PAD_M,
    totalScanned: found.size,
    totalExisting: restaurants.length,
    truncatedCells,
    additions,
    deletions,
    changes,
  };

  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n=== Summary ===`);
  console.log(`  Existing in JSON      : ${restaurants.length}`);
  console.log(`  Scanned from Kakao    : ${found.size}`);
  console.log(`  Additions (new)       : ${additions.length}`);
  console.log(`  Deletions (not found) : ${deletions.length}`);
  console.log(`  Changes (name/addr)   : ${changes.length}`);
  if (truncatedCells.length) {
    console.log(`  ⚠ Truncated cells     : ${truncatedCells.length}  (그리드 더 잘게 나눠야 할 수 있음)`);
  }
  console.log(`\nReport: ${REPORT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
