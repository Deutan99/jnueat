import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../src/data/restaurant.json');
const REPORT_PATH = path.resolve(__dirname, 'scan-kakao-area.report.json');
const BACKUP_DIR = path.resolve(__dirname, '../src/data/backup');

const ADDITIONS = [
  { place_id: '1072475225', RES_GB: '백반-죽-국수' },
  { place_id: '147887228',  RES_GB: '백반-죽-국수' },
  { place_id: '589459381',  RES_GB: '분식' },
  { place_id: '829295720',  RES_GB: '치킨' },
  { place_id: '22676658',   RES_GB: '백반-죽-국수' },
  { place_id: '172384002',  RES_GB: '돈까스-회-일식' },
  { place_id: '1320669161', RES_GB: '분식' },
  { place_id: '1308571099', RES_GB: '패스트푸드' },
  { place_id: '696008547',  RES_GB: '고기-구이' },
  { place_id: '61370692',   RES_GB: '찜-탕-찌개' },
  { place_id: '2074908793', RES_GB: '백반-죽-국수' },
  { place_id: '28876574',   RES_GB: '분식' },
  { place_id: '389761540',  RES_GB: '백반-죽-국수' },
  { place_id: '1919473053', RES_GB: '분식' },
];

async function main() {
  const restaurants = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));
  const report = JSON.parse(await fs.readFile(REPORT_PATH, 'utf-8'));

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `restaurant.${stamp}.json`);
  await fs.writeFile(backupPath, JSON.stringify(restaurants, null, 2));

  const reportByPid = new Map(report.additions.map((a) => [String(a.place_id), a]));
  const existingPids = new Set(restaurants.map((r) => String(r.RES_URL)));
  const maxId = restaurants.reduce((m, r) => Math.max(m, r.RES_ID || 0), 0);

  const added = [];
  let nextId = maxId + 1;

  for (const m of ADDITIONS) {
    if (existingPids.has(String(m.place_id))) {
      console.log(`SKIP (already in JSON): ${m.place_id}`);
      continue;
    }
    const a = reportByPid.get(String(m.place_id));
    if (!a) {
      console.log(`SKIP (not in report): ${m.place_id}`);
      continue;
    }
    added.push({
      RES_ID: nextId++,
      RES_NAME: a.name,
      RES_ADDR: a.addr,
      RES_LAT: a.lat,
      RES_LNG: a.lng,
      RES_GB: m.RES_GB,
      RES_URL: String(a.place_id),
    });
  }

  const next = [...restaurants, ...added];
  await fs.writeFile(DATA_PATH, JSON.stringify(next, null, 2) + '\n');

  console.log(`Backup written: ${backupPath}`);
  console.log(`\n=== Added ${added.length} entries ===`);
  for (const r of added) {
    console.log(`  [${r.RES_ID}] ${r.RES_NAME.padEnd(28)} ${r.RES_GB}`);
  }
  console.log(`\nrestaurant.json now has ${next.length} entries.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
