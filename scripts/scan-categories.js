import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../src/data/restaurant.json');
const REPORT_PATH = path.resolve(__dirname, 'scan-categories.report.json');

const KEY = process.env.KAKAO_REST_KEY;
if (!KEY) {
  console.error('KAKAO_REST_KEY env var missing.');
  process.exit(1);
}

const SLEEP_MS = 150;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function lookupCategory(r) {
  if (!r.RES_URL) return { category_name: null, matched: false, reason: 'RES_URL is null' };

  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
    r.RES_NAME,
  )}&x=${r.RES_LNG}&y=${r.RES_LAT}&radius=300`;
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KEY}` } });
  if (!res.ok) {
    return { category_name: null, matched: false, reason: `HTTP ${res.status}` };
  }
  const data = await res.json();
  const exact = data.documents.find((d) => String(d.id) === String(r.RES_URL));
  if (exact) return { category_name: exact.category_name, matched: true, via: 'place_id' };

  const sameName = data.documents.find((d) => d.place_name === r.RES_NAME);
  if (sameName) return { category_name: sameName.category_name, matched: true, via: 'name', other_id: sameName.id };

  const closest = data.documents[0];
  if (closest) return { category_name: closest.category_name, matched: false, via: 'closest', other_id: closest.id, other_name: closest.place_name };

  return { category_name: null, matched: false, reason: 'no result' };
}

async function main() {
  const restaurants = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));

  const results = [];
  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    const r2 = await lookupCategory(r);
    results.push({
      RES_ID: r.RES_ID,
      RES_NAME: r.RES_NAME,
      RES_GB: r.RES_GB,
      RES_URL: r.RES_URL,
      kakao_category: r2.category_name,
      match_status: r2.matched ? `matched (${r2.via})` : `unmatched (${r2.reason || r2.via})`,
      other_id: r2.other_id,
      other_name: r2.other_name,
    });

    const tag = r2.matched ? '✓' : '?';
    console.log(
      `${tag} [${String(i + 1).padStart(2)}/${restaurants.length}] ${r.RES_NAME.padEnd(28)} ${(r.RES_GB || '').padEnd(12)} → ${r2.category_name || '(없음)'}`,
    );
    await sleep(SLEEP_MS);
  }

  await fs.writeFile(REPORT_PATH, JSON.stringify(results, null, 2));

  const matched = results.filter((r) => r.match_status.startsWith('matched'));
  const unmatched = results.filter((r) => !r.match_status.startsWith('matched'));
  console.log(`\nMatched: ${matched.length} / Unmatched: ${unmatched.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
