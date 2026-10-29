// Foto's worden gedownload, verkleind naar WebP en vanaf het eigen domein geserveerd
// (beter voor laadsnelheid en SEO; geen hotlinking naar de bron).
import { mkdir, stat, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const UA = 'KoopsWoningenSync/1.0 (+https://woningen.verhuurmetkoops.nl)';
const SIZES = [640, 1280];

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function download(url, dest) {
  if (await exists(dest)) return true;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, buf);
      return true;
    } catch (e) {
      if (attempt === 2) { console.warn(`  foto mislukt: ${url} (${e.message})`); return false; }
    }
  }
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

/**
 * Zorgt dat de foto's van een woning klaarstaan in outDir/img/<id>/ en geeft per foto de paden terug.
 * mode 'remote' (lokaal testen zonder internet) verwijst direct naar de bron.
 */
export async function prepareImages(listing, { mode, imageBase, cacheDir, outDir, max }) {
  const files = listing.images.slice(0, max);
  if (mode === 'remote') {
    return files.map((f) => ({ small: imageBase + f, large: imageBase + f, width: 1024, height: 683 }));
  }
  const base = `${listing.slug}-${listing.citySlug}`;
  const res = await pool(files, 4, async (file, idx) => {
    const orig = path.join(cacheDir, file);
    if (!(await download(imageBase + file, orig))) return null;
    const result = {};
    try {
      const meta = await sharp(orig).metadata();
      for (const w of SIZES) {
        const name = `${base}-${idx + 1}-${w}.webp`;
        const target = path.join(cacheDir, 'webp', listing.id, name);
        if (!(await exists(target))) {
          await mkdir(path.dirname(target), { recursive: true });
          await sharp(orig).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: w === 640 ? 68 : 74 }).toFile(target);
        }
        const dest = path.join(outDir, 'img', listing.id, name);
        await mkdir(path.dirname(dest), { recursive: true });
        await writeFile(dest, await readFile(target));
        result[w === 640 ? 'small' : 'large'] = `/img/${listing.id}/${name}`;
      }
      const ratio = meta.height && meta.width ? meta.height / meta.width : 2 / 3;
      result.width = Math.min(1280, meta.width || 1280);
      result.height = Math.round(result.width * ratio);
      return result;
    } catch (e) {
      console.warn(`  foto verwerken mislukt: ${file} (${e.message})`);
      return null;
    }
  });
  return res.filter(Boolean);
}
