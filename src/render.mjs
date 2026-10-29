// Alle HTML-sjablonen. Bewust zonder framework: snelle, volledig server-side gerenderde pagina's
// die zoekmachines en AI-crawlers zonder JavaScript kunnen lezen.

export const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONTHS_NL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const fmtNum = (n) => Math.round(n).toLocaleString('nl-NL');
export const euro = (n) => (n ? `€ ${fmtNum(n)}` : 'Prijs op aanvraag');
const dateLong = (iso, lang = 'nl') => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'en' ? `${d} ${MONTHS_EN[m - 1]} ${y}` : `${d} ${MONTHS_NL[m - 1]} ${y}`;
};
const monthLong = (iso, lang = 'nl') => {
  if (!iso) return '';
  const [y, m] = iso.split('-').map(Number);
  return `${(lang === 'en' ? MONTHS_EN : MONTHS_NL)[m - 1]} ${y}`;
};

const ENTITIES = { '&sup2;': '²', '&nbsp;': ' ', '&amp;': '&', '&euro;': '€', '&eacute;': 'é', '&euml;': 'ë', '&iuml;': 'ï', '&ouml;': 'ö', '&uuml;': 'ü', '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”', '&ndash;': '–', '&mdash;': '—', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>' };

/** Zet de advertentietekst om naar platte tekst (scripts, stijlen en alle overige HTML gaan eruit). */
export function toText(html) {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>[ \t]*\r?\n?/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;|&#\d+;/gi, (e) => ENTITIES[e] ?? ' ')
    .replace(/\*\*/g, '')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Platte tekst → veilige HTML met alinea's en opsommingen. */
export function textToHtml(text) {
  return text
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split('\n').filter((l) => l.trim());
      const bullets = lines.filter((l) => /^[-•*]\s+/.test(l));
      if (bullets.length >= 2 && bullets.length === lines.length - (lines[0] && !/^[-•*]\s+/.test(lines[0]) ? 1 : 0)) {
        const head = /^[-•*]\s+/.test(lines[0]) ? '' : `<p>${esc(lines[0])}</p>`;
        return head + '<ul>' + bullets.map((l) => `<li>${esc(l.replace(/^[-•*]\s+/, ''))}</li>`).join('') + '</ul>';
      }
      return `<p>${lines.map(esc).join('<br>')}</p>`;
    })
    .join('\n');
}

export const snippet = (text, n = 155) => {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n - 1)) + '…';
};

/** Advertentieteksten beginnen vaak met "Straat, Plaats (m2) prijs"; die regel staat al in de kop. */
export function stripHeaderLine(text, l) {
  const first = text.split('\n')[0] || '';
  if (first.toLowerCase().startsWith(l.street.toLowerCase()) && /€|m2|m²/.test(first)) return text.slice(first.length).trim();
  return text.replace(/^-+\s*english below\s*-+\s*/i, '').trim();
}

export function hasOwnEnglish(l) {
  const nl = toText(l.descriptionNl), en = toText(l.descriptionEn);
  if (!en || en.length < 120) return false;
  return en.slice(0, 120) !== nl.slice(0, 120);
}

export function statusLabel(l, lang = 'nl') {
  const map = {
    nieuw: ['Nieuw', 'New'],
    beschikbaar: ['Beschikbaar', 'Available'],
    voorbehoud: l.kind === 'rent' ? ['Verhuurd onder voorbehoud', 'Let subject to conditions'] : ['Verkocht onder voorbehoud', 'Sold subject to conditions'],
    volgeboekt: ['Bezichtigingen vol', 'Viewings full'],
    onderbod: ['Onder bod', 'Under offer'],
    afgerond: l.kind === 'rent' ? ['Verhuurd', 'Let'] : ['Verkocht', 'Sold'],
  };
  if (l.withdrawn) return lang === 'en' ? 'No longer available' : 'Niet meer beschikbaar';
  return (map[l.statusKey] || map.beschikbaar)[lang === 'en' ? 1 : 0];
}

export function priceLabel(l, lang = 'nl') {
  if (!l.price) return lang === 'en' ? 'Price on request' : 'Prijs op aanvraag';
  if (l.kind === 'rent') return `${euro(l.price)} ${lang === 'en' ? 'per month' : 'per maand'}`;
  return `${lang === 'en' ? 'Asking price' : 'Vraagprijs'} ${euro(l.price)}`;
}

const availability = (l, lang, today) => {
  if (l.byAgreement || !l.availableFrom) return lang === 'en' ? 'By agreement' : 'In overleg';
  if (l.availableFrom <= today) return lang === 'en' ? 'Immediately' : 'Per direct';
  return dateLong(l.availableFrom, lang);
};

const isOwn = (l) => l.own !== false;
const otherOffice = (ctx, l) => (isOwn(l) ? null : ctx.otherOffices?.[l.officeKey] || { name: 'Koops Makelaardij', short: 'Koops Makelaardij', phone: ctx.office.phone, phoneIntl: ctx.office.phoneIntl });

// ---------- paden ----------
export const paths = {
  detail: (l) => `/woning/${l.citySlug}/${l.slug}/`,
  detailEn: (l) => `/en/property/${l.citySlug}/${l.slug}/`,
  place: (citySlug) => `/plaats/${citySlug}/`,
  archive: (kind) => (kind === 'rent' ? '/verhuurd/' : '/verkocht/'),
  all: () => '/aanbod/',
};

// ---------- bouwstenen ----------
function header(ctx, lang, altHref, path) {
  const s = ctx.site;
  const nav = lang === 'en' ? s.navEn : s.nav;
  const aanbod = lang === 'en' ? [s.kind === 'rent' ? 'Homes for rent' : 'Homes for sale', '/en/'] : [s.kind === 'rent' ? 'Huuraanbod' : 'Koopaanbod', '/'];
  const allLink = lang === 'en' ? '' : `<a${path === paths.all() ? ' class="on"' : ''} href="${paths.all()}">Alle woningen</a>`;
  const langLink = lang === 'en' ? `<a class="lang" href="${esc(altHref || '/')}" hreflang="nl" lang="nl">NL</a>` : `<a class="lang" href="${esc(altHref || '/en/')}" hreflang="en" lang="en">EN</a>`;
  return `<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="${s.mainSite}/"><img src="${s.logo}" alt="Koops Makelaardij Haarlem" width="190" height="48"></a>
    <nav aria-label="${lang === 'en' ? 'Main' : 'Hoofdmenu'}">
      <a${path === paths.all() ? '' : ' class="on"'} href="${aanbod[1]}">${aanbod[0]}</a>
      ${allLink}
      ${nav.map(([t, h]) => `<a href="${s.mainSite}${h}">${esc(t)}</a>`).join('\n      ')}
      ${langLink}
    </nav>
  </div>
</header>`;
}

function footer(ctx, lang) {
  const o = ctx.office, s = ctx.site;
  const en = lang === 'en';
  return `<footer class="foot">
  <div class="wrap foot-in">
    <div>
      <strong>${esc(o.legalName)}</strong><br>
      ${esc(o.street)}<br>${esc(o.postalCode)} ${esc(o.city)}<br>
      <a href="tel:${o.phoneIntl}">${esc(o.phone)}</a> · <a href="mailto:${o.email}">${esc(o.email)}</a><br>
      KvK ${esc(o.kvk)}
    </div>
    <div>
      <strong>${en ? 'More from Koops' : 'Meer van Koops'}</strong><br>
      <a href="${s.mainSite}/">${esc(s.mainSite.replace('https://www.', ''))}</a><br>
      ${en ? '' : `<a href="${paths.all()}">Alle woningen</a><br>`}
      ${en ? '' : `<a href="${paths.archive(s.kind)}">${s.kind === 'rent' ? 'Recent verhuurd' : 'Recent verkocht'}</a><br>`}
      ${en ? '<a href="/" hreflang="nl">Nederlands</a><br>' : `<a href="/en/" hreflang="en">${s.kind === 'rent' ? 'Homes for rent (English)' : 'Homes for sale (English)'}</a><br>`}
      <a href="${ctx.sourceBase}">koopsmakelaardij.nl</a>
    </div>
    <p class="small">${en ? 'Listings are updated automatically every 30 minutes.' : 'Het aanbod wordt elk half uur automatisch bijgewerkt.'} ${en ? 'Last update' : 'Laatste update'}: ${dateLong(ctx.today, lang)}.</p>
  </div>
</footer>`;
}

function card(l, ctx, lang = 'nl') {
  const img = ctx.imgs.get(l.id)?.[0];
  const href = lang === 'en' && ctx.enIds.has(l.id) ? paths.detailEn(l) : paths.detail(l);
  const closed = !l.active;
  const meta = [l.surface && `${fmtNum(l.surface)} m²`, l.rooms && `${l.rooms} ${lang === 'en' ? 'rooms' : 'kamers'}`, l.furnishing && (lang === 'en' ? l.furnishingEn : l.furnishing)].filter(Boolean).join(' · ');
  const when = closed && l.closedOn ? `<span class="when">${statusLabel(l, lang)} ${lang === 'en' ? 'in' : 'in'} ${monthLong(l.closedOn, lang)}</span>` : '';
  const data = `data-city="${esc(l.citySlug)}" data-price="${l.price || 0}" data-rooms="${l.rooms || 0}" data-furn="${esc((l.furnishing || '').toLowerCase())}" data-state="${closed ? 'done' : 'now'}"`;
  return `<article class="card${closed ? ' closed' : ''}" ${data}>
  <a href="${href}">
    <div class="ph">${img ? `<img src="${img.small}" alt="${esc(`${l.typeNl} ${l.street}, ${l.city}`)}" width="640" height="427" loading="lazy" decoding="async">` : '<div class="noimg"></div>'}<span class="badge b-${l.withdrawn ? 'afgerond' : l.statusKey}">${esc(statusLabel(l, lang))}</span></div>
    <div class="cb">
      <h3>${esc(l.street)}</h3>
      <p class="city">${esc(l.city)}${!isOwn(l) ? ` <span class="office">· ${esc(otherOffice(ctx, l).short)}</span>` : ''}</p>
      <p class="price">${esc(priceLabel(l, lang))}</p>
      ${meta ? `<p class="meta">${esc(meta)}</p>` : ''}
      ${when}
    </div>
  </a>
</article>`;
}

const grid = (items, ctx, lang) => `<div class="grid">${items.map((l) => card(l, ctx, lang)).join('\n')}</div>`;

function ownerCta(ctx, lang, title) {
  const c = lang === 'en' ? ctx.site.ownerCtaEn : ctx.site.ownerCta;
  return `<section class="owner">
  <div>
    <h2>${esc(title || c.title)}</h2>
    <p>${esc(c.text)}</p>
  </div>
  <div class="owner-act">
    <a class="btn" href="${ctx.site.mainSite}${c.href}">${esc(c.button)}</a>
    <a class="btn line" href="tel:${ctx.office.phoneIntl}">${lang === 'en' ? 'Call' : 'Bel'} ${esc(ctx.office.phone)}</a>
    <p class="small">★ ${ctx.site.rating}/5 ${lang === 'en' ? 'on Google' : 'op Google'}</p>
  </div>
</section>`;
}

// Reactieformulier: wordt via het Google Apps Script van Koops gemaild naar haarlem@koopsmakelaardij.nl.
function leadForm(ctx, l, lang) {
  const en = lang === 'en', rent = l.kind === 'rent';
  const oo = otherOffice(ctx, l);
  const t = en
    ? { h: 'Respond to this home', name: 'Name', email: 'Email', phone: 'Phone', from: rent ? 'Preferred start date' : 'When would you like to view?', people: rent ? 'Number of occupants' : 'I would like to', msg: 'Message (optional)', send: 'Send', note: 'We only use your details to respond to your enquiry.', ok: 'Thank you! We have received your response and will contact you soon, usually within one working day.', err: `Sending failed. Please call ${ctx.office.phone} or email ${ctx.office.email}.` }
    : { h: 'Reageer op deze woning', name: 'Naam', email: 'E-mail', phone: 'Telefoon', from: rent ? 'Gewenste ingangsdatum' : 'Wanneer wil je bezichtigen?', people: rent ? 'Aantal bewoners' : 'Ik wil graag', msg: 'Bericht (optioneel)', send: 'Versturen', note: 'We gebruiken je gegevens alleen om op je reactie te antwoorden.', ok: 'Bedankt! We hebben je reactie ontvangen en nemen snel contact met je op, meestal binnen één werkdag.', err: `Versturen is niet gelukt. Bel ons op ${ctx.office.phone} of mail naar ${ctx.office.email}.` };
  const wish = en ? ['Schedule a viewing', 'Receive more information', 'Make an offer'] : ['Een bezichtiging plannen', 'Meer informatie ontvangen', 'Een bod uitbrengen'];
  return `<section class="sec lead-form" id="reageer">
  <h2>${t.h}</h2>
  <form class="kform" data-type="reactie" data-ok="${esc(t.ok)}" data-err="${esc(t.err)}" novalidate>
    <input type="hidden" name="street" value="${esc(l.street)}"><input type="hidden" name="city" value="${esc(l.city)}">
    <input type="hidden" name="office" value="${esc(oo ? oo.short.replace('Koops ', '') : 'Haarlem')}"><input type="hidden" name="url" value="${esc(ctx.base + (en ? paths.detailEn(l) : paths.detail(l)))}">
    <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
    <div class="f2">
      <label>${t.name}<input name="name" required autocomplete="name"></label>
      <label>${t.email}<input name="email" type="email" required autocomplete="email"></label>
      <label>${t.phone}<input name="phone" type="tel" required autocomplete="tel"></label>
      ${rent ? `<label>${t.from}<input name="from" type="date"></label>
      <label>${t.people}<select name="people"><option value="">–</option><option>1</option><option>2</option><option>3</option><option>4+</option></select></label>`
    : `<label>${t.people}<select name="people">${wish.map((w) => `<option>${esc(w)}</option>`).join('')}</select></label>
      <label>${t.from}<input name="from" placeholder="${en ? 'e.g. weekday evenings' : 'bijv. doordeweeks na 17 uur'}"></label>`}
    </div>
    <label>${t.msg}<textarea name="message" rows="4"></textarea></label>
    <button class="btn" type="submit">${t.send}</button>
    <p class="small">${t.note}</p>
    <p class="fmsg" role="status" aria-live="polite"></p>
  </form>
</section>`;
}

// "Mail mij bij nieuw aanbod": inschrijving met bevestigingsmail, beheerd in de eigen Google Sheet.
function alertBox(ctx, lang, { city } = {}) {
  const en = lang === 'en', rent = ctx.site.kind === 'rent';
  const cities = ctx.alertCities || [];
  const prices = rent ? [1500, 2000, 2500, 3000, 4000, 5000] : [400000, 500000, 600000, 750000, 1000000, 1500000];
  const t = en
    ? { h: rent ? 'Get new rental homes by email' : 'Get new homes for sale by email', p: 'Be the first to know: we email you as soon as a matching home comes online.', all: 'All locations', max: 'Max. price', any: 'Any', rooms: 'Min. rooms', furn: 'Interior', email: 'Email', send: 'Notify me', ok: 'Almost done: check your inbox and confirm your email address.', err: 'Something went wrong. Please try again later.', note: 'Unsubscribe at any time with one click.' }
    : { h: rent ? 'Nieuwe huurwoningen per mail' : 'Nieuwe koopwoningen per mail', p: 'Wees er als eerste bij: we mailen je zodra er een passende woning online komt.', all: 'Alle plaatsen', max: 'Max. prijs', any: 'Geen voorkeur', rooms: 'Min. kamers', furn: 'Oplevering', email: 'E-mail', send: 'Houd mij op de hoogte', ok: 'Bijna klaar: kijk in je mailbox en bevestig je e-mailadres.', err: 'Er ging iets mis. Probeer het later nog eens.', note: 'Afmelden kan altijd met één klik.' };
  return `<section class="alert-box">
  <div><h2>${t.h}</h2><p>${t.p}</p></div>
  <form class="kform" data-type="inschrijving" data-ok="${esc(t.ok)}" data-err="${esc(t.err)}" novalidate>
    <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
    <fieldset class="cities"><legend>${en ? 'Locations' : 'Plaatsen'} <span class="small">(${t.all.toLowerCase()} ${en ? 'if none selected' : 'als je niets kiest'})</span></legend>
      ${cities.map((c) => `<label class="chk"><input type="checkbox" name="cities" value="${esc(c)}"${city === c ? ' checked' : ''}> ${esc(c)}</label>`).join('')}
    </fieldset>
    <div class="f3">
      <label>${t.max}<select name="maxPrice"><option value="">${t.any}</option>${prices.map((p) => `<option value="${p}">${euro(p)}${rent ? (en ? ' p/m' : ' p/m') : ''}</option>`).join('')}</select></label>
      <label>${t.rooms}<select name="minRooms"><option value="">${t.any}</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label>
      ${rent ? `<label>${t.furn}<select name="furnishing"><option value="">${t.any}</option><option value="Gemeubileerd">${en ? 'Furnished' : 'Gemeubileerd'}</option><option value="Gestoffeerd">${en ? 'Upholstered' : 'Gestoffeerd'}</option></select></label>` : ''}
    </div>
    <div class="f-inline"><label class="grow">${t.email}<input name="email" type="email" required autocomplete="email"></label><button class="btn" type="submit">${t.send}</button></div>
    <p class="small">${t.note}</p>
    <p class="fmsg" role="status" aria-live="polite"></p>
  </form>
</section>`;
}

function avgLine(ctx, lang) {
  if (!ctx.avgDays) return '';
  return lang === 'en' ? `Let in ${ctx.avgDays} days on average` : `Gemiddeld verhuurd in ${ctx.avgDays} dagen`;
}

function breadcrumbs(items) {
  const html = `<nav class="crumbs" aria-label="Kruimelpad">${items.map(([t, h], i) => (i < items.length - 1 ? `<a href="${h}">${esc(t)}</a> ›` : `<span>${esc(t)}</span>`)).join(' ')}</nav>`;
  return html;
}

function breadcrumbLd(ctx, items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, h], i) => ({ '@type': 'ListItem', position: i + 1, name, item: ctx.base + h })),
  };
}

function orgLd(ctx) {
  const o = ctx.office;
  return {
    '@type': 'RealEstateAgent',
    '@id': ctx.site.orgId,
    name: o.name,
    url: ctx.site.mainSite + '/',
    telephone: o.phoneIntl,
    email: o.email,
    address: { '@type': 'PostalAddress', streetAddress: o.street, postalCode: o.postalCode, addressLocality: o.city, addressCountry: 'NL' },
  };
}

export function layout(ctx, { lang = 'nl', title, description, path, robots = 'index,follow', alternates = null, ld = [], body, ogImage }) {
  const url = ctx.base + path;
  const alt = alternates
    ? `<link rel="alternate" hreflang="nl" href="${ctx.base + alternates.nl}">\n<link rel="alternate" hreflang="en" href="${ctx.base + alternates.en}">\n<link rel="alternate" hreflang="x-default" href="${ctx.base + alternates.nl}">`
    : '';
  const graph = { '@context': 'https://schema.org', '@graph': [orgLd(ctx), ...ld] };
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${url}">
${alt}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
${ogImage ? `<meta property="og:image" content="${ogImage.startsWith('http') ? ogImage : ctx.base + ogImage}">` : ''}
<meta property="og:locale" content="${lang === 'en' ? 'en_GB' : 'nl_NL'}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css?v=${ctx.cssVersion}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>
</head>
<body data-endpoint="${esc(ctx.formEndpoint || '')}" data-site="${ctx.site.kind}" data-lang="${lang}">
${header(ctx, lang, alternates ? (lang === 'en' ? alternates.nl : alternates.en) : null, path)}
<main class="wrap">
${body}
</main>
${footer(ctx, lang)}
<script src="/site.js?v=${ctx.jsVersion}" defer></script>
</body>
</html>
`;
}

// ---------- pagina's ----------
export function indexPage(ctx, { active, closed, places }) {
  const rent = ctx.site.kind === 'rent';
  const h1 = rent ? 'Huurwoningen van Koops Makelaardij in Haarlem en omgeving' : 'Woningen te koop bij Koops Makelaardij in Haarlem en omgeving';
  const intro = rent ? 'Dit is het actuele huuraanbod van Koops Makelaardij Haarlem:' : 'Dit is het actuele koopaanbod van Koops Makelaardij Haarlem:';
  const metaDesc = rent
    ? `Actuele huurwoningen van Koops Makelaardij in Haarlem en omgeving (${active.length}), de nieuwste bovenaan, plus recent verhuurde woningen.`
    : `Actuele koopwoningen van Koops Makelaardij in Haarlem en omgeving (${active.length}), de nieuwste bovenaan, plus recent verkochte woningen.`;
  // Recent afgerond: eerst ons eigen werk (nieuwste eerst), aangevuld met de duurdere woningen van de andere vestigingen.
  const ownClosed = closed.filter(isOwn).slice(0, 6);
  const recent = [...ownClosed, ...closed.filter((l) => !isOwn(l)).sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 12 - ownClosed.length)];
  const own = active.filter(isOwn), others = active.filter((l) => !isOwn(l));
  const ld = [
    breadcrumbLd(ctx, [[rent ? 'Huuraanbod' : 'Koopaanbod', '/']]),
    { '@type': 'ItemList', name: h1, numberOfItems: active.length, itemListElement: active.map((l, i) => ({ '@type': 'ListItem', position: i + 1, url: ctx.base + paths.detail(l), name: `${l.street}, ${l.city}` })) },
  ];
  const body = `
<section class="hero">
  <h1>${esc(h1)}</h1>
  <p class="lead">${esc(intro)}</p>
  ${ctx.avgDays ? `<p class="proof">★ ${esc(ctx.site.rating)} op Google · ${avgLine(ctx, 'nl')}</p>` : ''}
  ${places.length ? `<p class="chips">${places.map((p) => `<a href="${paths.place(p.slug)}">${esc(p.city)}</a>`).join('')}</p>` : ''}
</section>
<section>
  <h2 class="${others.length ? '' : 'sr'}">${rent ? 'Te huur via Koops Makelaardij Haarlem' : 'Te koop via Koops Makelaardij Haarlem'}</h2>
  ${own.length ? grid(own, ctx) : `<p class="empty">${rent ? 'Op dit moment is al ons huuraanbod verhuurd.' : 'Op dit moment hebben we in Haarlem en omgeving geen woningen te koop.'} Bekijk ook <a href="${ctx.sourceBase}zoeken">het aanbod van alle Koops-vestigingen</a>.</p>`}
</section>
${recent.length ? `<section class="sec">
  <div class="sec-head"><h2>${rent ? 'Recent verhuurd' : 'Recent verkocht'}</h2><a href="${paths.archive(ctx.site.kind)}">${rent ? 'Alle verhuurde woningen' : 'Alle verkochte woningen'} →</a></div>
  <p class="small">${rent ? 'Een greep uit de woningen die Koops Makelaardij onlangs heeft verhuurd, in Haarlem en via onze andere vestigingen.' : 'Een greep uit de woningen die Koops Makelaardij onlangs heeft verkocht, in Haarlem en via onze andere vestigingen.'}</p>
  ${grid(recent, ctx)}
</section>` : ''}
${others.length ? `<section class="sec">
  <div class="sec-head"><h2>${rent ? 'Te huur' : 'Te koop'} bij onze andere vestigingen</h2></div>
  <p class="small">Aanbod van Koops Makelaardij in Amsterdam, Amstelveen en Leiden. Voor deze woningen helpt de betreffende vestiging je verder.</p>
  ${grid(others, ctx)}
</section>` : ''}
${ctx.formEndpoint ? alertBox(ctx, 'nl') : ''}
${ownerCta(ctx, 'nl')}`;
  return layout(ctx, {
    title: rent ? 'Huurwoningen Haarlem e.o. | Koops Makelaardij' : 'Woningen te koop Haarlem e.o. | Koops Makelaardij',
    description: metaDesc,
    path: '/',
    alternates: { nl: '/', en: '/en/' },
    ld,
    body,
    ogImage: active[0] && ctx.imgs.get(active[0].id)?.[0]?.large,
  });
}

export function indexPageEn(ctx, { active, closed }) {
  const rent = ctx.site.kind === 'rent';
  const h1 = rent ? 'Rental homes in Haarlem and surroundings from Koops Makelaardij' : 'Homes for sale in Haarlem and surroundings from Koops Makelaardij';
  const intro = rent ? 'These are the current rental listings of Koops Makelaardij Haarlem:' : 'These are the current homes for sale from Koops Makelaardij Haarlem:';
  const own = active.filter(isOwn), others = active.filter((l) => !isOwn(l));
  const ownClosed = closed.filter(isOwn).slice(0, 6);
  const recent = [...ownClosed, ...closed.filter((l) => !isOwn(l)).sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 12 - ownClosed.length)];
  const body = `
<section class="hero">
  <h1>${esc(h1)}</h1>
  <p class="lead">${esc(intro)}</p>
  ${ctx.avgDays ? `<p class="proof">★ ${esc(ctx.site.rating)} on Google · ${avgLine(ctx, 'en')}</p>` : ''}
</section>
<section>
  <h2 class="${others.length ? '' : 'sr'}">${rent ? 'For rent' : 'For sale'} through Koops Makelaardij Haarlem</h2>
  ${own.length ? grid(own, ctx, 'en') : `<p class="empty">${rent ? 'All our rental homes in the Haarlem area are currently let.' : 'We currently have no homes for sale in the Haarlem area.'} Please see the listings of our other offices below.</p>`}
</section>
${recent.length ? `<section class="sec"><div class="sec-head"><h2>${rent ? 'Recently let' : 'Recently sold'}</h2></div><p class="small">A selection of homes Koops Makelaardij recently ${rent ? 'let' : 'sold'}, in Haarlem and through our other offices.</p>${grid(recent, ctx, 'en')}</section>` : ''}
${others.length ? `<section class="sec"><div class="sec-head"><h2>${rent ? 'For rent' : 'For sale'} at our other offices</h2></div><p class="small">Listings from Koops Makelaardij in Amsterdam, Amstelveen and Leiden. The relevant office will assist you with these homes.</p>${grid(others, ctx, 'en')}</section>` : ''}
${ctx.formEndpoint ? alertBox(ctx, 'en') : ''}
${ownerCta(ctx, 'en')}`;
  return layout(ctx, {
    lang: 'en', title: rent ? 'Homes for rent in Haarlem | Koops Makelaardij' : 'Homes for sale in Haarlem | Koops Makelaardij',
    description: `${active.length} homes ${rent ? 'for rent' : 'for sale'} from Koops Makelaardij in Haarlem and surroundings, newest first, plus recently ${rent ? 'let' : 'sold'} homes.`,
    path: '/en/',
    alternates: { nl: '/', en: '/en/' },
    ld: [breadcrumbLd(ctx, [[rent ? 'Homes for rent' : 'Homes for sale', '/en/']]), { '@type': 'ItemList', name: h1, numberOfItems: active.length, itemListElement: active.map((l, i) => ({ '@type': 'ListItem', position: i + 1, url: ctx.base + (ctx.enIds.has(l.id) ? paths.detailEn(l) : paths.detail(l)), name: `${l.street}, ${l.city}` })) }],
    body,
    ogImage: active[0] && ctx.imgs.get(active[0].id)?.[0]?.large,
  });
}

function factsRows(l, lang, today) {
  const en = lang === 'en';
  const rows = [
    [en ? 'Type' : 'Soort woning', en ? null : l.typeNl],
    [en ? 'Living area' : 'Woonoppervlakte', l.surface && `ca. ${fmtNum(l.surface)} m²`],
    [en ? 'Rooms' : 'Aantal kamers', l.rooms],
    [en ? 'Bathrooms' : 'Badkamers', l.bathrooms],
    [en ? 'Outdoor space' : 'Buitenruimte', l.outside && `ca. ${fmtNum(l.outside)} m²`],
    [en ? 'Plot' : 'Perceel', l.plot && `${fmtNum(l.plot)} m²`],
    [en ? 'Year built' : 'Bouwjaar', l.year],
    [en ? 'Energy label' : 'Energielabel', l.energy],
    [en ? 'Interior' : 'Opleveringsniveau', en ? l.furnishingEn : l.furnishing],
    [en ? 'Available' : 'Beschikbaar per', l.active && l.kind === 'rent' ? availability(l, lang, today) : null],
    ['Status', statusLabel(l, lang)],
  ];
  return rows.filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== false)
    .map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('');
}

function listingLd(ctx, l, url, imgs, text) {
  const residenceType = /appartement|flat|bovenwoning|benedenwoning|penthouse|maisonnette|studio|verdieping/i.test(l.typeNl) ? 'Apartment' : /eengezins|tussenwoning|hoekwoning|villa|woonhuis|herenhuis|vrijstaand|twee-onder/i.test(l.typeNl) ? 'SingleFamilyResidence' : 'Residence';
  const offer = {
    '@type': 'Offer',
    price: l.price || undefined,
    priceCurrency: 'EUR',
    businessFunction: l.kind === 'rent' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
    availability: l.active ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    offeredBy: isOwn(l) ? { '@id': ctx.site.orgId } : { '@type': 'RealEstateAgent', name: otherOffice(ctx, l).name, telephone: otherOffice(ctx, l).phoneIntl },
  };
  if (l.kind === 'rent' && l.price) offer.priceSpecification = { '@type': 'UnitPriceSpecification', price: l.price, priceCurrency: 'EUR', unitCode: 'MON', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } };
  return {
    '@type': 'RealEstateListing',
    '@id': url + '#listing',
    url,
    name: `${l.typeNl} ${l.kind === 'rent' ? 'te huur' : 'te koop'}: ${l.street}, ${l.city}`,
    description: snippet(text, 300),
    datePosted: l.online || undefined,
    image: imgs.slice(0, 6).map((i) => (i.large.startsWith('http') ? i.large : ctx.base + i.large)),
    offers: offer,
    mainEntity: {
      '@type': residenceType,
      name: `${l.street}, ${l.city}`,
      address: { '@type': 'PostalAddress', streetAddress: l.street, addressLocality: l.city, addressRegion: 'Noord-Holland', addressCountry: 'NL' },
      floorSize: l.surface ? { '@type': 'QuantitativeValue', value: l.surface, unitCode: 'MTK' } : undefined,
      numberOfRooms: l.rooms || undefined,
      numberOfBathroomsTotal: l.bathrooms || undefined,
      yearBuilt: l.year || undefined,
    },
  };
}

export function detailPage(ctx, l, { lang = 'nl', related = [] } = {}) {
  const en = lang === 'en';
  const rent = l.kind === 'rent';
  const imgs = ctx.imgs.get(l.id) || [];
  const path = en ? paths.detailEn(l) : paths.detail(l);
  const enText = en ? (hasOwnEnglish(l) ? toText(l.descriptionEn) : ctx.translations?.[l.id] || '') : '';
  const nlFallback = en && !enText;
  const raw = en ? enText || toText(l.descriptionNl) : toText(l.descriptionNl);
  const text = stripHeaderLine(raw, l);
  const hasEn = ctx.enIds.has(l.id);
  const what = en ? (rent ? 'for rent' : 'for sale') : rent ? 'te huur' : 'te koop';
  const h1 = en ? `${l.street}, ${l.city} – home ${what}` : `${l.typeNl} ${what}: ${l.street}, ${l.city}`;
  const crumbs = en
    ? [[rent ? 'Homes for rent' : 'Homes for sale', '/en/'], [`${l.street}, ${l.city}`, path]]
    : [[rent ? 'Huuraanbod' : 'Koopaanbod', '/'], ...(ctx.placeSlugs.has(l.citySlug) ? [[l.city, paths.place(l.citySlug)]] : []), [l.street, path]];
  const source = `${ctx.sourceBase}${l.sourceUrl}?utm_source=${encodeURIComponent(ctx.site.domain)}&utm_medium=referral&utm_campaign=woningaanbod`;
  const oo = otherOffice(ctx, l);
  const wa = `https://wa.me/${ctx.office.whatsapp}?text=${encodeURIComponent(`Hallo Koops, ik heb interesse in ${l.street}, ${l.city} (${ctx.base}${path})`)}`;
  const closedBanner = !l.active
    ? `<div class="notice"><strong>${esc(statusLabel(l, lang))}${l.closedOn && !l.withdrawn ? ` ${en ? 'in' : 'in'} ${monthLong(l.closedOn, lang)}` : ''}.</strong> ${en ? 'This home is no longer available.' : 'Deze woning is niet meer beschikbaar.'} <a href="${en ? '/en/' : '/'}">${en ? 'View current listings' : 'Bekijk het actuele aanbod'}</a></div>`
    : '';
  const gallery = imgs.length
    ? `<div class="gallery">
  <a class="g-main" href="${imgs[0].large}"><img src="${imgs[0].large}" alt="${esc(`${l.typeNl} ${l.street}, ${l.city} – foto 1 van ${imgs.length}`)}" width="${imgs[0].width}" height="${imgs[0].height}" fetchpriority="high"></a>
  ${imgs.length > 1 ? `<div class="g-rest">${imgs.slice(1).map((im, i) => `<a href="${im.large}"><img src="${im.small}" alt="${esc(`${l.street}, ${l.city} – foto ${i + 2} van ${imgs.length}`)}" width="640" height="427" loading="lazy" decoding="async"></a>`).join('')}</div>` : ''}
</div>`
    : '';
  const contact = l.active
    ? `<aside class="contact">
  <p class="price big">${esc(priceLabel(l, lang))}</p>
  <a class="btn" href="${ctx.formEndpoint ? '#reageer' : esc(source)}"${ctx.formEndpoint ? '' : ' rel="noopener"'}>${en ? 'Respond to this home' : 'Reageer op deze woning'}</a>
  <a class="btn line" href="tel:${oo ? oo.phoneIntl : ctx.office.phoneIntl}">${en ? 'Call' : 'Bel'} ${esc(oo ? oo.phone : ctx.office.phone)}</a>
  ${oo ? '' : `<a class="btn line" href="${esc(wa)}" rel="noopener">WhatsApp</a>`}
  ${oo ? `<p class="small"><strong>${en ? 'Offered by' : 'Aangeboden door'} ${esc(oo.name)}.</strong></p>` : ''}
  ${ctx.formEndpoint ? '' : `<p class="small">${en ? 'You respond via the Koops Makelaardij website, where you can also request a viewing.' : 'Je reageert via de website van Koops Makelaardij, waar je ook een bezichtiging aanvraagt.'}</p>`}
</aside>`
    : `<aside class="contact"><p class="price big">${esc(statusLabel(l, lang))}</p><a class="btn" href="${en ? '/en/' : '/'}">${en ? 'View current listings' : 'Bekijk het actuele aanbod'}</a></aside>`;
  const body = `
${breadcrumbs(crumbs)}
${closedBanner}
<article class="detail">
  <header class="d-head">
    <p class="kicker"><span class="badge inline b-${l.withdrawn ? 'afgerond' : l.statusKey}">${esc(statusLabel(l, lang))}</span> ${esc(en ? (rent ? 'Rental' : 'For sale') : l.typeNl)} · ${esc(l.city)}</p>
    <h1>${esc(h1)}</h1>
    <p class="price">${esc(priceLabel(l, lang))}${l.surface ? ` · ca. ${fmtNum(l.surface)} m²` : ''}${l.rooms ? ` · ${l.rooms} ${en ? 'rooms' : 'kamers'}` : ''}</p>
    ${hasEn ? `<p class="small"><a href="${en ? paths.detail(l) : paths.detailEn(l)}" hreflang="${en ? 'nl' : 'en'}">${en ? 'Lees in het Nederlands' : 'Read in English'}</a></p>` : ''}
  </header>
  ${gallery}
  <div class="d-cols">
    <div class="d-main">
      <h2>${en ? 'Description' : 'Omschrijving'}</h2>
      ${nlFallback && text ? '<p class="notice">This description is only available in Dutch. Questions? We are happy to tell you more in English.</p>' : ''}
      <div class="prose"${nlFallback ? ' lang="nl"' : ''}>${textToHtml(text) || `<p>${en ? 'Description follows.' : 'Omschrijving volgt.'}</p>`}</div>
      <h2>${en ? 'Features' : 'Kenmerken'}</h2>
      <table class="facts"><tbody>${factsRows(l, lang, ctx.today)}</tbody></table>
      ${l.online ? `<p class="small">${en ? 'Listed on' : 'Online sinds'} ${dateLong(l.online, lang)}.</p>` : ''}
    </div>
    ${contact}
  </div>
</article>
${l.active && ctx.formEndpoint ? leadForm(ctx, l, lang) : ''}
${related.length ? `<section class="sec"><div class="sec-head"><h2>${en ? 'Other homes' : rent ? 'Meer huurwoningen' : 'Meer woningen te koop'}</h2></div>${grid(related, ctx, lang)}</section>` : ''}
${ctx.formEndpoint ? alertBox(ctx, lang, { city: l.city }) : ''}
${ownerCta(ctx, lang, !l.active && rent && !en ? `Ook je woning in ${l.city} zo verhuren?` : null)}`;
  const itemLd = listingLd(ctx, l, ctx.base + path, imgs, text);
  return layout(ctx, {
    lang,
    title: en ? `${l.street}, ${l.city} – ${what} | Koops Makelaardij` : `${l.street}, ${l.city} – ${l.typeNl.toLowerCase()} ${what} | Koops`,
    description: snippet(`${priceLabel(l, lang)}${l.surface ? `, ca. ${fmtNum(l.surface)} m²` : ''}${l.rooms ? `, ${l.rooms} ${en ? 'rooms' : 'kamers'}` : ''}. ${text}`),
    path,
    robots: l.active ? 'index,follow' : 'noindex,follow',
    alternates: hasEn ? { nl: paths.detail(l), en: paths.detailEn(l) } : null,
    ld: [itemLd, breadcrumbLd(ctx, crumbs)],
    body,
    ogImage: imgs[0]?.large,
  });
}

const median = (arr) => {
  const a = arr.filter(Boolean).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

export function placeStats(items) {
  const closed = items.filter((l) => !l.active && !l.withdrawn);
  const priced = closed.filter((l) => l.price);
  const perM2 = priced.filter((l) => l.surface).map((l) => l.price / l.surface);
  const years = closed.map((l) => l.closedOn).filter(Boolean).sort();
  return {
    closedCount: closed.length,
    medianPrice: priced.length >= 3 ? median(priced.map((l) => l.price)) : null,
    medianPerM2: perM2.length >= 3 ? median(perM2) : null,
    minPrice: priced.length >= 3 ? Math.min(...priced.map((l) => l.price)) : null,
    maxPrice: priced.length >= 3 ? Math.max(...priced.map((l) => l.price)) : null,
    since: years[0] ? years[0].slice(0, 4) : null,
  };
}

export function placePage(ctx, place) {
  const rent = ctx.site.kind === 'rent';
  const { city, slug, active, closed } = place;
  const st = placeStats([...active, ...closed]);
  const h1 = rent ? `Huurwoningen in ${city}` : `Woningen te koop in ${city}`;
  const facts = [];
  if (st.closedCount) facts.push(`Koops Makelaardij Haarlem ${rent ? 'verhuurde' : 'verkocht'} ${st.since ? `sinds ${st.since} ` : ''}${st.closedCount} ${st.closedCount === 1 ? 'woning' : 'woningen'} in ${city}.`);
  if (st.medianPrice) facts.push(rent ? `De middelste huurprijs daarvan was ${euro(st.medianPrice)} per maand${st.medianPerM2 ? `, ongeveer ${euro(st.medianPerM2)} per m²` : ''}.` : `De middelste vraagprijs daarvan was ${euro(st.medianPrice)}${st.medianPerM2 ? `, ongeveer ${euro(st.medianPerM2)} per m²` : ''}.`);
  const intro = `${active.length ? `Nu ${active.length === 1 ? 'is er 1 woning' : `zijn er ${active.length} woningen`} ${rent ? 'te huur' : 'te koop'} in ${city}.` : `Op dit moment hebben we in ${city} niets ${rent ? 'te huur' : 'te koop'}.`} ${facts.join(' ')}`.trim();
  const statsBox = st.medianPrice
    ? `<dl class="stats">
  <div><dt>${rent ? 'Verhuurd' : 'Verkocht'}${st.since ? ` sinds ${st.since}` : ''}</dt><dd>${st.closedCount}</dd></div>
  <div><dt>${rent ? 'Middelste huurprijs' : 'Middelste vraagprijs'}</dt><dd>${euro(st.medianPrice)}${rent ? ' p/m' : ''}</dd></div>
  ${st.medianPerM2 ? `<div><dt>${rent ? 'Huurprijs per m²' : 'Vraagprijs per m²'}</dt><dd>${euro(st.medianPerM2)}</dd></div>` : ''}
  <div><dt>Spreiding</dt><dd>${euro(st.minPrice)} – ${euro(st.maxPrice)}</dd></div>
</dl>
<p class="small">${rent ? 'Op basis van de huurprijzen in onze advertenties van woningen die we hebben verhuurd.' : 'Op basis van de vraagprijzen van woningen die we hebben verkocht; de uiteindelijke verkoopprijs kan afwijken.'}</p>`
    : '';
  const path = paths.place(slug);
  const crumbs = [[rent ? 'Huuraanbod' : 'Koopaanbod', '/'], [city, path]];
  const body = `
${breadcrumbs(crumbs)}
<section class="hero">
  <h1>${esc(h1)}</h1>
  <p class="lead">${esc(intro)}</p>
  ${statsBox}
</section>
${active.length ? `<section class="sec"><div class="sec-head"><h2>${rent ? `Nu te huur in ${city}` : `Nu te koop in ${city}`}</h2></div>${grid(active, ctx)}</section>` : ''}
${closed.length ? `<section class="sec"><div class="sec-head"><h2>${rent ? `Verhuurd in ${city}` : `Verkocht in ${city}`}</h2></div>${grid(closed.slice(0, 24), ctx)}</section>` : ''}
${ownerCta(ctx, 'nl', rent ? `Je woning verhuren in ${city}?` : `Je woning verkopen in ${city}?`)}`;
  return layout(ctx, {
    title: `${h1} | Koops Makelaardij`,
    description: snippet(intro),
    path,
    ld: [breadcrumbLd(ctx, crumbs), { '@type': 'ItemList', name: h1, itemListElement: active.map((l, i) => ({ '@type': 'ListItem', position: i + 1, url: ctx.base + paths.detail(l) })) }],
    body,
  });
}

export function archivePage(ctx, closed) {
  const rent = ctx.site.kind === 'rent';
  const h1 = rent ? 'Recent verhuurd door Koops Makelaardij' : 'Recent verkocht door Koops Makelaardij';
  const byYear = new Map();
  for (const l of closed) {
    const y = (l.closedOn || '').slice(0, 4) || 'Eerder';
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(l);
  }
  const intro = rent
    ? `Een overzicht van ${closed.length} woningen die Koops Makelaardij heeft verhuurd, in Haarlem en omgeving en via onze andere vestigingen. De meest recente staan bovenaan.`
    : `Een overzicht van ${closed.length} woningen die Koops Makelaardij heeft verkocht, in Haarlem en omgeving en via onze andere vestigingen. De meest recente staan bovenaan.`;
  const path = paths.archive(ctx.site.kind);
  const crumbs = [[rent ? 'Huuraanbod' : 'Koopaanbod', '/'], [rent ? 'Verhuurd' : 'Verkocht', path]];
  const body = `
${breadcrumbs(crumbs)}
<section class="hero"><h1>${esc(h1)}</h1><p class="lead">${esc(intro)}</p></section>
${[...byYear].map(([y, items]) => `<section class="sec"><div class="sec-head"><h2>${esc(y)}</h2></div>${grid(items, ctx)}</section>`).join('\n')}
${ownerCta(ctx, 'nl')}`;
  return layout(ctx, { title: `${rent ? 'Verhuurde' : 'Verkochte'} woningen Haarlem e.o. | Koops Makelaardij`, description: snippet(intro), path, ld: [breadcrumbLd(ctx, crumbs)], body });
}

// Alle woningen op één pagina: eerst wat nu beschikbaar is (eigen aanbod voorop), daarna wat Koops recent
// heeft verhuurd/verkocht. Eigen werk eerst, aangevuld met de duurdere woningen van de andere vestigingen.
// Filters (werken in de browser; zonder JavaScript blijft alles gewoon zichtbaar). Ook via de URL: /aanbod/?plaats=haarlem&max=2500
function filterBar(ctx, items) {
  const rent = ctx.site.kind === 'rent';
  const cityCount = new Map();
  for (const l of items) cityCount.set(l.citySlug, { name: l.city, n: (cityCount.get(l.citySlug)?.n || 0) + 1 });
  const cities = [...cityCount].sort((a, b) => b[1].n - a[1].n);
  const prices = rent ? [1500, 2000, 2500, 3000, 4000, 5000] : [400000, 500000, 600000, 750000, 1000000, 1500000, 2000000];
  return `<form class="filters" id="filters" role="search" aria-label="Woningen filteren">
  <label>Status<select name="status"><option value="">Alles</option><option value="now">${rent ? 'Te huur' : 'Te koop'}</option><option value="done">${rent ? 'Verhuurd' : 'Verkocht'}</option></select></label>
  <label>Plaats<select name="plaats"><option value="">Alle plaatsen</option>${cities.map(([slug, c]) => `<option value="${esc(slug)}">${esc(c.name)} (${c.n})</option>`).join('')}</select></label>
  <label>Min. prijs<select name="min"><option value="">Geen</option>${prices.map((p) => `<option value="${p}">${euro(p)}</option>`).join('')}</select></label>
  <label>Max. prijs<select name="max"><option value="">Geen</option>${prices.map((p) => `<option value="${p}">${euro(p)}</option>`).join('')}</select></label>
  <label>Kamers<select name="kamers"><option value="">Alle</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option></select></label>
  ${rent ? '<label>Oplevering<select name="oplevering"><option value="">Alle</option><option value="gemeubileerd">Gemeubileerd</option><option value="gestoffeerd">Gestoffeerd</option><option value="kaal">Kaal</option></select></label>' : ''}
  <p class="fcount" aria-live="polite"></p>
</form>`;
}

export function allPage(ctx, { active, closed }) {
  const rent = ctx.site.kind === 'rent';
  const own = active.filter(isOwn), others = active.filter((l) => !isOwn(l));
  const closedSorted = [...closed].sort((a, b) => isOwn(b) - isOwn(a) || (isOwn(a) ? (b.closedOn || '').localeCompare(a.closedOn || '') : (b.price || 0) - (a.price || 0)));
  const h1 = rent ? 'Al het huuraanbod van Koops Makelaardij' : 'Al het koopaanbod van Koops Makelaardij';
  const lead = rent
    ? 'Alle woningen die nu te huur zijn, plus de woningen die we onlangs hebben verhuurd.'
    : 'Alle woningen die nu te koop zijn, plus de woningen die we onlangs hebben verkocht.';
  const path = paths.all();
  const crumbs = [[rent ? 'Huuraanbod' : 'Koopaanbod', '/'], ['Alle woningen', path]];
  const nowLabel = rent ? 'Te huur' : 'Te koop', doneLabel = rent ? 'Verhuurd' : 'Verkocht';
  const body = `
${breadcrumbs(crumbs)}
<section class="hero">
  <h1>${esc(h1)}</h1>
  <p class="lead">${esc(lead)}</p>
  <dl class="stats">
    <div><dt>${nowLabel}</dt><dd>${active.length}</dd></div>
    <div><dt>${doneLabel} (recent)</dt><dd>${closed.length}</dd></div>
    <div><dt>Google-beoordeling</dt><dd>★ ${esc(ctx.site.rating)}</dd></div>
    ${ctx.avgDays ? `<div><dt>Gemiddeld verhuurd in</dt><dd>${ctx.avgDays} dagen</dd></div>` : ''}
  </dl>
</section>
${filterBar(ctx, [...active, ...closed])}
<section class="sec" id="nu">
  <div class="sec-head"><h2>${nowLabel} via Koops Makelaardij Haarlem</h2></div>
  ${own.length ? grid(own, ctx) : `<p class="empty">${rent ? 'Op dit moment is al ons huuraanbod in Haarlem en omgeving verhuurd.' : 'Op dit moment hebben we in Haarlem en omgeving geen woningen te koop.'} Hieronder zie je het aanbod van onze andere vestigingen.</p>`}
</section>
${others.length ? `<section class="sec">
  <div class="sec-head"><h2>${nowLabel} bij onze andere vestigingen</h2></div>
  <p class="small">Aanbod van Koops Makelaardij in Amsterdam, Amstelveen en Leiden. Voor deze woningen helpt de betreffende vestiging je verder.</p>
  ${grid(others, ctx)}
</section>` : ''}
${closed.length ? `<section class="sec" id="${rent ? 'verhuurd' : 'verkocht'}">
  <div class="sec-head"><h2>Recent ${doneLabel.toLowerCase()} door Koops Makelaardij</h2><a href="${paths.archive(ctx.site.kind)}">Per jaar bekijken →</a></div>
  <p class="small">${rent ? 'Woningen die wij onlangs hebben verhuurd, in Haarlem en via onze andere vestigingen.' : 'Woningen die wij onlangs hebben verkocht, in Haarlem en via onze andere vestigingen.'}</p>
  ${grid(closedSorted, ctx)}
</section>` : ''}
<p class="empty fnone" hidden>Geen woningen gevonden met deze filters. Pas de filters aan, of laat je mailen zodra er een passende woning bij komt.</p>
${ctx.formEndpoint ? alertBox(ctx, 'nl') : ''}
${ownerCta(ctx, 'nl')}`;
  return layout(ctx, {
    title: `${rent ? 'Alle huurwoningen' : 'Alle koopwoningen'} Haarlem e.o. | Koops Makelaardij`,
    description: `${active.length} woningen ${rent ? 'te huur' : 'te koop'} en ${closed.length} recent ${doneLabel.toLowerCase()} door Koops Makelaardij in Haarlem, Amsterdam, Amstelveen en Leiden.`,
    path,
    ld: [breadcrumbLd(ctx, crumbs), { '@type': 'ItemList', name: h1, numberOfItems: active.length, itemListElement: active.map((l, i) => ({ '@type': 'ListItem', position: i + 1, url: ctx.base + paths.detail(l), name: `${l.street}, ${l.city}` })) }],
    body,
    ogImage: active[0] && ctx.imgs.get(active[0].id)?.[0]?.large,
  });
}

export function notFoundPage(ctx) {
  return layout(ctx, {
    title: 'Pagina niet gevonden | Koops Makelaardij', description: 'Deze pagina bestaat niet (meer).', path: '/404.html', robots: 'noindex',
    body: `<section class="hero"><h1>Deze pagina bestaat niet (meer)</h1><p class="lead">Misschien is de woning al ${ctx.site.kind === 'rent' ? 'verhuurd' : 'verkocht'}. <a href="/">Bekijk het actuele aanbod</a>.</p></section>`,
  });
}
