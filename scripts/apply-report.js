import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../src/data/restaurant.json');
const REPORT_PATH = path.resolve(__dirname, 'scan-kakao-area.report.json');
const BACKUP_DIR = path.resolve(__dirname, '../src/data/backup');

const args = new Set(process.argv.slice(2));
const doChanges = args.has('--changes');
const doDeletions = args.has('--deletions');

if (!doChanges && !doDeletions) {
  console.error('Usage: node --env-file=.env scripts/apply-report.js [--changes] [--deletions]');
  process.exit(1);
}

async function main() {
  const restaurants = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));
  const report = JSON.parse(await fs.readFile(REPORT_PATH, 'utf-8'));

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `restaurant.${stamp}.json`);
  await fs.writeFile(backupPath, JSON.stringify(restaurants, null, 2));

  let modified = restaurants;
  const stats = { changesApplied: 0, deletionsApplied: 0, deletionsSkipped: [] };

  if (doChanges) {
    const byPid = new Map(report.changes.map((c) => [String(c.place_id), c]));
    modified = modified.map((r) => {
      const c = byPid.get(String(r.RES_URL));
      if (!c) return r;
      const next = { ...r };
      for (const d of c.diffs) {
        if (d.field === 'name') next.RES_NAME = d.new;
        else if (d.field === 'addr') next.RES_ADDR = d.new;
        else if (d.field === 'coord') {
          next.RES_LAT = d.new[0];
          next.RES_LNG = d.new[1];
        }
      }
      stats.changesApplied++;
      return next;
    });
  }

  if (doDeletions) {
    const toDelete = new Set();
    for (const d of report.deletions) {
      if (d.RES_GB === '학식') {
        stats.deletionsSkipped.push({ ...d, reason: 'cafeteria (학식) — Kakao FD6 false negative' });
        continue;
      }
      if (d.place_id === null || d.place_id === 'null') {
        stats.deletionsSkipped.push({ ...d, reason: 'null place_id — needs manual fix, not deletion' });
        continue;
      }
      toDelete.add(String(d.place_id));
    }
    const before = modified.length;
    modified = modified.filter((r) => !toDelete.has(String(r.RES_URL)));
    stats.deletionsApplied = before - modified.length;
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(modified, null, 2) + '\n');

  console.log(`Backup written: ${backupPath}`);
  console.log(`\n=== Applied ===`);
  if (doChanges) console.log(`  Changes  : ${stats.changesApplied}`);
  if (doDeletions) {
    console.log(`  Deletions: ${stats.deletionsApplied}`);
    if (stats.deletionsSkipped.length) {
      console.log(`  Skipped  : ${stats.deletionsSkipped.length}`);
      for (const s of stats.deletionsSkipped) {
        console.log(`    - [${s.RES_ID}] ${s.RES_NAME} (${s.reason})`);
      }
    }
  }
  console.log(`\nrestaurant.json now has ${modified.length} entries.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
