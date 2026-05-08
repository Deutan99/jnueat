import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../src/data/restaurant.json');
const REPORT_PATH = path.resolve(__dirname, 'verify-restaurants.report.json');

const SLEEP_MS = 700;
const TIMEOUT_MS = 10000;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const CLOSED_KEYWORDS = ['폐업', '폐점', '영업종료', '운영종료', '휴업'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkOne(r) {
  const url = `https://place.map.kakao.com/${r.RES_URL}`;
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9' },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    clearTimeout(tid);

    if (res.status === 404) {
      return { id: r.RES_ID, name: r.RES_NAME, url, status: 'NOT_FOUND' };
    }
    if (!res.ok) {
      return { id: r.RES_ID, name: r.RES_NAME, url, status: 'HTTP_ERROR', http: res.status };
    }

    const html = await res.text();

    const closedKeyword = CLOSED_KEYWORDS.find((k) => html.includes(k));
    if (closedKeyword) {
      return { id: r.RES_ID, name: r.RES_NAME, url, status: 'POSSIBLY_CLOSED', keyword: closedKeyword };
    }

    if (!html.includes(r.RES_NAME)) {
      return { id: r.RES_ID, name: r.RES_NAME, url, status: 'NAME_MISSING_IN_PAGE' };
    }

    return { id: r.RES_ID, name: r.RES_NAME, url, status: 'OK' };
  } catch (e) {
    clearTimeout(tid);
    return { id: r.RES_ID, name: r.RES_NAME, url, status: 'FETCH_ERROR', error: String(e?.message ?? e) };
  }
}

async function main() {
  const restaurants = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));
  const eta = Math.ceil((restaurants.length * SLEEP_MS) / 1000);
  console.log(`Checking ${restaurants.length} restaurants (≈${eta}s).\n`);

  const results = [];
  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    const result = await checkOne(r);
    results.push(result);
    const tag =
      result.status === 'OK'
        ? '✓'
        : result.status === 'POSSIBLY_CLOSED' || result.status === 'NOT_FOUND'
          ? '✗'
          : '?';
    const tail = result.keyword ? ` (${result.keyword})` : result.error ? ` (${result.error})` : '';
    console.log(
      `${tag} [${String(i + 1).padStart(2)}/${restaurants.length}] ${r.RES_NAME.padEnd(22)} ${result.status}${tail}`,
    );
    if (i < restaurants.length - 1) await sleep(SLEEP_MS);
  }

  await fs.writeFile(REPORT_PATH, JSON.stringify(results, null, 2));

  const summary = results.reduce((acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc), {});

  console.log('\n=== Summary ===');
  for (const [k, v] of Object.entries(summary).sort()) console.log(`  ${k.padEnd(25)} ${v}`);

  const suspect = results.filter((r) => r.status !== 'OK');
  if (suspect.length) {
    console.log('\n=== Needs Review ===');
    for (const r of suspect) {
      console.log(`  [${String(r.id).padStart(3)}] ${r.name}`);
      console.log(`        ${r.url}`);
      console.log(
        `        → ${r.status}${r.keyword ? ` (keyword: ${r.keyword})` : ''}${r.error ? ` (error: ${r.error})` : ''}`,
      );
    }
  }

  console.log(`\nFull report: ${REPORT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
