// Statische bestanden: stylesheet, favicon en het widget-script voor de Squarespace-sites.

export const CSS = `
:root{--accent:#FF7701;--accent-d:#D95F00;--ink:#111;--mute:#5a5a5a;--line:#e3e3e3;--soft:#f5f5f3;--bg:#fff}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:Montserrat,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:var(--bg);line-height:1.6;font-size:16px}
a{color:inherit}
img{max-width:100%;display:block}
.wrap{max-width:1180px;margin:0 auto;padding:0 16px}
.sr{position:absolute;left:-9999px}
.small{font-size:13px;color:var(--mute)}
.top{border-bottom:1px solid var(--line);background:#fff;position:sticky;top:0;z-index:5}
.top-in{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:72px;flex-wrap:wrap;padding-top:8px;padding-bottom:8px}
.logo img{height:44px;width:auto}
.top nav{display:flex;gap:4px 18px;flex-wrap:wrap;font-size:14px;font-weight:600}
.top nav a{text-decoration:none;padding:4px 0;border-bottom:2px solid transparent}
.top nav a:hover,.top nav a.on{border-bottom-color:var(--accent)}
.top nav .lang{border:1px solid var(--ink);padding:3px 8px;border-radius:0}
.crumbs{font-size:13px;color:var(--mute);margin:20px 0 0}
.crumbs a{color:var(--mute)}
.hero{padding:36px 0 12px}
h1{font-weight:800;font-size:clamp(28px,4.2vw,46px);line-height:1.1;margin:0 0 14px;letter-spacing:-.01em}
h2{font-weight:800;font-size:clamp(22px,2.6vw,30px);line-height:1.2;margin:0 0 14px}
h3{margin:0}
.lead{font-size:18px;max-width:760px;margin:0 0 18px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0}
.chips a{border:1px solid var(--ink);padding:6px 12px;font-size:14px;font-weight:600;text-decoration:none}
.chips a:hover{background:var(--ink);color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:24px;margin:18px 0 8px}
.card a{text-decoration:none;display:block;height:100%}
.ph{position:relative;aspect-ratio:3/2;background:var(--soft);overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.card a:hover .ph img{transform:scale(1.03)}
.noimg{width:100%;height:100%;background:repeating-linear-gradient(45deg,var(--soft),var(--soft) 10px,#ececea 10px,#ececea 20px)}
.badge{position:absolute;top:12px;left:12px;background:var(--ink);color:#fff;font-size:12px;font-weight:700;padding:4px 10px;text-transform:uppercase;letter-spacing:.04em}
.badge.inline{position:static;display:inline-block;margin-right:6px}
.b-nieuw{background:var(--accent)}
.b-voorbehoud,.b-onderbod,.b-volgeboekt{background:#6b6b6b}
.b-afgerond{background:#fff;color:var(--ink);border:1px solid var(--ink)}
.cb{padding:12px 2px 4px}
.cb h3{font-size:18px;font-weight:800}
.city{margin:0;color:var(--mute);font-size:14px}
.office{color:var(--accent-d);font-weight:600}
.price{font-weight:700;margin:6px 0 0}
.meta{margin:2px 0 0;font-size:14px;color:var(--mute)}
.when{display:block;font-size:13px;color:var(--mute);margin-top:4px}
.card.closed .ph img{filter:grayscale(.35)}
.sec{padding:28px 0 4px;border-top:1px solid var(--line);margin-top:28px}
.sec-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
.sec-head h2{margin:0}
.sec-head a{font-weight:600;font-size:14px}
.empty{padding:24px;background:var(--soft)}
.owner{margin:44px 0;background:var(--ink);color:#fff;padding:36px;display:grid;grid-template-columns:1.4fr 1fr;gap:28px;align-items:center}
.owner h2{color:var(--accent)}
.owner p{margin:0}
.owner-act{display:flex;flex-direction:column;gap:10px}
.owner .small{color:#cfcfcf}
.btn{display:inline-block;text-align:center;background:var(--accent);color:#fff;text-decoration:none;font-weight:700;text-transform:uppercase;letter-spacing:.04em;font-size:14px;padding:15px 22px;border:2px solid var(--accent)}
.btn:hover{background:var(--accent-d);border-color:var(--accent-d)}
.btn.line{background:transparent;color:inherit;border-color:currentColor}
.btn.line:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
.owner .btn.line:hover{background:#fff;color:var(--ink);border-color:#fff}
.notice{background:#fff4ea;border-left:4px solid var(--accent);padding:14px 16px;margin:18px 0 0}
.d-head{padding:22px 0 16px}
.kicker{margin:0 0 8px;font-size:14px;font-weight:600;color:var(--mute)}
.gallery{display:grid;grid-template-columns:2fr 1fr;gap:8px;margin-bottom:28px}
.g-main img{width:100%;height:100%;max-height:560px;object-fit:cover}
.g-rest{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:560px;overflow-y:auto}
.g-rest a{display:block}
.g-rest img{aspect-ratio:3/2;object-fit:cover;width:100%;height:auto}
.d-cols{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:40px;align-items:start}
.prose{max-width:720px}
.prose p{margin:0 0 14px}
.prose ul{margin:0 0 14px;padding-left:20px}
.facts{border-collapse:collapse;width:100%;max-width:720px;margin-bottom:12px}
.facts th,.facts td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);font-size:15px;vertical-align:top}
.facts th{font-weight:600;width:45%;color:var(--mute)}
.contact{position:sticky;top:96px;border:1px solid var(--line);padding:22px;display:flex;flex-direction:column;gap:10px}
.price.big{font-size:22px;margin:0 0 6px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:0;margin:22px 0 6px;border:1px solid var(--line)}
.stats div{padding:16px 18px;border-right:1px solid var(--line)}
.stats div:last-child{border-right:0}
.stats dt{font-size:13px;color:var(--mute);font-weight:600}
.stats dd{margin:4px 0 0;font-size:22px;font-weight:800}
.foot{background:var(--soft);margin-top:40px;padding:36px 0;font-size:14px}
.foot-in{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.foot-in .small{grid-column:1/-1;margin:0}
@media (max-width:860px){
  .gallery{grid-template-columns:1fr}
  .g-rest{grid-template-columns:repeat(3,1fr);max-height:none}
  .d-cols{grid-template-columns:1fr}
  .contact{position:static;order:-1}
  .owner{grid-template-columns:1fr;padding:26px 20px}
  .foot-in{grid-template-columns:1fr}
  .stats div{border-right:0;border-bottom:1px solid var(--line)}
}
@media (max-width:520px){.top nav{font-size:13px;gap:2px 12px}.g-rest{grid-template-columns:repeat(2,1fr)}}
`;

export const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#FF7701"/><path d="M9 7h4v8l7-8h5l-8 9 8 9h-5l-7-8v8H9z" fill="#fff"/></svg>`;

/** Widget voor Squarespace: <div id="koops-aanbod"></div><script src="https://woningen.../widget.js" defer></script> */
export function widgetJs(base, items, kind) {
  const data = JSON.stringify(items).replace(/</g, '\\u003c');
  const allLabel = kind === 'rent' ? 'Bekijk al het huuraanbod' : 'Bekijk al het koopaanbod';
  return `/* Koops woningaanbod-widget (automatisch gegenereerd) */
(function(){
  var BASE=${JSON.stringify(base)}, ITEMS=${data};
  function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var css='.kpw{font-family:inherit}.kpw-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}@media (max-width:767px){.kpw-g{grid-template-columns:1fr}}.kpw a{text-decoration:none;color:inherit;display:block}.kpw-ph{position:relative;aspect-ratio:3/2;overflow:hidden;background:#f2f2f2}.kpw-ph img{width:100%;height:100%;object-fit:cover;display:block}.kpw-b{position:absolute;top:10px;left:10px;background:#000;color:#fff;font-size:12px;font-weight:700;padding:3px 9px;text-transform:uppercase;letter-spacing:.04em}.kpw-b.n{background:#FF7701}.kpw h3{margin:10px 0 0;font-size:18px;font-weight:800}.kpw p{margin:2px 0 0;font-size:15px}.kpw .kpw-m{color:#666;font-size:14px}.kpw a.kpw-all{display:inline-block;margin-top:22px;background:#FF7701;color:#fff!important;padding:14px 22px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;font-size:14px}';
  function render(el){
    var n=parseInt(el.getAttribute('data-aantal')||'3',10), city=(el.getAttribute('data-plaats')||'').toLowerCase();
    var list=ITEMS.filter(function(i){return !city||i.city.toLowerCase()===city}).slice(0,n);
    if(!list.length){el.innerHTML='<p><a href="'+BASE+'/">${allLabel}</a></p>';return}
    var h='<style>'+css+'</style><div class="kpw"><div class="kpw-g">';
    list.forEach(function(i){h+='<article><a href="'+BASE+i.url+'"><div class="kpw-ph">'+(i.img?'<img src="'+(i.img.indexOf('http')===0?i.img:BASE+i.img)+'" alt="'+e(i.street+', '+i.city)+'" loading="lazy" width="640" height="427">':'')+'<span class="kpw-b'+(i.status==='nieuw'?' n':'')+'">'+e(i.label)+'</span></div><h3>'+e(i.street)+'</h3><p>'+e(i.city)+'</p><p><strong>'+e(i.price)+'</strong></p><p class="kpw-m">'+e(i.meta)+'</p></a></article>'});
    h+='</div><a class="kpw-all" href="'+BASE+'/">${allLabel}</a></div>';
    el.innerHTML=h;
  }
  function go(){var els=document.querySelectorAll('#koops-aanbod,[data-koops-aanbod]');for(var k=0;k<els.length;k++)render(els[k])}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
  window.addEventListener('mercury:load',go);
})();
`;
}
