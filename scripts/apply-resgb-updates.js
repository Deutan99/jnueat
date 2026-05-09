import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../src/data/restaurant.json');
const BACKUP_DIR = path.resolve(__dirname, '../src/data/backup');

const UPDATES = [
  { RES_NAME: '개미와배짱이', RES_GB: '한식' },
  { RES_NAME: '상아탑식당', RES_GB: '한식' },
  { RES_NAME: '와랑와랑', RES_GB: '한식' },
  { RES_NAME: '흥부', RES_GB: '한식' },
  { RES_NAME: '오가네', RES_GB: '한식' },
  { RES_NAME: '쉐프스키스', RES_GB: '한식' },
  { RES_NAME: '통큰이층', RES_GB: '한식' },
  { RES_NAME: '학교종이땡땡땡', RES_GB: '한식' },
  { RES_NAME: '나는문어타코야끼 제주아라점', RES_GB: '돈까스-회-일식' },
];

async function main() {
  const restaurants = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `restaurant.${stamp}.json`);
  await fs.writeFile(backupPath, JSON.stringify(restaurants, null, 2));

  const byName = new Map(UPDATES.map((u) => [u.RES_NAME, u.RES_GB]));
  const applied = [];
  const missing = [];

  const next = restaurants.map((r) => {
    const newGb = byName.get(r.RES_NAME);
    if (!newGb) return r;
    if (newGb === r.RES_GB) return r;
    applied.push({ id: r.RES_ID, name: r.RES_NAME, from: r.RES_GB, to: newGb });
    return { ...r, RES_GB: newGb };
  });

  for (const u of UPDATES) {
    if (!restaurants.some((r) => r.RES_NAME === u.RES_NAME)) {
      missing.push(u.RES_NAME);
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(next, null, 2) + '\n');

  console.log(`Backup: ${backupPath}\n`);
  console.log(`=== Applied ${applied.length} updates ===`);
  for (const a of applied) {
    console.log(`  [${String(a.id).padStart(3)}] ${a.name.padEnd(28)} ${a.from} → ${a.to}`);
  }
  if (missing.length) {
    console.log(`\n⚠ Not found by name (${missing.length}):`);
    for (const m of missing) console.log(`  - ${m}`);
  }

  const dist = next.reduce((m, r) => ((m[r.RES_GB] = (m[r.RES_GB] || 0) + 1), m), {});
  console.log(`\n=== New RES_GB distribution ===`);
  for (const [k, v] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(15)} ${v}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
