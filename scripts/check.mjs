// What CI checks (npm run check): strict TypeScript, syntax of every browser and Node script, and that every ad in
// seed/ is under the 150 KB limit ad networks set. Fast and needs no Cloudflare account.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' });
run('npx', ['tsc', '-p', 'tsconfig.json']);
for (const dir of ['public', 'generator', 'scripts']) {
  for (const f of readdirSync(dir)) if (/\.(m?js)$/.test(f)) run(process.execPath, ['--check', join(dir, f)]);
}
const LIMIT = 150_000;
const m = JSON.parse(readFileSync('seed/manifest.json', 'utf8'));
const over = m.creatives.filter((c) => statSync(join('seed', c.file)).size > LIMIT);
if (over.length) {
  console.error('Over 150 KB:\n' + over.map((c) => '  ' + c.file).join('\n'));
  process.exit(1);
}
console.log(`OK: types, scripts, and ${m.creatives.length} ads under 150 KB.`);
