/* Validator — bad maps, ambiguity, missing clips. Run: node scripts/audit.mjs */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'site');
const recs = JSON.parse(readFileSync(join(site, 'data/phonemes.json'), 'utf8')).phonemes;

const report = { total: recs.length, missingAudio: [], emptyFiles: [], ambiguous: {}, unverified: 0, okAudio: 0 };
const byRegion = { matrika: {}, malini: {} };

for (const p of recs) {
  for (const cfg of ['matrika', 'malini']) {
    const r = p.placements[cfg].regionId;
    (byRegion[cfg][r] ||= []).push(p.iast);
    if (p.placements[cfg].status !== 'verified') report.unverified++;
  }
  const ref = p.audio.reference;
  if (!ref || p.audio.missing) { report.missingAudio.push(p.iast); continue; }
  const f = join(site, ref);
  if (!existsSync(f)) { report.missingAudio.push(p.iast + ' (gone)'); continue; }
  if (statSync(f).size === 0) { report.emptyFiles.push(p.iast); continue; }
  report.okAudio++;
}
for (const cfg of ['matrika', 'malini'])
  for (const [r, ids] of Object.entries(byRegion[cfg]))
    if (ids.length > 1) (report.ambiguous[r] ||= {})[cfg] = ids;

console.log(JSON.stringify(report, null, 1));
const fail = report.emptyFiles.length > 0;
process.exit(fail ? 1 : 0);
