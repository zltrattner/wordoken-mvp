import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const code = await readFile('dist/index.js', 'utf8');
const types = await readFile('dist/types/index.d.ts', 'utf8');
for (const forbidden of [
  'Guest445',
  'RobbieRobertson',
  'localStorage',
  'sessionStorage',
  'serviceWorker',
  'setInterval(',
  'fetch(',
  'PreviewApp',
]) {
  assert.ok(!code.includes(forbidden), `Public library unexpectedly includes ${forbidden}`);
}
assert.ok(!types.includes('preview'));
assert.ok(!types.includes('styles.css'), 'Public declarations must not import implementation CSS');
const assets = [...code.matchAll(/new URL\("\.\/([^"]+)"/g)].map((match) => match[1]);
assert.ok(assets.length >= 24, 'Expected package-relative artwork references');
for (const asset of assets) assert.ok((await stat(`dist/${asset}`)).size > 0, `Missing ${asset}`);
console.log(`PASS: public package isolation and ${assets.length} local artwork files.`);
