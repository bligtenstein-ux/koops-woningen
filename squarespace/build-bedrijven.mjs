// Bouwt de codeblok-HTML voor de bedrijvenpagina's op verhuurmetkoops.nl (NL en EN).
import { writeFileSync, readFileSync } from 'node:fs';
const cfg = JSON.parse(readFileSync(new URL('../config/sites.json', import.meta.url)));
const EP = cfg.forms.endpoint || 'ENDPOINT';
const css = `<style>
.kb,.kb *{box-sizing:border-box}.kb{font-family:inherit;color:#000;line-height:1.6;max-width:1080px;margin:0 auto}
.kb h1{font-weight:800;font-size:clamp(32px,5vw,54px);line-height:1.08;margin:0 0 18px;color:#000}
.kb h2{font-weight:800;color:#FF7701;font-size:clamp(26px,3.6vw,40px);line-height:1.12;margin:0 0 16px}
.kb h3{font-weight:800;font-size:20px;margin:0 0 6px;color:#000}
.kb p{margin:0 0 14px;font-size:17px}.kb a{color:#FF7701;font-weight:700}
.kb-sec{padding:40px 0}.kb-lead{font-size:19px;max-width:800px}
.kb-answer{background:#000;color:#fff;padding:34px 36px}.kb-answer p{color:#fff;font-size:19px;margin:0}.kb-answer b{color:#FF7701}
.kb-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}
.kb-card{border-top:3px solid #FF7701;padding-top:16px}
.kb-steps{counter-reset:s;list-style:none;padding:0;margin:0}.kb-steps li{counter-increment:s;position:relative;padding:0 0 14px 52px;font-size:17px;min-height:40px}
.kb-steps li::before{content:counter(s);position:absolute;left:0;top:-2px;width:36px;height:36px;background:#FF7701;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center}
.kb-faq details{border-bottom:1px solid #E2E2E2;padding:16px 0}.kb-faq summary{cursor:pointer;font-weight:700;font-size:18px;list-style:none;position:relative;padding-right:30px}
.kb-faq summary::-webkit-details-marker{display:none}.kb-faq summary::after{content:"+";position:absolute;right:0;top:-4px;font-size:26px;font-weight:700;color:#FF7701}
.kb-faq details[open] summary::after{content:"–"}.kb-faq details p{margin:10px 0 0;font-size:16px}
.kb-form{background:#F5F5F5;padding:36px}
.kb-form form{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}
.kb-form label{display:flex;flex-direction:column;gap:4px;font-size:14px;font-weight:700}
.kb-form .full{grid-column:1/-1}
.kb-form input,.kb-form select,.kb-form textarea{font:inherit;font-weight:400;padding:12px;border:1px solid #bdbdbd;border-radius:0;background:#fff;width:100%}
.kb-form .hp{position:absolute;left:-9999px}
.kb-btn{display:inline-block;background:#FF7701;color:#fff!important;border:0;padding:16px 26px;font:inherit;font-weight:800;text-transform:uppercase;letter-spacing:.04em;font-size:14px;cursor:pointer;text-decoration:none}
.kb-msg{grid-column:1/-1;font-weight:700;margin:0}
@media(max-width:767px){.kb-grid,.kb-form form{grid-template-columns:1fr}.kb-answer,.kb-form{padding:24px 20px}}
</style>`;

const T = {
  nl: {
    h1: 'Huisvesting voor je medewerkers in Haarlem en omgeving',
    lead: 'Haal je medewerkers naar Nederland en zoek je een goede huurwoning voor ze? Koops Makelaardij helpt werkgevers, HR-teams en relocationbureaus aan passende woningen in Haarlem, Heemstede, Bloemendaal, Hoofddorp en de regio Amsterdam.',
    answer: 'Je geeft ons één keer de woonwensen en het budget door. <b>Wij zoeken in ons eigen aanbod en bij onze verhuurders</b>, plannen de bezichtigingen en regelen het huurcontract en de sleuteloverdracht, in het Nederlands of Engels.',
    whyH: 'Waarom bedrijven met Koops werken',
    why: [
      ['Direct toegang tot aanbod', 'Wij verhuren zelf woningen in Haarlem en omgeving, en via onze vestigingen in Amsterdam, Amstelveen en Leiden. Nieuwe woningen zien jullie vaak al voordat ze breed online staan.'],
      ['Eén aanspreekpunt', 'Eén vaste contactpersoon voor HR, de medewerker en eventueel het relocationbureau. Alle communicatie ook in het Engels.'],
      ['Gemeubileerd of gestoffeerd', 'Veel van onze huurwoningen zijn gemeubileerd of gestoffeerd, zodat een medewerker direct kan wonen.'],
      ['Volgens de regels', 'Huurcontracten volgens het Nederlandse huurrecht, met een digitaal inspectierapport bij de sleuteloverdracht. Zo weet iedereen waar hij aan toe is.'],
    ],
    stepsH: 'Zo werkt het',
    steps: ['Je stuurt de aanvraag: aantal medewerkers, startdatum, budget en voorkeursplaatsen.', 'We bellen binnen één werkdag om de wensen door te nemen.', 'Je krijgt passende woningen uit ons aanbod en netwerk voorgesteld.', 'Bezichtigingen met de medewerker, op locatie of via video.', 'Huurcontract (op naam van de medewerker of, in overleg met de verhuurder, van het bedrijf).', 'Sleuteloverdracht met inspectierapport en uitleg over de woning.'],
    formH: 'Vraag huisvesting aan voor je medewerkers',
    formP: 'Vul het formulier in, dan nemen we binnen één werkdag contact met je op. Liever bellen? 023 532 9817.',
    f: { company: 'Bedrijf', name: 'Naam', email: 'E-mail', phone: 'Telefoon', count: 'Aantal medewerkers', from: 'Per wanneer', budget: 'Budget per woning per maand', cities: 'Voorkeursplaats(en)', msg: 'Toelichting (gezinssituatie, gemeubileerd, looptijd)', send: 'Aanvraag versturen', ok: 'Bedankt! We hebben je aanvraag ontvangen en nemen binnen één werkdag contact op.', err: 'Versturen is niet gelukt. Bel 023 532 9817 of mail haarlem@koopsmakelaardij.nl.', req: 'Vul de verplichte velden in.' },
    faqH: 'Veelgestelde vragen',
    faq: [
      ['Wat kost het voor ons als werkgever?', 'Voor woningen die wij namens een verhuurder aanbieden, betalen huurder en werkgever geen bemiddelingskosten. Zoek je hulp buiten ons aanbod, dan bespreken we vooraf de mogelijkheden.'],
      ['Kan het huurcontract op naam van ons bedrijf?', 'Dat kan in overleg met de verhuurder. Vaak staat het contract op naam van de medewerker en betaalt de werkgever de huur of een deel ervan.'],
      ['Hebben jullie gemeubileerde woningen?', 'Ja, een groot deel van ons huuraanbod is gemeubileerd of gestoffeerd. Geef in de aanvraag aan wat je medewerker nodig heeft.'],
      ['Werken jullie samen met relocationbureaus?', 'Ja. We stemmen bezichtigingen en het contract graag af met jullie relocationbureau, zodat de medewerker één soepel traject heeft.'],
      ['In welke plaatsen zoeken jullie?', 'Vooral Haarlem, Heemstede, Bloemendaal, Zandvoort, Hoofddorp en omgeving. Via onze vestigingen ook Amsterdam, Amstelveen en Leiden.'],
    ],
    links: 'Bekijk ook <a href="https://woningen.verhuurmetkoops.nl/aanbod/">ons actuele huuraanbod</a> of lees over <a href="/nl/verhuren-aan-expats">verhuren aan expats</a>.',
    lang: 'nl', list: 'https://woningen.verhuurmetkoops.nl/aanbod/',
  },
  en: {
    h1: 'Housing for your employees in Haarlem and the surrounding area',
    lead: 'Relocating employees to the Netherlands and looking for a good rental home for them? Koops Makelaardij helps employers, HR teams and relocation agencies find suitable homes in Haarlem, Heemstede, Bloemendaal, Hoofddorp and the Amsterdam region.',
    answer: 'You tell us the housing needs and budget once. <b>We search our own listings and our network of landlords</b>, arrange the viewings and take care of the rental agreement and key handover, in English or Dutch.',
    whyH: 'Why companies work with Koops',
    why: [
      ['Direct access to homes', 'We let homes in Haarlem and the surrounding area ourselves, and through our offices in Amsterdam, Amstelveen and Leiden. You often see new homes before they are widely advertised.'],
      ['One point of contact', 'One dedicated contact person for HR, the employee and the relocation agency, if you work with one. All communication in English.'],
      ['Furnished or upholstered', 'Many of our rental homes are furnished or upholstered, so your employee can move in right away.'],
      ['By the book', 'Rental agreements under Dutch tenancy law, with a digital inspection report at key handover, so everyone knows where they stand.'],
    ],
    stepsH: 'How it works',
    steps: ['Send us your request: number of employees, start date, budget and preferred locations.', 'We call you within one working day to discuss the requirements.', 'We propose suitable homes from our listings and network.', 'Viewings with the employee, in person or by video.', 'Rental agreement in the employee’s name or, if the landlord agrees, in the company’s name.', 'Key handover with an inspection report and a walk-through of the home.'],
    formH: 'Request housing for your employees',
    formP: 'Fill in the form and we will contact you within one working day. Prefer to call? +31 23 532 9817.',
    f: { company: 'Company', name: 'Name', email: 'Email', phone: 'Phone', count: 'Number of employees', from: 'Starting from', budget: 'Budget per home per month', cities: 'Preferred location(s)', msg: 'Details (household, furnished, length of stay)', send: 'Send request', ok: 'Thank you! We have received your request and will contact you within one working day.', err: 'Sending failed. Please call +31 23 532 9817 or email haarlem@koopsmakelaardij.nl.', req: 'Please fill in the required fields.' },
    faqH: 'Frequently asked questions',
    faq: [
      ['What does it cost us as an employer?', 'For homes we offer on behalf of a landlord, neither the tenant nor the employer pays agency fees. If you need help beyond our listings, we will discuss the options with you first.'],
      ['Can the rental agreement be in our company’s name?', 'That is possible if the landlord agrees. Often the agreement is in the employee’s name and the employer pays all or part of the rent.'],
      ['Do you have furnished homes?', 'Yes, a large part of our rental listings is furnished or upholstered. Let us know in your request what your employee needs.'],
      ['Do you work with relocation agencies?', 'Yes. We are happy to coordinate viewings and the contract with your relocation agency, so your employee has one smooth process.'],
      ['Which areas do you cover?', 'Mainly Haarlem, Heemstede, Bloemendaal, Zandvoort, Hoofddorp and the surrounding area, and through our other offices also Amsterdam, Amstelveen and Leiden.'],
    ],
    links: 'Also see <a href="https://woningen.verhuurmetkoops.nl/en/">our current rental listings</a>.',
    lang: 'en', list: 'https://woningen.verhuurmetkoops.nl/en/',
  },
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
for (const k of ['nl', 'en']) {
  const t = T[k], f = t.f;
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const html = `${css}
<div class="kb" lang="${k}">
<section class="kb-sec"><h1>${esc(t.h1)}</h1><p class="kb-lead">${esc(t.lead)}</p><div class="kb-answer"><p>${t.answer}</p></div>
<p style="margin-top:22px"><a class="kb-btn" href="#aanvraag">${esc(t.formH)}</a></p></section>
<section class="kb-sec"><h2>${esc(t.whyH)}</h2><div class="kb-grid">${t.why.map(([h, p]) => `<div class="kb-card"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div></section>
<section class="kb-sec"><h2>${esc(t.stepsH)}</h2><ol class="kb-steps">${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>
<section class="kb-sec" id="aanvraag"><div class="kb-form"><h2>${esc(t.formH)}</h2><p>${esc(t.formP)}</p>
<form id="kb-form" novalidate>
<div class="hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>
<label>${f.company} *<input name="company" required autocomplete="organization"></label>
<label>${f.name} *<input name="name" required autocomplete="name"></label>
<label>${f.email} *<input name="email" type="email" required autocomplete="email"></label>
<label>${f.phone} *<input name="phone" type="tel" required autocomplete="tel"></label>
<label>${f.count}<select name="count"><option>1</option><option>2-5</option><option>6-10</option><option>10+</option></select></label>
<label>${f.from}<input name="from" type="month"></label>
<label>${f.budget}<select name="budget"><option value="">–</option><option>&lt; € 2.000</option><option>€ 2.000 – 3.000</option><option>€ 3.000 – 4.000</option><option>€ 4.000 – 5.000</option><option>&gt; € 5.000</option></select></label>
<label>${f.cities}<input name="cities" placeholder="Haarlem, Heemstede, Amsterdam…"></label>
<label class="full">${f.msg}<textarea name="message" rows="4"></textarea></label>
<div class="full"><button class="kb-btn" type="submit">${f.send}</button></div>
<p class="kb-msg" id="kb-msg" role="status" aria-live="polite"></p>
</form></div></section>
<section class="kb-sec kb-faq"><h2>${esc(t.faqH)}</h2>${t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}<p style="margin-top:22px">${t.links}</p></section>
</div>
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>
<script>
(function(){var f=document.getElementById('kb-form'),m=document.getElementById('kb-msg'),t0=Date.now();if(!f)return;
f.addEventListener('submit',function(e){e.preventDefault();var ok=true;[].forEach.call(f.querySelectorAll('[required]'),function(i){var b=!i.value.trim();i.style.borderColor=b?'#c62828':'';if(b)ok=false});
if(!ok){m.style.color='#c62828';m.textContent=${JSON.stringify(f.req)};return}
var d={type:'bedrijf',lang:'${k}',t:t0,page:location.href};new FormData(f).forEach(function(v,k){d[k]=v});
var btn=f.querySelector('button');btn.disabled=true;m.style.color='';m.textContent='…';
fetch(${JSON.stringify(EP)},{method:'POST',body:JSON.stringify(d)}).then(function(r){return r.json()}).then(function(r){if(!r.ok)throw 0;m.style.color='#1b5e20';m.textContent=${JSON.stringify(f.ok)};f.reset();try{(window.dataLayer=window.dataLayer||[]).push({event:'koops_bedrijf_aanvraag'})}catch(x){}})
.catch(function(){m.style.color='#c62828';m.textContent=${JSON.stringify(f.err)}}).finally(function(){btn.disabled=false})});})();
</script>`;
  writeFileSync(new URL(`./bedrijven-${k}.html`, import.meta.url), html);
  console.log(k, html.length);
}
