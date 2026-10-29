/**
 * Koops woningsites – formulieren, inschrijvingen en aanbod-alerts.
 * Draait als web-app onder Bart-Jan@koopsmakelaardijhaarlem.nl.
 * Alle gegevens staan in de Google Sheet "Koops woningsites – formulieren" in diens Drive.
 *
 * Eenmalig: functie setup() uitvoeren (maakt de Sheet + trigger elk half uur),
 * daarna Implementeren → Nieuwe implementatie → Web-app (uitvoeren als: ik, toegang: iedereen).
 */

var TO = 'haarlem@koopsmakelaardij.nl';
var FROM_NAME = 'Koops Makelaardij Haarlem';
var SITES = {
  rent: { feed: 'https://woningen.verhuurmetkoops.nl/latest.json', base: 'https://woningen.verhuurmetkoops.nl', main: 'https://www.verhuurmetkoops.nl', nl: 'huur', en: 'rent' },
  sale: { feed: 'https://woningen.verkoopmetkoops.nl/latest.json', base: 'https://woningen.verkoopmetkoops.nl', main: 'https://www.verkoopmetkoops.nl', nl: 'koop', en: 'sale' }
};
var SHEETS = {
  Reacties: ['Ontvangen', 'Site', 'Taal', 'Woning', 'Plaats', 'Vestiging', 'Link', 'Naam', 'E-mail', 'Telefoon', 'Ingangsdatum', 'Bewoners', 'Bericht'],
  Bedrijven: ['Ontvangen', 'Taal', 'Bedrijf', 'Naam', 'E-mail', 'Telefoon', 'Aantal medewerkers', 'Per wanneer', 'Budget p/m', 'Plaats(en)', 'Bericht'],
  Inschrijvingen: ['Id', 'Aangemeld', 'Site', 'Taal', 'E-mail', 'Naam', 'Plaatsen', 'Max. prijs', 'Min. kamers', 'Oplevering', 'Status', 'Token', 'Bevestigd', 'Laatste mail', 'Aantal mails'],
  Gezien: ['Site', 'Woning-id', 'Eerst gezien']
};

/* ---------- eenmalige installatie ---------- */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.create('Koops woningsites – formulieren');
  props.setProperty('SHEET_ID', ss.getId());
  Object.keys(SHEETS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) { sh.appendRow(SHEETS[name]); sh.setFrozenRows(1); sh.getRange(1, 1, 1, SHEETS[name].length).setFontWeight('bold'); }
  });
  var def = ss.getSheetByName('Sheet1') || ss.getSheetByName('Blad1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'checkNewListings') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('checkNewListings').timeBased().everyMinutes(30).create();
  checkNewListings(); // eerste keer: alleen huidig aanbod als "gezien" markeren
  Logger.log('Sheet: ' + ss.getUrl());
}

function sheet_(name) { return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID')).getSheetByName(name); }

/* ---------- formulieren ---------- */
function doPost(e) {
  var out = function (o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); };
  try {
    var d = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (d.website) return out({ ok: true }); // honeypot: bots vullen dit verborgen veld in
    if (d.t && Date.now() - Number(d.t) < 3000) return out({ ok: true }); // te snel ingevuld = bot
    var email = clean_(d.email, 120).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return out({ ok: false, error: 'email' });
    var cache = CacheService.getScriptCache(), key = 'n_' + Utilities.base64EncodeWebSafe(email).slice(0, 200);
    var n = Number(cache.get(key) || 0);
    if (n >= 6) return out({ ok: false, error: 'rate' });
    cache.put(key, String(n + 1), 900);
    var lang = d.lang === 'en' ? 'en' : 'nl';
    if (d.type === 'reactie') return out(reactie_(d, email, lang));
    if (d.type === 'bedrijf') return out(bedrijf_(d, email, lang));
    if (d.type === 'inschrijving') return out(inschrijving_(d, email, lang));
    return out({ ok: false, error: 'type' });
  } catch (err) {
    console.error(err);
    return out({ ok: false, error: 'server' });
  }
}

function reactie_(d, email, lang) {
  var site = SITES[d.site] ? d.site : 'rent';
  var row = [new Date(), SITES[site].nl, lang, clean_(d.street, 120), clean_(d.city, 80), clean_(d.office, 80), clean_(d.url, 300),
    clean_(d.name, 120), email, clean_(d.phone, 40), clean_(d.from, 40), clean_(d.people, 40), clean_(d.message, 3000)];
  sheet_('Reacties').appendRow(row.map(safeCell_));
  var subject = 'Reactie ' + (site === 'rent' ? 'huurwoning' : 'koopwoning') + ': ' + row[3] + ', ' + row[4] + ' – ' + row[7] + (row[5] && row[5] !== 'Haarlem' ? ' [' + row[5] + ']' : '');
  var html = table_([['Woning', row[3] + ', ' + row[4]], ['Vestiging', row[5]], ['Link', row[6]], ['Naam', row[7]], ['E-mail', email], ['Telefoon', row[9]],
    ['Gewenste ingangsdatum', row[10]], [site === 'rent' ? 'Aantal bewoners' : 'Wens', row[11]], ['Bericht', row[12]], ['Taal', lang === 'en' ? 'Engels' : 'Nederlands']]);
  MailApp.sendEmail({ to: TO, replyTo: email, name: FROM_NAME, subject: subject, htmlBody: '<p>Nieuwe reactie via ' + SITES[site].base + ':</p>' + html + '<p style="color:#777">Beantwoorden gaat direct naar de klant.</p>' });
  var greet = lang === 'en'
    ? '<p>Dear ' + esc_(row[7] || 'Sir/Madam') + ',</p><p>Thank you for your interest in <strong>' + esc_(row[3] + ', ' + row[4]) + '</strong>. We have received your message and will get back to you as soon as possible, usually within one working day.</p><p>Kind regards,<br>Koops Makelaardij Haarlem<br>+31 23 532 9817</p>'
    : '<p>Beste ' + esc_(row[7] || 'heer/mevrouw') + ',</p><p>Bedankt voor je interesse in <strong>' + esc_(row[3] + ', ' + row[4]) + '</strong>. We hebben je reactie ontvangen en nemen zo snel mogelijk contact met je op, meestal binnen één werkdag.</p><p>Met vriendelijke groet,<br>Koops Makelaardij Haarlem<br>023 532 9817</p>';
  MailApp.sendEmail({ to: email, replyTo: TO, name: FROM_NAME, subject: lang === 'en' ? 'We received your response – ' + row[3] : 'Je reactie is ontvangen – ' + row[3], htmlBody: greet });
  return { ok: true };
}

function bedrijf_(d, email, lang) {
  var row = [new Date(), lang, clean_(d.company, 120), clean_(d.name, 120), email, clean_(d.phone, 40), clean_(d.count, 40), clean_(d.from, 40), clean_(d.budget, 40), clean_(d.cities, 200), clean_(d.message, 3000)];
  sheet_('Bedrijven').appendRow(row.map(safeCell_));
  MailApp.sendEmail({ to: TO, replyTo: email, name: FROM_NAME, subject: 'Huisvesting medewerkers: ' + row[2] + ' – ' + row[3],
    htmlBody: '<p>Nieuwe aanvraag van een bedrijf via verhuurmetkoops.nl:</p>' + table_([['Bedrijf', row[2]], ['Naam', row[3]], ['E-mail', email], ['Telefoon', row[5]], ['Aantal medewerkers', row[6]], ['Per wanneer', row[7]], ['Budget p/m', row[8]], ['Plaats(en)', row[9]], ['Bericht', row[10]], ['Taal', lang === 'en' ? 'Engels' : 'Nederlands']]) });
  MailApp.sendEmail({ to: email, replyTo: TO, name: FROM_NAME,
    subject: lang === 'en' ? 'Your housing request – Koops Makelaardij' : 'Je aanvraag voor huisvesting – Koops Makelaardij',
    htmlBody: lang === 'en'
      ? '<p>Dear ' + esc_(row[3]) + ',</p><p>Thank you for your request. We will contact you within one working day to discuss the housing needs of your employees.</p><p>Kind regards,<br>Koops Makelaardij Haarlem<br>+31 23 532 9817</p>'
      : '<p>Beste ' + esc_(row[3]) + ',</p><p>Bedankt voor je aanvraag. We nemen binnen één werkdag contact met je op om de woonwensen van jullie medewerkers te bespreken.</p><p>Met vriendelijke groet,<br>Koops Makelaardij Haarlem<br>023 532 9817</p>' });
  return { ok: true };
}

function inschrijving_(d, email, lang) {
  var site = SITES[d.site] ? d.site : 'rent';
  var sh = sheet_('Inschrijvingen'), data = sh.getDataRange().getValues();
  var cities = [].concat(d.cities || []).map(function (c) { return clean_(c, 60); }).filter(String).join(', ');
  var token = Utilities.getUuid().replace(/-/g, '');
  var values = [clean_(d.name, 120), cities, Number(d.maxPrice) || '', Number(d.minRooms) || '', clean_(d.furnishing, 30)];
  var rowIdx = -1;
  for (var i = 1; i < data.length; i++) if (data[i][4] === email && data[i][2] === SITES[site].nl && data[i][10] !== 'afgemeld') rowIdx = i + 1;
  if (rowIdx > 0) {
    sh.getRange(rowIdx, 6, 1, 5).setValues([values.map(safeCell_)]);
    token = sh.getRange(rowIdx, 12).getValue();
    if (sh.getRange(rowIdx, 11).getValue() === 'actief') {
      MailApp.sendEmail({ to: email, name: FROM_NAME, subject: lang === 'en' ? 'Your search alert has been updated' : 'Je zoekopdracht is bijgewerkt', htmlBody: lang === 'en' ? '<p>Your search alert has been updated. <a href="' + link_('unsub', token) + '">Unsubscribe</a></p>' : '<p>Je zoekopdracht is bijgewerkt. <a href="' + link_('unsub', token) + '">Afmelden</a></p>' });
      return { ok: true, status: 'updated' };
    }
  } else {
    sh.appendRow([Utilities.getUuid().slice(0, 8), new Date(), SITES[site].nl, lang, email].concat(values.map(safeCell_), ['wacht op bevestiging', token, '', '', 0]));
  }
  var what = site === 'rent' ? (lang === 'en' ? 'rental homes' : 'huurwoningen') : (lang === 'en' ? 'homes for sale' : 'koopwoningen');
  MailApp.sendEmail({ to: email, name: FROM_NAME,
    subject: lang === 'en' ? 'Please confirm your search alert' : 'Bevestig je zoekopdracht',
    htmlBody: lang === 'en'
      ? '<p>You asked to receive new ' + what + ' from Koops Makelaardij by email' + (cities ? ' in ' + esc_(cities) : '') + '.</p><p><a href="' + link_('confirm', token) + '" style="background:#FF7701;color:#fff;padding:12px 18px;text-decoration:none;font-weight:bold">Confirm</a></p><p style="color:#777">Did not request this? Then simply ignore this email.</p>'
      : '<p>Je hebt gevraagd om nieuwe ' + what + ' van Koops Makelaardij per e-mail te ontvangen' + (cities ? ' in ' + esc_(cities) : '') + '.</p><p><a href="' + link_('confirm', token) + '" style="background:#FF7701;color:#fff;padding:12px 18px;text-decoration:none;font-weight:bold">Bevestigen</a></p><p style="color:#777">Niet aangevraagd? Dan kun je deze mail negeren.</p>' });
  return { ok: true, status: 'confirm' };
}

/* ---------- bevestigen / afmelden ---------- */
function doGet(e) {
  var a = e.parameter.a, t = e.parameter.t;
  var sh = sheet_('Inschrijvingen'), data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (t && data[i][11] === t) {
      var en = data[i][3] === 'en', site = data[i][2] === 'koop' ? 'sale' : 'rent';
      if (a === 'confirm') { sh.getRange(i + 1, 11).setValue('actief'); if (!data[i][12]) sh.getRange(i + 1, 13).setValue(new Date());
        return page_(en ? 'Thank you, your search alert is active' : 'Bedankt, je zoekopdracht staat aan', en ? 'You will receive an email as soon as a matching home comes online.' : 'Je krijgt een mail zodra er een passende woning online komt.', SITES[site].base + (en ? '/en/' : '/'), en); }
      if (a === 'unsub') { sh.getRange(i + 1, 11).setValue('afgemeld');
        return page_(en ? 'You have been unsubscribed' : 'Je bent afgemeld', en ? 'You will no longer receive emails about new listings.' : 'Je ontvangt geen mails meer over nieuw aanbod.', SITES[site].base + (en ? '/en/' : '/'), en); }
    }
  }
  return page_('Link niet (meer) geldig', 'Deze link is niet geldig. Neem gerust contact met ons op: 023 532 9817.', 'https://woningen.verhuurmetkoops.nl/', false);
}

function page_(title, text, back, en) {
  return HtmlService.createHtmlOutput('<div style="font-family:Montserrat,Arial,sans-serif;max-width:560px;margin:60px auto;padding:0 16px"><h1 style="font-size:26px">' + esc_(title) + '</h1><p>' + esc_(text) + '</p><p><a style="background:#FF7701;color:#fff;padding:12px 18px;text-decoration:none;font-weight:bold" href="' + back + '" target="_top">' + (en ? 'View current listings' : 'Bekijk het actuele aanbod') + '</a></p></div>').setTitle(title);
}

/* ---------- nieuw aanbod: elk half uur ---------- */
function checkNewListings() {
  var seenSh = sheet_('Gezien'), seenRows = seenSh.getDataRange().getValues(), seen = {};
  for (var i = 1; i < seenRows.length; i++) seen[seenRows[i][0] + ':' + seenRows[i][1]] = true;
  var subsSh = sheet_('Inschrijvingen'), subs = subsSh.getDataRange().getValues();
  Object.keys(SITES).forEach(function (site) {
    var S = SITES[site], feed;
    try { feed = JSON.parse(UrlFetchApp.fetch(S.feed, { muteHttpExceptions: true }).getContentText()); } catch (err) { console.error(err); return; }
    var items = (feed.items || []).filter(function (it) { return it.id; });
    var firstRun = !seenRows.some(function (r) { return r[0] === S.nl; });
    var fresh = items.filter(function (it) { return !seen[S.nl + ':' + it.id]; });
    fresh.forEach(function (it) { seenSh.appendRow([S.nl, String(it.id), new Date()]); });
    if (firstRun || !fresh.length) return;
    var available = fresh.filter(function (it) { return it.status === 'nieuw' || it.status === 'beschikbaar'; });
    for (var r = 1; r < subs.length; r++) {
      var s = subs[r];
      if (s[2] !== S.nl || s[10] !== 'actief') continue;
      var cities = String(s[6] || '').toLowerCase().split(/\s*,\s*/).filter(String);
      var match = available.filter(function (it) {
        if (cities.length && cities.indexOf(String(it.city).toLowerCase()) < 0) return false;
        if (s[7] && it.priceNum && it.priceNum > Number(s[7])) return false;
        if (s[8] && it.rooms && it.rooms < Number(s[8])) return false;
        if (s[9] && it.furnishing && String(s[9]).toLowerCase() !== String(it.furnishing).toLowerCase()) return false;
        return true;
      });
      if (!match.length) continue;
      sendAlert_(s, S, match);
      subsSh.getRange(r + 1, 14, 1, 2).setValues([[new Date(), Number(s[14] || 0) + 1]]);
    }
  });
}

function sendAlert_(s, S, items) {
  var en = s[3] === 'en';
  var cards = items.map(function (it) {
    var url = S.base + (en && it.urlEn ? it.urlEn : it.url) + '?utm_source=alert&utm_medium=email&utm_campaign=nieuw-aanbod';
    var img = it.img ? (it.img.indexOf('http') === 0 ? it.img : S.base + it.img) : '';
    return '<tr><td style="padding:0 0 22px"><a href="' + url + '" style="color:#111;text-decoration:none">' + (img ? '<img src="' + img + '" width="520" style="width:100%;max-width:520px;display:block" alt="">' : '') +
      '<p style="margin:8px 0 0;font-size:18px;font-weight:bold">' + esc_(it.street) + ', ' + esc_(it.city) + '</p><p style="margin:2px 0 0">' + esc_(it.price) + (it.meta ? ' · ' + esc_(it.meta) : '') + '</p></a></td></tr>';
  }).join('');
  var n = items.length;
  var subject = en ? (n === 1 ? 'New: ' + items[0].street + ', ' + items[0].city : n + ' new homes from Koops Makelaardij') : (n === 1 ? 'Nieuw: ' + items[0].street + ', ' + items[0].city : n + ' nieuwe woningen bij Koops Makelaardij');
  MailApp.sendEmail({ to: s[4], replyTo: TO, name: FROM_NAME, subject: subject,
    htmlBody: '<div style="font-family:Montserrat,Arial,sans-serif;max-width:520px">' + '<p>' + (en ? 'New listing matching your search:' : 'Nieuw aanbod dat past bij je zoekopdracht:') + '</p><table cellpadding="0" cellspacing="0" style="width:100%">' + cards + '</table>' +
      '<p style="color:#777;font-size:13px">' + (en ? 'You receive this email because you signed up at ' : 'Je ontvangt deze mail omdat je je hebt aangemeld op ') + S.base.replace('https://', '') + '. <a href="' + link_('unsub', s[11]) + '">' + (en ? 'Unsubscribe' : 'Afmelden') + '</a></p></div>' });
}

/* ---------- hulpjes ---------- */
function link_(a, t) { return ScriptApp.getService().getUrl() + '?a=' + a + '&t=' + t; }
function clean_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B-\u001F]/g, '').trim().slice(0, max); }
function safeCell_(v) { return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v; } // geen formules via formulieren
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function table_(rows) {
  return '<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' + rows.filter(function (r) { return r[1]; }).map(function (r) {
    var v = /^https?:\/\//.test(r[1]) ? '<a href="' + esc_(r[1]) + '">' + esc_(r[1]) + '</a>' : esc_(r[1]).replace(/\n/g, '<br>');
    return '<tr><th align="left" style="border-bottom:1px solid #eee;color:#555;vertical-align:top">' + esc_(r[0]) + '</th><td style="border-bottom:1px solid #eee">' + v + '</td></tr>';
  }).join('') + '</table>';
}
