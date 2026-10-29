// Haalt het aanbod op van koopsmakelaardij.nl en zet het om naar een eigen, schoon formaat.
// Alleen velden die Koops zelf al publiek toont worden overgenomen (geen huisnummer, postcode,
// huurdersgegevens of interne opmerkingen).
import { readFile } from 'node:fs/promises';

const UA = 'KoopsWoningenSync/1.0 (+https://woningen.verhuurmetkoops.nl; haarlem@koopsmakelaardij.nl)';

export const STATUS = {
  0: { key: 'nieuw', active: true, nl: 'Nieuw', en: 'New' },
  1: { key: 'beschikbaar', active: true, nl: 'Beschikbaar', en: 'Available' },
  2: { key: 'afgerond', active: false, nl: { rent: 'Verhuurd', sale: 'Verkocht' }, en: { rent: 'Let', sale: 'Sold' } },
  5: { key: 'voorbehoud', active: true, nl: { rent: 'Verhuurd onder voorbehoud', sale: 'Verkocht onder voorbehoud' }, en: { rent: 'Let subject to conditions', sale: 'Sold subject to conditions' } },
  6: { key: 'volgeboekt', active: true, nl: 'Bezichtigingen vol', en: 'Viewings full' },
  7: { key: 'onderbod', active: true, nl: 'Onder bod', en: 'Under offer' },
};

const FURNISHING = { 1: ['Kaal', 'Unfurnished'], 2: ['Gestoffeerd', 'Upholstered'], 3: ['Gemeubileerd', 'Furnished'] };

export async function loadSource({ url, fixture }) {
  let raw;
  if (fixture) {
    raw = JSON.parse(await readFile(fixture, 'utf8'));
  } else {
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' } });
        if (!res.ok) throw new Error(`HTTP ${res.status} voor ${url}`);
        const html = await res.text();
        const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (!m) throw new Error('Geen __NEXT_DATA__ gevonden: is de opbouw van koopsmakelaardij.nl veranderd?');
        raw = JSON.parse(m[1]);
        break;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 5000 * attempt));
      }
    }
    if (!raw) throw lastErr;
  }
  const list = raw?.props?.pageProps?.rentals;
  if (!Array.isArray(list)) throw new Error('Woningenlijst (props.pageProps.rentals) ontbreekt in de brondata.');
  return list;
}

const slugify = (s) =>
  String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const titleCase = (s) =>
  String(s || '').toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase());

const num = (v) => {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const date = (v) => (v && !String(v).startsWith('0000') ? String(v).slice(0, 10) : null);

export function normalize(item, regionSlug, { allOffices = false } = {}) {
  const parts = String(item.url_complete || '').split('/');
  const own = parts[1] === regionSlug; // vestiging Haarlem = eigen aanbod
  if (!own && !allOffices) return null;
  const kind = item.rent_or_sale === 'sale' ? 'sale' : 'rent';
  const typeSeg = parts[0] || '';
  const typeNl = titleCase(typeSeg.replace(/-te-(huur|koop)$/, '').replace(/-/g, ' '));
  const st = STATUS[item.status] ?? STATUS[1];
  const city = titleCase(item.city || item.region || 'Haarlem');
  const street = (item.title || item.street || '').trim();
  const furn = FURNISHING[item.furnishing];
  return {
    id: String(item.url_number),
    kind,
    own,
    officeKey: own ? regionSlug : String(item.region || parts[1] || '').toLowerCase(),
    status: Number(item.status),
    statusKey: st.key,
    active: st.active,
    street,
    city,
    citySlug: slugify(city),
    slug: `${slugify(street)}-${item.url_number}`,
    typeNl: typeNl || (kind === 'rent' ? 'Huurwoning' : 'Woning'),
    price: num(item.price_inc) ?? num(item.price_ex),
    surface: num(item.surface),
    rooms: num(item.room),
    bathrooms: num(item.bathroom),
    outside: num(item.outside_surface),
    plot: num(item.plot_size),
    year: num(item.construction_year),
    energy: (item.energy_label || '').replace('APLUSPLUSPLUS', 'A+++').replace('APLUSPLUS', 'A++').replace('APLUS', 'A+') || null,
    furnishing: furn ? furn[0] : null,
    furnishingEn: furn ? furn[1] : null,
    availableFrom: date(item.available),
    byAgreement: Boolean(item.available_by_agreement),
    descriptionNl: item.description || '',
    descriptionEn: item.description_en || '',
    images: (item.images || []).map((i) => i.file_name).filter(Boolean),
    sourceUrl: `${item.url_complete}.html`,
    online: date(item.online) || date(item.create_date),
    created: date(item.create_date),
    updated: date(item.update_date),
  };
}
