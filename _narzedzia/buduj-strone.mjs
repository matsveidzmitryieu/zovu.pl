// Generator strony głównej zovu.pl w trzech językach.
// Uruchom z katalogu głównego repo:  node _narzedzia/buduj-strone.mjs
// Wynik: index.html (PL), en/index.html, ru/index.html. NIE edytuj tych plików ręcznie,
// tylko teksty w _narzedzia/tresc.mjs i szablon poniżej, potem przebuduj.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jezyki, wspolne as W } from './tresc.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://zovu.pl';
const DZIS = new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CASES = [
  { k: 'amorki', name: 'Amorki × TVN', url: null },
  { k: 'fightmode', name: 'Fight Mode', url: 'https://fightmode.tv' },
  { k: 'neworchard', name: 'New Orchard', url: 'https://neworchard.com' },
  { k: 'pickactive', name: 'PickActive', url: 'https://pickactive.pl' },
];
const WWW = [
  { k: 'shaurma', name: 'MAG SHAURMA', url: 'https://dzmzah.github.io/magshaurma/' },
  { k: 'maya', name: 'MAYA GOLD', url: 'https://dzmzah.github.io/maya-gold/' },
  { k: 'beegelato', name: 'Bee Gelato', url: 'https://beegelato.sk' },
  { k: 'gucio', name: 'Bar Gucio', url: 'https://inca1122.github.io/gucio_bar/' },
  { k: 'jewelry', name: 'Keta Gold', url: 'https://inca1122.github.io/jewelry-katowice/' },
  { k: 'energia', name: 'Energia dla Biznesu', url: 'https://energiabiznesu.pl/' },
];
const ROLKI = [
  { n: 1, v: '/tasma1.mp4' }, { n: 3 }, { n: 5, v: '/tasma5.mp4' }, { n: 7 }, { n: 9 }, { n: 8 },
];

const srcset = (base, ws) => ws.map((w) => `/img/${base}-${w}.webp ${w}w`).join(', ');

function jsonld(L) {
  const org = {
    '@type': 'ProfessionalService',
    '@id': `${SITE}/#org`,
    name: 'ZOVU',
    url: `${SITE}/`,
    logo: `${SITE}/logo_icon.png`,
    image: `${SITE}/og-image.jpg`,
    description: L.hero.lead,
    email: W.mail,
    telephone: '+48571795097',
    priceRange: '399-1500 PLN',
    address: { '@type': 'PostalAddress', addressLocality: 'Warszawa', addressRegion: 'mazowieckie', addressCountry: 'PL' },
    areaServed: [{ '@type': 'Country', name: 'Polska' }, { '@type': 'Place', name: 'Europe' }],
    knowsLanguage: ['pl', 'en', 'ru'],
    sameAs: Object.values(W.social).filter((u) => !u.includes('t.me')),
  };
  const services = L.uslugi.lista.map(([n, d], i) => ({
    '@type': 'Service', '@id': `${SITE}${L.path}#usluga-${i + 1}`, name: n, description: d, serviceType: n,
    provider: { '@id': `${SITE}/#org` }, areaServed: [{ '@type': 'Country', name: 'Polska' }, { '@type': 'Place', name: 'Europe' }],
    ...(i === 2 ? { offers: L.cennik.plany.map(([pn, key]) => ({ '@type': 'Offer', name: `${n}: ${pn}`, price: W.ceny[key], priceCurrency: 'PLN', priceSpecification: { '@type': 'UnitPriceSpecification', price: W.ceny[key], priceCurrency: 'PLN', unitCode: 'MON' } })) } : {}),
  }));
  const faq = { '@type': 'FAQPage', '@id': `${SITE}${L.path}#faq`, inLanguage: L.lang, mainEntity: L.faq.lista.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const site = { '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'ZOVU', publisher: { '@id': `${SITE}/#org` }, inLanguage: ['pl', 'en', 'ru'] };
  const page = { '@type': 'WebPage', '@id': `${SITE}${L.path}#page`, url: `${SITE}${L.path}`, name: L.title, description: L.description, inLanguage: L.lang, isPartOf: { '@id': `${SITE}/#site` }, about: { '@id': `${SITE}/#org` }, primaryImageOfPage: `${SITE}/og-image.jpg`, dateModified: DZIS };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [org, site, page, ...services, faq] }, null, 1);
}

const CSS = `
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:800 900;font-display:swap;src:url(/fonts/intertight-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:800 900;font-display:swap;src:url(/fonts/intertight-pl.woff2) format('woff2');unicode-range:U+0104-0107,U+0118-0119,U+0141-0144,U+015A-015B,U+0179-017C}
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:800 900;font-display:swap;src:url(/fonts/intertight-cyrillic.woff2) format('woff2');unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:'Inter';font-style:normal;font-weight:400 700;font-display:swap;src:url(/fonts/inter-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Inter';font-style:normal;font-weight:400 700;font-display:swap;src:url(/fonts/inter-pl.woff2) format('woff2');unicode-range:U+0104-0107,U+0118-0119,U+0141-0144,U+015A-015B,U+0179-017C}
@font-face{font-family:'Inter';font-style:normal;font-weight:400 700;font-display:swap;src:url(/fonts/inter-cyrillic.woff2) format('woff2');unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-display:swap;src:url(/fonts/instrument-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-display:swap;src:url(/fonts/instrument-pl.woff2) format('woff2');unicode-range:U+0104-0107,U+0118-0119,U+0141-0144,U+015A-015B,U+0179-017C}
:root{--bg:#f6f4ef;--surface:#fff;--ink:#111;--muted:#55524c;--accent:#ff4a1c;--on-accent:#111;--head:'Inter Tight',Inter,system-ui,sans-serif;--serif:'Instrument Serif',Georgia,serif;--card:#fff;--scrim:rgba(246,244,239,.96);color-scheme:light dark;--r:12px;--pad:clamp(16px,4vw,48px);--max:1360px;--gap:clamp(96px,12vw,176px)}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:80px}
body{margin:0;background:var(--bg);color:var(--ink);font:400 18px/1.55 Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
img,video{display:block;max-width:100%;height:auto}
a{color:inherit}
h1,h2,h3{margin:0;font-family:var(--head);font-weight:800;letter-spacing:-.02em;line-height:1.02}
p{margin:0}
ul,ol{margin:0;padding:0;list-style:none}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px;border-radius:4px}
::selection{background:var(--accent);color:var(--ink)}
.wrap{max-width:var(--max);margin:0 auto;padding-inline:var(--pad)}
.skip{position:absolute;left:-9999px;top:8px;background:#000;color:#fff;padding:10px 16px;z-index:99}
.skip:focus{left:8px}
.serif{font-family:var(--serif);font-style:italic;font-weight:400;letter-spacing:-.01em}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:52px;padding:0 26px;border-radius:999px;background:var(--accent);color:var(--on-accent);font-weight:800;font-size:17px;text-decoration:none;transition:transform .2s cubic-bezier(.2,.7,.2,1),background-color .2s}
.btn:hover{background:#ff6a42}
.btn:active{transform:scale(.97)}
.btn.ink{background:var(--ink);color:var(--bg)}
.btn.ink:hover{background:#2a2a2a}
.lnk{font-weight:700;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:5px;transition:text-decoration-color .2s}
.lnk:hover{text-decoration-color:var(--accent)}
/* nav */
.top{position:sticky;top:0;z-index:20;background:var(--scrim)}
.top .wrap{display:flex;align-items:center;gap:28px;height:72px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-family:var(--head);font-weight:900;font-size:22px;letter-spacing:-.02em}
.brand img{width:30px;height:30px}
.menu{display:flex;gap:26px;margin-left:auto;font-size:16px;font-weight:600}
.menu a{text-decoration:none;padding:6px 0;transition:color .2s}
.menu a:hover{color:var(--muted)}
.langs{display:flex;gap:4px;font-size:14px;font-weight:700}
.langs a{text-decoration:none;padding:6px 8px;border-radius:999px;color:var(--muted)}
.langs a[aria-current]{background:var(--surface);color:var(--ink)}
.top .btn{min-height:44px;padding:0 20px;font-size:15px}
/* hero */
.hero{padding-top:clamp(40px,6vw,88px)}
.hero h1{font-weight:900;font-size:clamp(36px,8.3vw,128px);letter-spacing:-.035em;line-height:.98}
:lang(ru) .hero h1{font-weight:900;font-size:clamp(30px,7.1vw,110px)}
.hero h1>span{display:block}
.frame{display:inline-block;vertical-align:-.04em;width:1.9em;height:.78em;margin-right:.18em;border-radius:.14em;overflow:hidden;background:var(--surface);animation:shutter 1.1s cubic-bezier(.7,0,.2,1) .15s both}
.frame video,.frame img{width:100%;height:100%;object-fit:cover;animation:settle 1.4s cubic-bezier(.2,.7,.2,1) .15s both}
@keyframes shutter{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes settle{from{transform:scale(1.12)}to{transform:none}}
.hero-dol{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:32px;align-items:end;margin-top:clamp(28px,3.4vw,48px)}
.lead{font-size:clamp(18px,1.55vw,22px);line-height:1.5;max-width:44ch}
.akcje{display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;justify-self:end}
.pasek{margin-top:clamp(40px,5vw,72px)}
.pasek ul{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}
.pasek li{aspect-ratio:9/16;border-radius:var(--r);overflow:hidden;background:var(--surface)}
.pasek img,.pasek video{width:100%;height:100%;object-fit:cover}
.pasek p{margin-top:14px;font-size:15px;color:var(--muted)}
/* sekcje */
.sek{margin-top:var(--gap)}
.glowa{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:32px;align-items:end;margin-bottom:clamp(40px,5vw,72px)}
.glowa h2,.h2{font-size:clamp(36px,5vw,76px);letter-spacing:-.03em}
.glowa p{font-size:clamp(17px,1.4vw,20px);max-width:46ch;justify-self:end}
.cases{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(48px,5vw,72px) clamp(24px,3vw,40px)}
.case figure{margin:0;border-radius:var(--r);overflow:hidden;background:var(--surface);aspect-ratio:3/2}
.case figure img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.case:hover figure img{transform:scale(1.03)}
.case h3{font-size:clamp(28px,2.6vw,40px);margin-top:22px}
.case h3 a{text-decoration:none}
.case h3 a:hover{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:6px;text-decoration-color:var(--accent)}
.kat{font-size:15px;color:var(--muted);margin-top:6px;font-weight:600}
.case .opis{margin-top:14px;max-width:56ch}
.case dl{margin:16px 0 0;display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:16px}
.case dt{color:var(--muted);font-weight:600}
.case dd{margin:0;font-weight:700}
.www{margin-top:clamp(72px,8vw,120px)}
.www h3{font-size:clamp(24px,2.2vw,32px);margin-bottom:28px}
.www ul{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:24px 16px}
.www a{text-decoration:none;display:block}
.www img{border-radius:8px;aspect-ratio:16/10;object-fit:cover;width:100%;background:var(--surface);transition:transform .3s}
.www a:hover img{transform:translateY(-4px)}
.www b{display:block;margin-top:10px;font-size:16px}
.www span{display:block;font-size:14px;color:var(--muted)}
.pole{background:var(--surface);padding-block:clamp(72px,9vw,136px)}
.uslugi{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(32px,5vw,80px)}
.uslugi .lewa{align-self:start;position:sticky;top:104px}
.uslugi .lewa p{margin-top:22px;max-width:40ch}
.uslugi .lewa .gdzie{font-weight:700}
.uslugi li{padding-block:0 34px}
.uslugi li h3{font-size:clamp(22px,1.9vw,28px)}
.uslugi li p{margin-top:8px;max-width:52ch}
.kroki{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(24px,3vw,48px);counter-reset:k}
.kroki li{counter-increment:k}
.kroki li::before{content:counter(k);display:block;font-family:var(--head);font-weight:900;font-size:clamp(56px,6vw,96px);font-weight:800;letter-spacing:-.05em;line-height:1;color:var(--accent);margin-bottom:18px}
.kroki h3{font-size:clamp(22px,1.9vw,28px)}
.kroki p{margin-top:10px;max-width:38ch}
.plany{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.plan{background:var(--surface);border-radius:var(--r);padding:clamp(24px,2.6vw,40px);display:flex;flex-direction:column}
.plan.pop{background:var(--ink);color:var(--bg)}
.plan .znak{font-size:15px;font-weight:700;color:var(--accent);min-height:24px}
.plan h3{font-size:24px;margin-top:6px}
.cena{margin-top:18px;font-family:var(--head);font-weight:900;letter-spacing:-.03em;font-size:clamp(48px,4.6vw,72px);line-height:1}
.cena small{font-size:17px;letter-spacing:0;font-weight:600;margin-left:6px}
.plan ul{margin:24px 0 32px;display:grid;gap:10px}
.plan li{padding-left:22px;position:relative}
.plan li::before{content:"";position:absolute;left:0;top:.62em;width:9px;height:9px;border-radius:50%;background:var(--accent)}
.plan .btn{margin-top:auto}
.plan:not(.pop) .btn{background:var(--ink);color:var(--bg)}
.plan:not(.pop) .btn:hover{background:#333}
.pelny{margin-top:16px;background:var(--surface);border-radius:var(--r);padding:clamp(24px,2.6vw,40px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px}
.pelny b{display:block;font-size:clamp(20px,1.7vw,26px);letter-spacing:-.02em}
.pod{display:flex;flex-wrap:wrap;gap:12px 32px;margin-top:24px;align-items:center}
.pod p{font-weight:700}
.ludzie{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(24px,3vw,48px)}
.ludzie img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--r);background:var(--surface)}
.ludzie h3{font-size:28px;margin-top:20px}
.ludzie .rola{font-weight:700;margin-top:4px}
.ludzie p.bio{margin-top:8px;max-width:36ch}
.ludzie a{display:inline-block;margin-top:10px;font-size:16px}
.faq{display:grid;gap:clamp(40px,4.6vw,64px)}
.qa{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:24px clamp(32px,5vw,80px)}
.qa h3{font-size:clamp(22px,2.3vw,34px);letter-spacing:-.03em;line-height:1.12}
.qa p{max-width:46ch}
.kontakt{background:var(--accent);color:#111;padding-block:clamp(80px,10vw,152px);margin-top:var(--gap)}
.kontakt h2{font-weight:900;font-size:clamp(40px,7.4vw,120px);letter-spacing:-.035em;line-height:.96;max-width:14ch}
.kontakt .wrap>p{margin-top:24px;font-size:clamp(18px,1.6vw,22px);max-width:40ch;font-weight:600}
.drogi{margin-top:clamp(40px,5vw,72px);display:grid;gap:8px}
.drogi a{font-family:var(--head);font-size:clamp(28px,4.6vw,72px);font-weight:800;letter-spacing:-.04em;line-height:1.08;text-decoration:none;width:fit-content;max-width:100%;overflow-wrap:anywhere}
.drogi a:hover{text-decoration:underline;text-decoration-thickness:4px;text-underline-offset:8px}
.drogi span{display:block;font-size:15px;font-weight:700;letter-spacing:0;margin-bottom:-4px}
.soc{display:flex;flex-wrap:wrap;gap:10px 28px;margin-top:40px;font-weight:700}
.soc a{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:5px}
footer{padding-block:36px 44px}
footer .wrap{display:flex;flex-wrap:wrap;gap:16px 32px;align-items:center;font-size:15px}
footer nav{display:flex;flex-wrap:wrap;gap:8px 22px;margin-left:auto}
footer nav a{text-decoration:none;color:var(--muted)}
footer nav a:hover{color:var(--ink)}
@media (prefers-color-scheme:dark){:root{--bg:#111;--surface:#1c1c1b;--card:#1c1c1b;--ink:#f6f4ef;--muted:#b4b0a8;--scrim:rgba(17,17,17,.96)}.btn.ink:hover,.plan:not(.pop) .btn:hover{background:#d9d6cf}.langs a[aria-current]{background:#2a2a28}}
/* ruch */
.js .rv{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.js .rv.on{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.js .rv{opacity:1;transform:none}}
/* tablet */
@media (max-width:1100px){.menu{display:none}.www ul{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:900px){
 .hero-dol,.glowa,.uslugi,.qa{grid-template-columns:1fr}
 .akcje,.glowa p{justify-self:start}
 .uslugi .lewa{position:static}
 .cases{grid-template-columns:1fr}
 .plany,.kroki,.ludzie{grid-template-columns:1fr}
 .ludzie{grid-template-columns:repeat(3,minmax(0,1fr))}
 .qa{gap:10px}
}
/* telefon */
@media (max-width:640px){
 body{font-size:17px}
 .top .wrap{height:64px;gap:12px}
 .brand{font-size:20px}
 .langs{margin-left:auto}
 .langs a{padding:6px 6px}
 .top .btn{display:none}
 .hero h1{font-weight:900;font-size:9.4vw;max-width:none}
 :lang(ru) .hero h1{font-weight:900;font-size:8.4vw}
 .hero h1 .frame{display:block;width:100%;height:auto;aspect-ratio:12/5;margin:14px 0 10px;border-radius:var(--r)}
 .akcje{width:100%}
 .akcje .btn{width:100%}
 .pasek ul{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;margin-inline:calc(var(--pad)*-1);padding-inline:var(--pad);scrollbar-width:none}
 .pasek ul::-webkit-scrollbar{display:none}
 .pasek li{flex:0 0 40vw;scroll-snap-align:start}
 .www ul{grid-template-columns:repeat(2,minmax(0,1fr))}
 .ludzie{grid-template-columns:1fr}
 .ludzie li{display:grid;grid-template-columns:112px 1fr;gap:0 16px;align-items:start}
 .ludzie h3{margin-top:0;font-size:24px}
 .ludzie img{grid-row:span 4}
 .pelny .btn,.plan .btn{width:100%}
 footer nav{margin-left:0}
}
`;

function stronę(L) {
  const H = L.hero, R = L.realizacje, U = L.uslugi, C = L.cennik, Z = L.zespol, F = L.faq, K = L.kontakt, S = L.stopka;
  const alt = ['pl', 'en', 'ru'].map((k) => `<link rel="alternate" hreflang="${k}" href="${SITE}${jezyki[k].path}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${SITE}/">`;
  const langs = ['pl', 'en', 'ru'].map((k) => `<a href="${jezyki[k].path}" hreflang="${k}" lang="${k}"${k === L.lang ? ' aria-current="page"' : ''}>${k.toUpperCase()}</a>`).join('');
  const preload = (L.lang === 'ru' ? ['intertight-cyrillic', 'inter-cyrillic'] : ['intertight-latin', 'inter-latin', 'instrument-latin'])
    .map((f) => `<link rel="preload" href="/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join('\n');
  const caseHtml = CASES.map((c) => {
    const t = L.case[c.k];
    const name = c.url ? `<a href="${c.url}" target="_blank" rel="noopener">${esc(c.name)}</a>` : esc(c.name);
    return `<article class="case rv">
  <figure><img src="/img/case-${c.k}-800.webp" srcset="${srcset('case-' + c.k, [480, 800, 1200])}" sizes="(max-width:900px) 92vw, 46vw" width="1200" height="800" alt="${esc(t.alt)}" loading="lazy" decoding="async"></figure>
  <h3>${name}</h3>
  <p class="kat">${esc(t.kat)}</p>
  <p class="opis">${esc(t.d)}</p>
  <dl><dt>${esc(R.zakres)}</dt><dd>${esc(t.z)}</dd>${t.w ? `<dt>${esc(R.wynik)}</dt><dd>${esc(t.w)}</dd>` : ''}</dl>
</article>`;
  }).join('\n');
  const wwwHtml = WWW.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener"><img src="/img/www-${s.k}-400.webp" srcset="${srcset('www-' + s.k, [400, 800])}" sizes="(max-width:640px) 44vw, (max-width:1100px) 30vw, 15vw" width="800" height="500" alt="${esc(s.name)}: ${esc(L.www[s.k])}" loading="lazy" decoding="async"><b>${esc(s.name)}</b><span>${esc(L.www[s.k])}</span></a></li>`).join('\n');
  const rolki = ROLKI.map((r, i) => `<li>${r.v
    ? `<video data-auto muted loop playsinline preload="none" poster="/img/rolka-${r.n}-270.webp" width="270" height="480" aria-hidden="true"><source data-src="${r.v}" type="video/mp4"></video>`
    : `<img src="/img/rolka-${r.n}-270.webp" srcset="${srcset('rolka-' + r.n, [270, 450])}" sizes="(max-width:640px) 40vw, 15vw" width="450" height="800" alt="" loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async">`}</li>`).join('');
  const plany = C.plany.map(([n, key, pkt]) => `<article class="plan rv${key === 'standard' ? ' pop' : ''}">
  <p class="znak">${key === 'standard' ? esc(C.pop) : ''}</p>
  <h3>${n}</h3>
  <p class="cena">${W.ceny[key]}<small>${esc(C.mies)}</small></p>
  <ul>${pkt.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <a class="btn" href="${L.wa}" target="_blank" rel="noopener">${esc(C.cta)}</a>
</article>`).join('\n');
  const ludzie = Z.osoby.map(([n, k, rola, bio, ig, igt]) => `<li class="rv"><img src="/img/zespol-${k}-480.webp" srcset="${srcset('zespol-' + k, [240, 480])}" sizes="(max-width:640px) 112px, 30vw" width="480" height="480" alt="${esc(n)}, ${esc(rola)}" loading="lazy" decoding="async"><h3>${n}</h3><p class="rola">${esc(rola)}</p><p class="bio">${esc(bio)}</p><a class="lnk" href="${ig}" target="_blank" rel="noopener">${igt}</a></li>`).join('\n');
  const faq = F.lista.map(([q, a]) => `<div class="qa rv"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('\n');
  const kroki = L.proces.kroki.map(([h, p]) => `<li class="rv"><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('');
  const uslugi = U.lista.map(([h, p], i) => `<li id="usluga-${i + 1}" class="rv"><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('\n');
  const base = L.path === '/' ? '' : '/';

  return `<!DOCTYPE html>
<html lang="${L.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(L.title)}</title>
<meta name="description" content="${esc(L.description)}">
<link rel="canonical" href="${SITE}${L.path}">
${alt}
<meta name="theme-color" content="#f6f4ef">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ZOVU">
<meta property="og:locale" content="${L.locale}">
<meta property="og:url" content="${SITE}${L.path}">
<meta property="og:title" content="${esc(L.ogTitle)}">
<meta property="og:description" content="${esc(L.description)}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(L.ogTitle)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(L.ogTitle)}">
<meta name="twitter:description" content="${esc(L.description)}">
<meta name="twitter:image" content="${SITE}/og-image.jpg">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${preload}
<link rel="preload" href="/img/hero-loop.webp" as="image">
<style>${CSS.replace(/\n/g, '')}</style>
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${jsonld(L)}</script>
</head>
<body>
<a class="skip" href="#tresc">${L.lang === 'pl' ? 'Przejdź do treści' : L.lang === 'en' ? 'Skip to content' : 'К содержанию'}</a>
<header class="top">
 <div class="wrap">
  <a class="brand" href="${L.path}" aria-label="ZOVU"><img src="/logo_icon.webp" width="30" height="30" alt=""><span>ZOVU</span></a>
  <nav class="menu" aria-label="${esc(L.nav.menu)}">
   <a href="#realizacje">${L.nav.realizacje}</a><a href="#uslugi">${L.nav.uslugi}</a><a href="#cennik">${L.nav.cennik}</a><a href="#zespol">${L.nav.zespol}</a><a href="#faq">${L.nav.faq}</a>
  </nav>
  <div class="langs">${langs}</div>
  <a class="btn" href="#kontakt">${L.nav.kontakt}</a>
 </div>
</header>
<main id="tresc">
<section class="hero wrap" id="start">
 <h1><span>${esc(H.h1a)}</span><span><span class="frame" aria-hidden="true"><video id="petla" muted loop playsinline preload="none" poster="/img/hero-loop.webp" width="576" height="240"><source data-src="/img/hero-loop.mp4" type="video/mp4"></video></span>${L.lang === 'ru' ? esc(H.h1b) : `<span class="serif">${esc(H.h1b)}</span>`}</span></h1>
 <div class="hero-dol">
  <p class="lead">${esc(H.lead)}</p>
  <div class="akcje"><a class="btn" href="${L.wa}" target="_blank" rel="noopener">${esc(H.cta)}</a><a class="lnk" href="#realizacje">${esc(H.cta2)}</a></div>
 </div>
 <div class="pasek"><ul>${rolki}</ul><p>${esc(H.pasek)}</p></div>
</section>

<section class="sek wrap" id="realizacje" aria-labelledby="h-realizacje">
 <div class="glowa"><h2 id="h-realizacje" class="rv">${esc(R.h2)}</h2><p class="rv">${esc(R.intro)}</p></div>
 <div class="cases">
${caseHtml}
 </div>
 <div class="www">
  <h3 class="rv">${esc(R.strony)}</h3>
  <ul>
${wwwHtml}
  </ul>
 </div>
</section>

<section class="sek pole" id="uslugi" aria-labelledby="h-uslugi">
 <div class="wrap uslugi">
  <div class="lewa"><h2 id="h-uslugi" class="h2 rv">${esc(U.h2)}</h2><p class="rv">${esc(U.intro)}</p><p class="gdzie rv">${esc(U.gdzie)}</p></div>
  <ul>
${uslugi}
  </ul>
 </div>
</section>

<section class="sek wrap" id="jak-zaczynamy" aria-labelledby="h-proces">
 <div class="glowa"><h2 id="h-proces" class="rv">${esc(L.proces.h2)}</h2></div>
 <ol class="kroki">${kroki}</ol>
</section>

<section class="sek wrap" id="cennik" aria-labelledby="h-cennik">
 <div class="glowa"><h2 id="h-cennik" class="rv">${esc(C.h2)}</h2><p class="rv">${esc(C.intro)}</p></div>
 <div class="plany">
${plany}
 </div>
 <div class="pelny rv"><div><b>${esc(C.pelny)}</b><span>${esc(C.pelnyD)}</span></div><a class="btn" href="${L.waWycena}" target="_blank" rel="noopener">${esc(C.pelnyCta)}</a></div>
 <div class="pod"><p>${esc(C.uwaga)}</p><a class="lnk" href="/autopilot/">${esc(C.auto)}</a><a class="lnk" href="/dla-agencji/">${esc(C.ag)}</a></div>
</section>

<section class="sek wrap" id="zespol" aria-labelledby="h-zespol">
 <div class="glowa"><h2 id="h-zespol" class="rv">${esc(Z.h2)}</h2><p class="rv">${esc(Z.intro)}</p></div>
 <ul class="ludzie">
${ludzie}
 </ul>
</section>

<section class="sek wrap" id="faq" aria-labelledby="h-faq">
 <div class="glowa"><h2 id="h-faq" class="rv">${esc(F.h2)}</h2></div>
 <div class="faq">
${faq}
 </div>
</section>

<section class="kontakt" id="kontakt" aria-labelledby="h-kontakt">
 <div class="wrap">
  <h2 id="h-kontakt">${esc(K.h2)}</h2>
  <p>${esc(K.p)}</p>
  <div class="drogi">
   <a href="${L.wa}" target="_blank" rel="noopener"><span>${esc(K.waL)}</span>${W.tel}</a>
   <a href="mailto:${W.mail}"><span>${esc(K.mailL)}</span>${W.mail}</a>
  </div>
  <div class="soc"><a href="${W.social.instagram}" target="_blank" rel="noopener">Instagram</a><a href="${W.social.facebook}" target="_blank" rel="noopener">Facebook</a><a href="${W.social.tiktok}" target="_blank" rel="noopener">TikTok</a><a href="${W.social.youtube}" target="_blank" rel="noopener">YouTube</a><a href="${W.social.telegram}" target="_blank" rel="noopener">Telegram</a></div>
 </div>
</section>
</main>
<footer>
 <div class="wrap">
  <a class="brand" href="${L.path}"><img src="/logo_icon.webp" width="30" height="30" alt=""><span>ZOVU</span></a>
  <p>© 2026 ZOVU. ${esc(S.prawa)}</p>
  <nav aria-label="${esc(S.prawa)}"><a href="/autopilot/">${esc(S.auto)}</a><a href="/dla-agencji/">${esc(S.ag)}</a><a href="/privacypolicy/">${esc(S.priv)}</a><a href="/terms/">${esc(S.terms)}</a><a href="#start">${esc(S.gora)}</a></nav>
 </div>
</footer>
<script>
(function(){
 var ruch=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function wlacz(v){var s=v.querySelector('source[data-src]');if(s){s.src=s.getAttribute('data-src');s.removeAttribute('data-src');v.load();}var p=v.play();if(p&&p.catch)p.catch(function(){});}
 if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){if(ruch)wlacz(v);}else if(!v.paused){v.pause();}});},{rootMargin:'120px'});
  document.querySelectorAll('#petla,video[data-auto]').forEach(function(v){io.observe(v);});
  var ro=new IntersectionObserver(function(es){es.forEach(function(e,i){if(e.isIntersecting){var el=e.target;setTimeout(function(){el.classList.add('on');},(i%4)*80);ro.unobserve(el);}});},{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv').forEach(function(el){ro.observe(el);});
 }else{document.querySelectorAll('.rv').forEach(function(el){el.classList.add('on');});}
})();
</script>
</body>
</html>
`;
}

for (const k of Object.keys(jezyki)) {
  const L = jezyki[k];
  const out = path.join(ROOT, L.path === '/' ? 'index.html' : L.path.replace(/^\/|\/$/g, '') + '/index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, stronę(L));
  console.log('zapisano', path.relative(ROOT, out), Math.round(fs.statSync(out).size / 1024) + ' KB');
}
