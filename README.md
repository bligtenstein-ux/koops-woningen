# Koops woningaanbod

Zet het aanbod van Koops Makelaardij Haarlem automatisch op eigen pagina's:

- **woningen.verhuurmetkoops.nl**: huuraanbod (NL + EN), nieuwste bovenaan
- **woningen.verkoopmetkoops.nl**: koopaanbod

Elke ochtend haalt GitHub Actions het aanbod van de vestiging Haarlem op van koopsmakelaardij.nl (dat zelf via Kolibri/SiteLink wordt gevuld; SiteLink wordt dus niet extra belast) en bouwt een statische site.

## Wat er gemaakt wordt

| Pagina | Doel |
|---|---|
| `/` | Actueel aanbod, nieuwste bovenaan, plus "Recent verhuurd/verkocht" |
| `/woning/<plaats>/<straat>-<id>/` | Woningpagina met foto's, kenmerken, omschrijving, knop "Reageer" (naar koopsmakelaardij.nl) |
| `/en/…` | Engelse versies van huurwoningen met een eigen Engelse tekst (hreflang) |
| `/plaats/<plaats>/` | Per plaats: aanbod, verhuurde/verkochte woningen en middelste huurprijs/vraagprijs (vanaf 3 woningen) |
| `/verhuurd/` of `/verkocht/` | Archief per jaar |
| `sitemap.xml`, `robots.txt`, `llms.txt` | Vindbaarheid voor Google en AI-zoekmachines |
| `widget.js`, `latest.json` | Blok "Nieuw aanbod" voor de Squarespace-sites |

Gestructureerde data: `RealEstateListing` met `Offer` en woningtype, gekoppeld aan dezelfde `RealEstateAgent` (`@id`) als op de hoofdsites.

Privacy: huisnummer, postcode, huurdersgegevens en interne opmerkingen uit de bron worden nooit overgenomen.

## Archief

`data/huur.json` en `data/koop.json` bewaren elke woning die ooit voorbijkwam. Verhuurde/verkochte woningen blijven zichtbaar in het archief (hun pagina krijgt `noindex`). Een actieve woning die uit de bron verdwijnt, wordt "niet meer beschikbaar".

## Beveiligingen

- 0 woningen van de vestiging Haarlem in de bron → run faalt, er wordt niets gepubliceerd.
- Eerder ≥ 4 actieve woningen en nu ineens 0 → run faalt. Klopt het echt (alles verhuurd)? Start de workflow handmatig met **force** aan.
- Een mislukte run stuurt GitHub automatisch per mail.

## Widget op Squarespace

Codeblok op de homepage (verhuursite):

```html
<div id="koops-aanbod" data-aantal="3"><a href="https://woningen.verhuurmetkoops.nl/">Bekijk ons actuele huuraanbod</a></div>
<script src="https://woningen.verhuurmetkoops.nl/widget.js" defer></script>
```

Verkoopsite: zelfde code met `woningen.verkoopmetkoops.nl`. Optioneel `data-plaats="Heemstede"` om op plaats te filteren.

## Lokaal testen

```bash
npm ci
SITE=huur FIXTURE=fixtures/source-sample.json IMAGE_MODE=remote node src/run.mjs
```
