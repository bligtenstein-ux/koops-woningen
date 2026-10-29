// Gebruik: SITE=huur|koop node src/run.mjs
// Optioneel: FIXTURE=fixtures/source-sample.json (geen internet nodig), IMAGE_MODE=remote, OUT=dist/huur
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { loadSource, normalize } from './source.mjs';
import { readArchive, writeArchive, merge } from './archive.mjs';
import { prepareImages } from './images.mjs';
import * as R from './render.mjs';
import { CSS, FAVICON, SITE_JS, widgetJs } from './assets.mjs';

const SITE = process.env.SITE || 'huur';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(root, 'data'));
const OUT = path.resolve(process.env.OUT || path.join(root, 'dist', SITE));
const CACHE = path.resolve(process.env.CACHE || path.join(root, '.cache', 'img'));
const IMAGE_MODE = process.env.IMAGE_MODE || 'local';
const today = process.env.TODAY || new Date().toISOString().slice(0, 10);

const cfg = JSON.parse(await readFile(path.join(root, 'config', 'sites.json'), 'utf8'));
const site = cfg.sites[SITE];
if (!site) throw new Error(`Onbekende SITE: ${SITE}`);

console.log(`▶ ${site.domain}: bron ophalen…`);
const raw = await loadSource({ url: cfg.source.url, fixture: process.env.FIXTURE });
const normalized = raw.map((i) => normalize(i, cfg.source.region, { allOffices: true })).filter(Boolean);
const ownAll = normalized.filter((l) => l.own);
if (!ownAll.length) throw new Error('Bron bevat 0 woningen van de vestiging Haarlem: synchronisatie afgebroken.');
// Eigen aanbod (actief + afgerond). Bij includeOtherOffices ook het actieve aanbod van de andere vestigingen,
// plus hun recent verkochte/verhuurde woningen in het hogere segment (vertrouwen: "dit verkoopt Koops").
const prem = site.premiumClosed || null;
const sinceDate = prem ? new Date(Date.now() - prem.months * 30.5 * 864e5).toISOString().slice(0, 10) : '9999';
const premiumOk = (l) => Boolean(prem && l.price >= prem.minPrice && (l.closedOn || l.updated || '') >= sinceDate);
const incoming = normalized.filter((l) => l.kind === site.kind && (l.own || (site.includeOtherOffices && (l.active || premiumOk(l)))));
console.log(`  bron: ${raw.length} objecten, Haarlem: ${ownAll.length}, ${site.kind === 'rent' ? 'huur' : 'koop'}: ${incoming.length} (waarvan andere vestigingen: ${incoming.filter((l) => !l.own).length})`);

const archiveFile = path.join(DATA_DIR, `${SITE}.json`);
const archive = await readArchive(archiveFile);
const { prevActive, nowActive } = merge(archive, incoming, today);
if (prevActive >= 4 && nowActive === 0 && !process.env.FORCE) {
  throw new Error(`Eerder ${prevActive} actieve woningen, nu 0. Dat lijkt op een fout in de bron; niets gepubliceerd. (FORCE=1 om toch door te gaan)`);
}
archive.updated = today;

const all = Object.values(archive.listings);
const isOwn = (l) => l.own !== false;
const byOnline = (a, b) => (b.online || '').localeCompare(a.online || '') || Number(b.id) - Number(a.id);
// Eigen aanbod altijd bovenaan, daarna de andere vestigingen; binnen elke groep de nieuwste eerst.
const active = all.filter((l) => l.active).sort((a, b) => isOwn(b) - isOwn(a) || byOnline(a, b));
const closed = all.filter((l) => !l.active && !l.withdrawn && (isOwn(l) || premiumOk(l))).sort((a, b) => (b.closedOn || '').localeCompare(a.closedOn || '') || byOnline(a, b));
const withdrawn = all.filter((l) => l.withdrawn);
console.log(`  actief: ${active.length}, archief: ${closed.length}, ingetrokken: ${withdrawn.length}`);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// Foto's
const imgs = new Map();
for (const l of [...active, ...closed, ...withdrawn]) {
  imgs.set(l.id, await prepareImages(l, { mode: IMAGE_MODE, imageBase: cfg.source.imageBase, cacheDir: CACHE, outDir: OUT, max: l.active ? 30 : 1 }));
}

// Engelse pagina's voor al het actieve aanbod. Tekst: eigen Engelse omschrijving, anders onze vertaling
// (config/translations.json), anders de Nederlandse tekst met een melding.
const enIds = new Set(active.map((l) => l.id));
let translations = {};
try { translations = JSON.parse(await readFile(path.join(root, 'config', 'translations.json'), 'utf8')); } catch {}

// Gemiddelde doorlooptijd (alleen verhuur): zelf gemeten van online tot "onder voorbehoud"/"verhuurd",
// alleen eigen woningen van de afgelopen 12 maanden, pas tonen vanaf 8 metingen.
const yearAgo = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
const durations = all.filter((l) => isOwn(l) && l.dealOn && l.online && l.dealOn >= yearAgo)
  .map((l) => (new Date(l.dealOn) - new Date(l.online)) / 864e5).filter((d) => d >= 0);
const avgDays = site.kind === 'rent' && durations.length >= 8 ? Math.max(1, Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)) : null;
console.log(`  doorlooptijd: ${durations.length} metingen${avgDays ? `, gemiddeld ${avgDays} dagen` : ' (nog niet getoond)'}`);

// Plaatsen voor het inschrijfformulier: waar we het meeste aanbod hebben.
const cityN = new Map();
for (const l of [...active, ...closed]) cityN.set(l.city, (cityN.get(l.city) || 0) + (isOwn(l) ? 2 : 1));
const alertCities = [...cityN].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([c]) => c).sort((a, b) => a.localeCompare(b, 'nl'));

// Plaatspagina's: alleen waar genoeg te tonen is.
const placeMap = new Map();
for (const l of [...active.filter(isOwn), ...closed.filter(isOwn)]) {
  if (!placeMap.has(l.citySlug)) placeMap.set(l.citySlug, { city: l.city, slug: l.citySlug, active: [], closed: [] });
  placeMap.get(l.citySlug)[l.active ? 'active' : 'closed'].push(l);
}
const places = [...placeMap.values()].filter((p) => p.active.length + p.closed.length >= 3).sort((a, b) => b.active.length + b.closed.length - (a.active.length + a.closed.length));

const ctx = {
  site, office: cfg.office, otherOffices: cfg.otherOffices || {}, today, imgs, enIds, translations, avgDays, alertCities,
  formEndpoint: process.env.FORM_ENDPOINT ?? cfg.forms?.endpoint ?? '',
  jsVersion: crypto.createHash('md5').update(SITE_JS).digest('hex').slice(0, 8),
  base: `https://${site.domain}`,
  sourceBase: cfg.source.detailBase,
  placeSlugs: new Set(places.map((p) => p.slug)),
  cssVersion: crypto.createHash('md5').update(CSS).digest('hex').slice(0, 8),
};

async function put(rel, content) {
  const file = path.join(OUT, rel.endsWith('/') ? rel + 'index.html' : rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

const related = (l) => active.filter((x) => x.id !== l.id).sort((a, b) => isOwn(b) - isOwn(a) || (b.citySlug === l.citySlug) - (a.citySlug === l.citySlug)).slice(0, 3);

await put('/', R.indexPage(ctx, { active, closed, places }));
await put('/en/', R.indexPageEn(ctx, { active, closed }));
await put(R.paths.archive(site.kind), R.archivePage(ctx, closed));
await put(R.paths.all(), R.allPage(ctx, { active, closed }));
for (const p of places) await put(R.paths.place(p.slug), R.placePage(ctx, p));
for (const l of [...active, ...closed, ...withdrawn]) {
  await put(R.paths.detail(l), R.detailPage(ctx, l, { related: related(l) }));
  if (enIds.has(l.id)) await put(R.paths.detailEn(l), R.detailPage(ctx, l, { lang: 'en', related: related(l) }));
}
await put('/404.html', R.notFoundPage(ctx));
await put('/style.css', CSS);
await put('/site.js', SITE_JS);
await put('/favicon.svg', FAVICON);
await put('/.nojekyll', '');
await put('/CNAME', site.domain + '\n');
for (const f of site.googleVerification || []) await put('/' + f, `google-site-verification: ${f}`);

// Sitemap: alleen indexeerbare pagina's.
const urls = [
  ['/', today], ['/en/', today], [R.paths.archive(site.kind), today], [R.paths.all(), today],
  ...places.map((p) => [R.paths.place(p.slug), today]),
  ...active.flatMap((l) => [[R.paths.detail(l), l.updated || today], ...(enIds.has(l.id) ? [[R.paths.detailEn(l), l.updated || today]] : [])]),
];
await put('/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `<url><loc>${ctx.base}${u}</loc><lastmod>${d}</lastmod></url>`).join('\n')}\n</urlset>\n`);
await put('/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ctx.base}/sitemap.xml\n`);

// llms.txt: korte, feitelijke samenvatting voor AI-zoekmachines.
const rent = site.kind === 'rent';
const llms = `# ${rent ? 'Huuraanbod' : 'Koopaanbod'} Koops Makelaardij Haarlem

> Actueel ${rent ? 'huuraanbod' : 'koopaanbod'} van Koops Makelaardij Haarlem (Gedempte Oude Gracht 152 A, Haarlem, ${cfg.office.phone}). Elk half uur automatisch bijgewerkt. Laatste update: ${today}. Hoofdsite: ${site.mainSite}/

## Nu ${rent ? 'te huur' : 'te koop'} (${active.length})
${active.map((l) => `- [${l.street}, ${l.city}](${ctx.base}${R.paths.detail(l)}): ${R.priceLabel(l)}${l.surface ? `, ca. ${R.fmtNum(l.surface)} m²` : ''}${l.rooms ? `, ${l.rooms} kamers` : ''}${l.furnishing ? `, ${l.furnishing.toLowerCase()}` : ''}. Status: ${R.statusLabel(l)}.${isOwn(l) ? '' : ` Aangeboden door ${ctx.otherOffices[l.officeKey]?.name || 'een andere Koops-vestiging'}.`}`).join('\n') || '- Op dit moment geen aanbod.'}

## Per plaats
${places.map((p) => {
  const st = R.placeStats([...p.active, ...p.closed]);
  return `- [${p.city}](${ctx.base}${R.paths.place(p.slug)}): ${p.active.length} nu ${rent ? 'te huur' : 'te koop'}, ${st.closedCount} ${rent ? 'verhuurd' : 'verkocht'}${st.since ? ` sinds ${st.since}` : ''}${st.medianPrice ? `; middelste ${rent ? 'huurprijs' : 'vraagprijs'} ${R.euro(st.medianPrice)}${rent ? ' per maand' : ''}` : ''}.`;
}).join('\n')}

## Meer
- [Alle woningen](${ctx.base}${R.paths.all()})
- [${rent ? 'Recent verhuurd' : 'Recent verkocht'}](${ctx.base}${R.paths.archive(site.kind)})
- [${rent ? 'Woning verhuren met Koops' : 'Woning verkopen met Koops'}](${site.mainSite}${site.ownerCta.href})
`;
await put('/llms.txt', llms);

// Widgetdata (nieuwste eerst) voor de Squarespace-homepages.
const widgetItems = active.map((l) => ({
  id: l.id, kind: l.kind, priceNum: l.price || null, rooms: l.rooms || null, furnishing: l.furnishing || null,
  url: R.paths.detail(l), urlEn: enIds.has(l.id) ? R.paths.detailEn(l) : null, street: l.street, city: l.city, status: l.statusKey, label: R.statusLabel(l), price: R.priceLabel(l),
  meta: [l.surface && `${R.fmtNum(l.surface)} m²`, l.rooms && `${l.rooms} kamers`].filter(Boolean).join(' · '),
  img: imgs.get(l.id)?.[0]?.small || null,
  own: isOwn(l),
}));
await put('/latest.json', JSON.stringify({ updated: today, items: widgetItems }, null, 1));
await put('/widget.js', widgetJs(ctx.base, widgetItems, site.kind));

await writeArchive(archiveFile, archive);
console.log(`✔ ${site.domain}: ${active.length} actief, ${closed.length} in archief, ${places.length} plaatspagina's, ${urls.length} URL's in sitemap → ${path.relative(root, OUT)}`);
