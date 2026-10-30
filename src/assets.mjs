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
.logo img{height:44px;width:auto}
.top-in{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:80px}
.top nav{display:flex;align-items:center;gap:22px}
.menu{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:2px 16px;font-size:14px;font-weight:500}
.menu a,.menu button{font:inherit;color:var(--ink);background:none;border:0;padding:6px 0;cursor:pointer;text-decoration:none;border-bottom:2px solid transparent;display:inline-block}
.menu a:hover,.menu a.on,.menu button:hover{border-bottom-color:var(--accent)}
.menu .dd{position:relative}
.menu .dd>button::after{content:"";display:inline-block;width:6px;height:6px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);margin:0 0 3px 8px}
.menu .dd ul{list-style:none;margin:0;padding:10px 0;position:absolute;left:-16px;top:100%;min-width:250px;background:#fff;border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.08);display:none;z-index:10}
.menu .dd:hover ul,.menu .dd:focus-within ul,.menu .dd.open ul{display:block}
.menu .dd ul a{display:block;padding:8px 16px;border:0;font-size:14px}
.menu .dd ul a:hover{background:var(--soft);color:var(--accent-d)}
.top-act{display:flex;align-items:center;gap:14px}
.top .lang{border:1px solid var(--ink);padding:3px 8px;font-size:13px;font-weight:700;text-decoration:none}
.small-btn{padding:12px 18px;font-size:13px;white-space:nowrap}
.burger{display:none;background:none;border:0;width:40px;height:40px;padding:8px;cursor:pointer}
.burger span{display:block;height:2px;background:var(--ink);margin:5px 0}
@media (max-width:1100px){
  .burger{display:block}
  .top nav{display:none;position:absolute;left:0;right:0;top:100%;background:#fff;border-bottom:1px solid var(--line);padding:8px 16px 20px;flex-direction:column;align-items:stretch;max-height:calc(100vh - 80px);overflow-y:auto}
  .top.open nav{display:flex}
  .menu{flex-direction:column;gap:0;font-size:16px}
  .menu>li{border-bottom:1px solid var(--line)}
  .menu a,.menu button{padding:12px 0;width:100%;text-align:left;border-bottom:0}
  .menu .dd ul{position:static;box-shadow:none;border:0;padding:0 0 8px 12px;min-width:0}
  .menu .dd:hover ul,.menu .dd:focus-within ul{display:none}
  .menu .dd.open ul{display:block}
  .top-act{padding-top:14px;justify-content:space-between}
}
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
.foot{background:#000;color:#fff;margin-top:48px;padding:44px 0;font-size:14px}
.foot a{color:#fff}
.foot strong{color:var(--accent)}
.foot .small{color:#bdbdbd}
.foot-in{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.foot-in .small{grid-column:1/-1;margin:0}
.proof{font-weight:600;margin:0 0 14px}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.kform label{display:flex;flex-direction:column;gap:4px;font-size:14px;font-weight:600;margin:0 0 12px}
.kform input,.kform select,.kform textarea,.filters select{font:inherit;font-weight:400;padding:11px 12px;border:1px solid #bdbdbd;border-radius:0;background:#fff;color:var(--ink);width:100%}
.kform input:focus,.kform select:focus,.kform textarea:focus,.filters select:focus{outline:2px solid var(--accent);outline-offset:0;border-color:var(--accent)}
.kform .btn{cursor:pointer}
.kform .bad{border-color:#c62828}
.f2{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}
.f3{display:grid;grid-template-columns:repeat(3,1fr);gap:0 16px}
.f-inline{display:flex;gap:12px;align-items:flex-end}
.f-inline .grow{flex:1;margin:0}
.lead-form form{max-width:720px}
.fmsg{font-weight:600;margin:10px 0 0}
.fmsg.ok{color:#1b5e20}.fmsg.err{color:#c62828}
.alert-box{margin:44px 0 0;background:var(--soft);padding:32px;display:grid;grid-template-columns:1fr 1.5fr;gap:28px}
.alert-box h2{margin-bottom:8px}
.alert-box p{margin:0}
.cities{border:0;padding:0;margin:0 0 12px;display:flex;flex-wrap:wrap;gap:6px 14px}
.cities legend{font-size:14px;font-weight:600;padding:0;margin-bottom:6px}
.kform .chk{flex-direction:row;align-items:center;gap:6px;font-weight:400;margin:0}
.kform .chk input{width:auto}
.filters{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;align-items:end;margin:8px 0 0;padding:16px;background:var(--soft);position:sticky;top:81px;z-index:4}
.filters label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:600}
.filters select{padding:9px 10px}
.fcount{grid-column:1/-1;margin:0;font-size:14px;color:var(--mute)}
.card[hidden],.sec[hidden]{display:none}
@media (max-width:860px){
  .alert-box{grid-template-columns:1fr;padding:24px 20px}
  .f3{grid-template-columns:1fr 1fr}
  .filters{grid-template-columns:1fr 1fr;position:static}
}
@media (max-width:520px){.f2,.f3{grid-template-columns:1fr}.f-inline{flex-direction:column;align-items:stretch}}
@media (max-width:860px){
  .gallery{grid-template-columns:1fr}
  .g-rest{grid-template-columns:repeat(3,1fr);max-height:none}
  .d-cols{grid-template-columns:1fr}
  .contact{position:static;order:-1}
  .owner{grid-template-columns:1fr;padding:26px 20px}
  .foot-in{grid-template-columns:1fr}
  .stats div{border-right:0;border-bottom:1px solid var(--line)}
}
.mbar{display:none}
@media (max-width:860px){
  .mbar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:20;background:#fff;border-top:1px solid var(--line);padding:8px 10px calc(8px + env(safe-area-inset-bottom));gap:8px;box-shadow:0 -6px 20px rgba(0,0,0,.08)}
  .mbar a{flex:1;text-align:center;padding:12px 6px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;text-decoration:none;border:2px solid var(--ink);color:var(--ink)}
  .mbar a.go{background:var(--accent);border-color:var(--accent);color:#fff;flex:1.4}
  body:has(.mbar){padding-bottom:72px}
  .stats{grid-template-columns:1fr 1fr}
  .stats div{border-right:0;border-bottom:1px solid var(--line)}
  .stats div:nth-child(odd){border-right:1px solid var(--line)}
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
  var css='.kpw{font-family:inherit}.kpw-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}@media (max-width:767px){.kpw-g{grid-template-columns:1fr}}.kpw a{text-decoration:none;color:inherit;display:block}.kpw-ph{position:relative;aspect-ratio:3/2;overflow:hidden;background:#f2f2f2}.kpw-ph img{width:100%;height:100%;object-fit:cover;display:block}.kpw-b{position:absolute;top:10px;left:10px;background:#000;color:#fff;font-size:12px;font-weight:700;padding:3px 9px;text-transform:uppercase;letter-spacing:.04em}.kpw-b.n{background:#FF7701}.kpw h3{margin:10px 0 0!important;font-size:18px!important;font-weight:800!important;line-height:1.3!important;letter-spacing:0!important;font-family:inherit}.kpw p{margin:2px 0 0;font-size:15px}.kpw .kpw-m{color:#666;font-size:14px}.kpw-t{margin:0 0 24px}.kpw a.kpw-all{display:inline-block;margin-top:22px;background:#FF7701;color:#fff!important;padding:14px 22px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;font-size:14px}';
  function render(el){
    var n=parseInt(el.getAttribute('data-aantal')||'3',10), city=(el.getAttribute('data-plaats')||'').toLowerCase();
    var list=ITEMS.filter(function(i){return !city||i.city.toLowerCase()===city}).slice(0,n);
    if(!list.length){el.innerHTML='<p><a href="'+BASE+'/">${allLabel}</a></p>';return}
    // In Squarespace Fluid Engine: blok over de volle breedte van de sectie laten lopen (tenzij data-breedte="blok").
    var fb=el.closest('.fe-block');
    if(fb&&el.getAttribute('data-breedte')!=='blok'){fb.style.gridColumnStart='2';fb.style.gridColumnEnd='-2';fb.style.height='auto';}
    var title=el.getAttribute('data-titel');
    var h='<style>'+css+'</style><div class="kpw">'+(title?'<h2 class="kpw-t">'+e(title)+'</h2>':'')+'<div class="kpw-g">';
    list.forEach(function(i){h+='<article><a href="'+BASE+i.url+'"><div class="kpw-ph">'+(i.img?'<img src="'+(i.img.indexOf('http')===0?i.img:BASE+i.img)+'" alt="'+e(i.street+', '+i.city)+'" loading="lazy" width="640" height="427">':'')+'<span class="kpw-b'+(i.status==='nieuw'?' n':'')+'">'+e(i.label)+'</span></div><h3>'+e(i.street)+'</h3><p>'+e(i.city)+'</p><p><strong>'+e(i.price)+'</strong></p><p class="kpw-m">'+e(i.meta)+'</p></a></article>'});
    // Staat er in dezelfde sectie al een eigen Squarespace-knop naar het aanbod? Dan geen tweede knop.
    var sec=el.closest('section'), dup=sec&&[].some.call(sec.querySelectorAll('a[href*="woningen."]'),function(a){return !el.contains(a)&&a.closest('.sqs-block-button, .sqs-block-button-container')});
    h+='</div>'+(dup||el.getAttribute('data-knop')==='nee'?'':'<a class="kpw-all" href="'+BASE+'/">${allLabel}</a>')+'</div>';
    el.innerHTML=h;
  }
  function go(){var els=document.querySelectorAll('#koops-aanbod,[data-koops-aanbod]');for(var k=0;k<els.length;k++)render(els[k])}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
  window.addEventListener('mercury:load',go);
})();
`;
}

/** Formulieren (reactie, inschrijving) en filters op /aanbod/. */
export const SITE_JS = `(function(){
  var B=document.body, EP=B.getAttribute('data-endpoint'), SITE=B.getAttribute('data-site'), LANG=B.getAttribute('data-lang');
  var started=Date.now();
  function track(name,params){try{if(window.gtag)gtag('event',name,params||{});(window.dataLayer=window.dataLayer||[]).push(Object.assign({event:name},params||{}))}catch(e){}}
  document.querySelectorAll('form.kform').forEach(function(f){
    f.addEventListener('submit',function(ev){
      ev.preventDefault();
      var msg=f.querySelector('.fmsg'), btn=f.querySelector('button[type=submit]'), ok=true;
      f.querySelectorAll('[required]').forEach(function(i){var bad=!i.value.trim()||(i.type==='email'&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(i.value.trim()));i.classList.toggle('bad',bad);if(bad)ok=false});
      if(!ok){msg.className='fmsg err';msg.textContent=LANG==='en'?'Please fill in the required fields.':'Vul de verplichte velden in.';return}
      var d={type:f.getAttribute('data-type'),site:SITE,lang:LANG,t:started,page:location.href};
      new FormData(f).forEach(function(v,k){if(k==='cities'){(d.cities=d.cities||[]).push(v)}else d[k]=v});
      btn.disabled=true;msg.className='fmsg';msg.textContent=LANG==='en'?'Sending…':'Versturen…';
      fetch(EP,{method:'POST',body:JSON.stringify(d)}).then(function(r){return r.json()}).then(function(r){
        if(!r.ok)throw new Error(r.error||'fout');
        msg.className='fmsg ok';msg.textContent=f.getAttribute('data-ok');f.reset();
        track(d.type==='inschrijving'?'koops_inschrijving':'koops_reactie',{site:SITE});
      }).catch(function(){msg.className='fmsg err';msg.textContent=f.getAttribute('data-err')}).finally(function(){btn.disabled=false});
    });
  });
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;var h=a.getAttribute('href')||'';
    if(h.indexOf('tel:')===0)track('koops_bellen',{site:SITE});else if(h.indexOf('wa.me')>-1)track('koops_whatsapp',{site:SITE});});
  var T=document.querySelector('.top'),bg=document.querySelector('.burger');
  if(bg)bg.addEventListener('click',function(){var o=T.classList.toggle('open');bg.setAttribute('aria-expanded',o)});
  document.querySelectorAll('.menu .dd>button').forEach(function(b){b.addEventListener('click',function(){var li=b.parentNode,o=!li.classList.contains('open');document.querySelectorAll('.menu .dd.open').forEach(function(x){x.classList.remove('open');x.firstChild.setAttribute('aria-expanded','false')});if(o){li.classList.add('open');b.setAttribute('aria-expanded','true')}})});
  document.addEventListener('click',function(e){if(!e.target.closest('.menu .dd'))document.querySelectorAll('.menu .dd.open').forEach(function(x){x.classList.remove('open')})});
  var F=document.getElementById('filters');
  if(F){
    var cards=[].slice.call(document.querySelectorAll('.card')), qs=new URLSearchParams(location.search);
    [].forEach.call(F.elements,function(el){if(el.name&&qs.get(el.name))el.value=qs.get(el.name)});
    function apply(){
      var v={};[].forEach.call(F.elements,function(el){if(el.name)v[el.name]=el.value});
      var n=0;
      cards.forEach(function(c){var p=+c.dataset.price,show=(!v.status||c.dataset.state===v.status)&&(!v.plaats||c.dataset.city===v.plaats)&&(!v.min||(p&&p>=+v.min))&&(!v.max||(p&&p<=+v.max))&&(!v.kamers||+c.dataset.rooms>=+v.kamers)&&(!v.oplevering||c.dataset.furn===v.oplevering);c.hidden=!show;if(show)n++});
      document.querySelectorAll('main .sec').forEach(function(s){var cs=s.querySelectorAll('.card');if(cs.length)s.hidden=![].some.call(cs,function(c){return!c.hidden})});
      F.querySelector('.fcount').textContent=n+' '+(n===1?'woning':'woningen');
      var none=document.querySelector('.fnone');if(none)none.hidden=n>0;
      var q=new URLSearchParams();Object.keys(v).forEach(function(k){if(v[k])q.set(k,v[k])});
      history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:'')+location.hash);
    }
    F.addEventListener('change',apply);apply();
  }
})();
`;
