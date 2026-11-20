// Usage: node scripts/optimize-images.mjs <inDir> <outDir>
// Converts .jpg/.jpeg/.png to kebab-case WebP under 500 KB. Skips everything else and says so.
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import sharp from 'sharp';

const LIMIT = 500 * 1024;
const INPUT = new Set(['.jpg', '.jpeg', '.png']);
// Tried in order until the output fits under LIMIT. Never upscales.
const ATTEMPTS = [
  { width: 1600, quality: 80 },
  { width: 1600, quality: 65 },
  { width: 1200, quality: 65 },
];

function kebab(file) {
  const base = file.slice(0, file.length - extname(file).length);
  return base
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function convert(src, dest) {
  let bytes = null;
  let used = null;
  for (const a of ATTEMPTS) {
    bytes = await sharp(src)
      .rotate()
      .resize({ width: a.width, withoutEnlargement: true })
      .webp({ quality: a.quality })
      .toBuffer();
    used = a;
    if (bytes.length <= LIMIT) break;
  }
  await writeFile(dest, bytes);
  return { size: bytes.length, used };
}

async function main() {
  const [inDir, outDir] = process.argv.slice(2);
  if (!inDir || !outDir) {
    console.error('Usage: node scripts/optimize-images.mjs <inDir> <outDir>');
    process.exit(1);
  }
  await mkdir(outDir, { recursive: true });
  const names = (await readdir(inDir)).sort();
  const skipped = [];
  for (const name of names) {
    const src = join(inDir, name);
    if ((await stat(src)).isDirectory()) continue;
    const ext = extname(name).toLowerCase();
    if (!INPUT.has(ext)) {
      skipped.push(`${name} (unsupported type ${ext || 'none'})`);
      continue;
    }
    const out = `${kebab(name)}.webp`;
    const { size, used } = await convert(src, join(outDir, out));
    const kb = (size / 1024).toFixed(0);
    const note = size > LIMIT ? ' STILL OVER 500 KB' : '';
    console.log(`${name} -> ${out} (${kb} KB, ${used.width}px, q${used.quality})${note}`);
  }
  if (skipped.length) {
    console.log(`Skipped ${skipped.length}:`);
    for (const s of skipped) console.log(`  - ${s}`);
  } else {
    console.log('Skipped 0.');
  }
}

await main();
