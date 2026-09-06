// Перенос принятого превью в сам сайт + переключатель темы.
//
// Главное решение здесь такое: СВЕТЛАЯ тема — это надстройка, а тёмная —
// это сайт как он есть. Все новые правила висят на `html.jasny`, поэтому
// «наш режим» (фиолетово-чёрный) не требует ни строчки поддержки: снял
// класс — вернулся прежний вид. Иначе каждую будущую правку пришлось бы
// делать дважды и проверять в двух темах.
//
// Скрипт идемпотентный: второй запуск ничего не портит, просто выходит.
import { readFile, writeFile } from 'node:fs/promises';

const P = 'C:/Users/zahar/zovu-pl/index.html';
let s = await readFile(P, 'utf8');

if (s.includes('data-motyw-gotowe')) { console.log('уже применено'); process.exit(0); }

// ── 1. Новый первый экран ────────────────────────────────────────────
const start = s.indexOf('<section id="hero">');
const koniec = s.indexOf('</section>', start) + '</section>'.length;
if (start < 0) throw new Error('не нашёл hero');

const KADRY = ['1', '4', '5', '2', '3', '7', '8', '9', '1', '4', '5', '2', '3', '7', '8', '9'];
const tasma = KADRY.map((n, i) => {
  // Играют только три самых лёгких файла, остальные стоят обложками:
  // восемь видео разом — это десяток мегабайт на первом экране.
  const zywe = ['1', '4', '5'].includes(n) && i < 8;
  const srodek = zywe
    ? `<video src="video${n}.mp4" poster="vidposter${n}.jpg" muted loop playsinline preload="none"></video>`
    : `<img src="vidposter${n}.jpg" alt="Kadr z rolki zrobionej przez ZOVU" loading="lazy" decoding="async">`;
  return `<a class="pg-karta" href="#portfolio" aria-label="Zobacz nasze prace">${srodek}</a>`;
}).join('\n        ');

const HERO = `<section id="hero" class="pg-hero">
  <div class="pg-gora">
    <img class="pg-foto" src="hero_montaz.jpg" alt="Montaż rolki: oś czasu na ekranie" fetchpriority="high">
    <div class="pg-cien"></div>
    <div class="pg-tresc">
      <div class="pg-eyebrow" data-k="hero_tag">AGENCJA KREATYWNA · KATOWICE</div>
      <h1 class="pg-h1"><span data-k="hero_l1">Rolka dziennie.</span><br><span data-k="hero_l3">Bez twojego czasu</span></h1>
    </div>
  </div>
  <div class="pg-dol">
    <div class="pg-naglowek">
      <div>
        <div class="pg-eyebrow pg-eyebrow-akcent" data-k="hero_prace">OSTATNIE ROLKI DLA KLIENTÓW</div>
        <p data-k="hero_opis">Scenariusz, zdjęcia, montaż i publikacja — po naszej stronie. Ty tylko odbierasz telefony.</p>
      </div>
      <div class="pg-cta">
        <a class="pg-btn dark" href="#portfolio" data-k="hero_cta1">Zobacz prace</a>
        <a class="pg-btn main" href="https://wa.me/48571795097" data-k="hero_cta2">Napisz na WhatsApp</a>
      </div>
    </div>
    <div class="pg-tasma" aria-label="Rolki zrobione przez ZOVU">
      <div class="pg-tor">
        ${tasma}
      </div>
    </div>
  </div>
</section>`;

s = s.slice(0, start) + HERO + s.slice(koniec);

// ── 2. Кнопка темы в навбаре ─────────────────────────────────────────
const przyciskMotywu = `      <button class="motyw" type="button" aria-label="Zmień motyw" title="Ciemny / jasny">
        <svg class="motyw-ks" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        <svg class="motyw-sl" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9l1.9 1.9M17.2 17.2l1.9 1.9M19.1 4.9l-1.9 1.9M6.8 17.2l-1.9 1.9"/></svg>
      </button>
`;
const kotwica = '    <div class="nav-right">\n      <div class="nav-lang">';
if (!s.includes(kotwica)) throw new Error('не нашёл nav-right');
s = s.replace(kotwica, '    <div class="nav-right">\n' + przyciskMotywu + '      <div class="nav-lang">');

// ── 3. Тема применяется ДО отрисовки ─────────────────────────────────
// Иначе при светлой теме первый кадр успевает мигнуть тёмным.
const wczesnySkrypt = `  <script>
    // Светлая тема — по умолчанию. Тёмная («наш режим») включается кнопкой
    // и запоминается. Читаем ДО первой отрисовки, иначе моргает.
    (function () {
      var m = null;
      try { m = localStorage.getItem('motyw'); } catch (e) {}
      document.documentElement.classList.add(m === 'ciemny' ? 'ciemny' : 'jasny');
    })();
  </script>
`;
s = s.replace('<head>\n', '<head>\n' + wczesnySkrypt);

// ── 4. Стили ─────────────────────────────────────────────────────────
const STYL = `
<style data-motyw-gotowe>
  /* ══ НОВЫЙ ПЕРВЫЙ ЭКРАН ══════════════════════════════════════════════
     Работает в обеих темах: тёмная — это сайт как был, светлая живёт на
     html.jasny. Свои правила усилены #hero, потому что у сайта правило по
     id и его класс бы не перебил. */
  #hero.pg-hero { position: relative; width: 100%; overflow: hidden; display: block; padding: 0; background: #050505; }
  #hero.pg-hero * { box-sizing: border-box; }
  #hero .pg-gora { position: relative; min-height: 46svh; display: flex; align-items: flex-end; }
  #hero .pg-foto { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  #hero .pg-cien {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(5,5,5,.72) 0%, rgba(5,5,5,.3) 45%, rgba(5,5,5,.68) 100%);
  }
  #hero .pg-tresc { position: relative; z-index: 2; padding: 74px 22px 86px; width: 100%; }
  /* Мягкий шов вместо линии: низ кадра растворяется в цвете следующего
     блока через фиолетовый. Резкий стык читался как две склеенные страницы. */
  #hero .pg-gora::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 128px; z-index: 1;
    background: linear-gradient(180deg,
      rgba(13,8,32,0) 0%, rgba(124,58,237,.20) 46%, rgba(13,8,32,.86) 84%, #0d0820 100%);
    pointer-events: none;
  }
  #hero .pg-eyebrow {
    font-family: var(--mono); font-size: 11px; letter-spacing: .22em;
    text-transform: uppercase; color: rgba(255,255,255,.62); margin-bottom: 14px;
  }
  #hero .pg-h1 {
    font-family: var(--display); font-weight: 700; text-transform: uppercase;
    font-size: clamp(40px, 12vw, 82px); line-height: .94; color: #fff; margin: 0;
  }
  #hero .pg-dol { padding: 24px 0 30px; display: grid; gap: 20px; background: #0d0820; }
  #hero .pg-naglowek { padding: 0 22px; display: grid; gap: 16px; }
  #hero .pg-eyebrow-akcent { color: var(--accent-2); margin-bottom: 9px; }
  #hero .pg-naglowek p {
    font-family: 'Manrope', sans-serif; font-size: 16px; line-height: 1.5;
    color: rgba(255,255,255,.72); margin: 0; max-width: 44ch; font-weight: 500;
  }
  #hero .pg-cta { display: flex; flex-wrap: wrap; gap: 10px; }
  #hero .pg-btn {
    display: inline-flex; align-items: center; text-decoration: none;
    font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 15px;
    padding: 14px 24px; border-radius: 40px; transition: transform .18s ease;
  }
  #hero .pg-btn:hover { transform: translateY(-2px); }
  #hero .pg-btn.main { background: #25D366; color: #05230f; }
  #hero .pg-btn.dark { background: #fff; color: #16141b; }
  /* Лента работ во всю ширину — то живое, ради чего блок и нужен.
     Под курсором НЕ останавливается: обрыв движения читался как поломка. */
  #hero .pg-tasma {
    overflow: hidden; width: 100%;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 42px, #000 calc(100% - 42px), transparent);
    mask-image: linear-gradient(90deg, transparent, #000 42px, #000 calc(100% - 42px), transparent);
  }
  #hero .pg-tor { display: flex; gap: 12px; width: max-content; animation: pgJedzie 56s linear infinite; }
  @keyframes pgJedzie { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  #hero .pg-karta {
    flex: 0 0 132px; width: 132px; aspect-ratio: 9/16; border-radius: 14px; overflow: hidden;
    background: #1b1a21; display: block; text-decoration: none;
    box-shadow: 0 8px 22px rgba(0,0,0,.35);
    transition: transform .25s ease, box-shadow .25s ease;
  }
  #hero .pg-karta:hover { transform: translateY(-6px); box-shadow: 0 16px 34px rgba(124,58,237,.4); }
  #hero .pg-karta:focus-visible { outline: 3px solid var(--accent-2); outline-offset: 3px; }
  #hero .pg-karta video, #hero .pg-karta img { width: 100%; height: 100%; object-fit: cover; display: block; }
  @media (prefers-reduced-motion: reduce) {
    #hero .pg-tor { animation: none; }
    #hero .pg-tasma { overflow-x: auto; }
    #hero .pg-btn, #hero .pg-karta { transition: none; }
  }
  @media (max-width: 480px) {
    /* Кнопки в один ряд: вертикально они съедали треть экрана, и лента
       уезжала под сгиб — а она тут главное. */
    #hero .pg-cta { flex-wrap: nowrap; gap: 8px; }
    #hero .pg-btn { padding: 13px 16px; font-size: 14px; white-space: nowrap; }
  }
  @media (min-width: 900px) {
    #hero .pg-gora { min-height: 48svh; }
    #hero .pg-tresc { max-width: 1240px; margin: 0 auto; padding: 90px 40px 104px; }
    #hero .pg-dol { padding: 34px 0 44px; gap: 26px; }
    #hero .pg-naglowek {
      max-width: 1240px; margin: 0 auto; padding: 0 40px; width: 100%;
      grid-template-columns: 1fr auto; align-items: end; gap: 40px;
    }
    #hero .pg-naglowek p { font-size: 18px; max-width: 52ch; }
    #hero .pg-karta { flex: 0 0 152px; width: 152px; }
    #hero .pg-tor { gap: 16px; }
  }

  /* ══ КНОПКА ТЕМЫ ═════════════════════════════════════════════════════ */
  .motyw {
    display: inline-flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; padding: 0; border: 0; border-radius: 50%;
    background: transparent; cursor: pointer; color: rgba(255,255,255,.5);
    transition: color .3s, background .3s;
  }
  .motyw:hover { color: var(--accent-2); background: rgba(124,58,237,.14); }
  .motyw svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; }
  .motyw .motyw-sl { display: none; }
  html.ciemny .motyw .motyw-ks { display: none; }
  html.ciemny .motyw .motyw-sl { display: block; }

  /* ══ СВЕТЛАЯ ТЕМА ════════════════════════════════════════════════════
     Тёмная тема — это сайт без этих правил, поэтому её не надо
     поддерживать отдельно: сняли класс и всё вернулось. */
  html.jasny body { background: #fff; }

  /* Верхняя плашка */
  html.jasny nav .nav-inner {
    background: rgba(255,255,255,.94); border-color: rgba(20,18,28,.1);
    box-shadow: 0 10px 30px rgba(20,18,28,.16);
  }
  html.jasny nav.scrolled .nav-inner { box-shadow: 0 4px 18px rgba(20,18,28,.14); }
  html.jasny nav a.nav-link { color: #26232f; }
  html.jasny nav a.nav-link:hover { color: var(--accent); }
  html.jasny nav .nav-logo span { color: #16141b; }
  html.jasny nav .nav-lang .lang { color: rgba(38,35,47,.55); }
  html.jasny nav .nav-lang .lang:hover { color: #16141b; }
  html.jasny nav .nav-lang .lang.on { color: var(--accent); }
  html.jasny nav .nav-soc { color: rgba(38,35,47,.55); }
  html.jasny nav .nav-soc:hover { color: var(--accent); }
  html.jasny .motyw { color: rgba(38,35,47,.55); }
  html.jasny .motyw:hover { color: var(--accent); }

  /* Первый экран */
  html.jasny #hero .pg-dol { background: #fff; }
  html.jasny #hero .pg-gora::after {
    background: linear-gradient(180deg,
      rgba(255,255,255,0) 0%, rgba(124,58,237,.20) 46%, rgba(255,255,255,.86) 84%, #fff 100%);
  }
  html.jasny #hero .pg-naglowek p { color: #3f3c4b; }
  html.jasny #hero .pg-eyebrow-akcent { color: var(--accent); }
  html.jasny #hero .pg-btn.dark { background: #16141b; color: #fff; }
  html.jasny #hero .pg-karta { background: #eceaf0; box-shadow: 0 8px 22px rgba(20,18,28,.16); }
  html.jasny #hero .pg-karta:hover { box-shadow: 0 16px 34px rgba(20,18,28,.28); }

  /* Работы. Фиолетовый тут СВЕТ, а не заливка: пятно сверху гаснет через
     380 пикселей. Сплошной градиент во всю страницу не берём — площадь
     фиолетового остаётся та же, а текст посреди заливки всегда сидит либо
     на слишком светлом, либо на слишком тёмном. */
  html.jasny #portfolio {
    background: radial-gradient(120% 380px at 50% 0%, rgba(124,58,237,.16) 0%, rgba(124,58,237,0) 100%), #fff;
  }
  /* Заголовки залиты градиентом через background-clip — одним color их не
     перекрасить, пока не снят -webkit-text-fill-color. */
  html.jasny #portfolio .sec-title, html.jasny #team .sec-title {
    background: none; color: #16141b; -webkit-text-fill-color: #16141b;
  }
  html.jasny #portfolio .sec-label, html.jasny #team .sec-label { color: var(--accent); }
  html.jasny #portfolio .pf-cat-name { color: #16141b; }
  html.jasny #portfolio .pf-cats { border-top-color: rgba(20,18,28,.12); }
  html.jasny #portfolio .pf-cat { border-bottom-color: rgba(20,18,28,.12); }
  html.jasny #portfolio .pf-cat:hover { background: rgba(124,58,237,.05); }
  html.jasny #portfolio .pf-cat-desc { color: #5d5a6b; }
  html.jasny #portfolio .pf-cat-arrow { color: rgba(20,18,28,.32); }
  html.jasny #portfolio .pf-strip-img, html.jasny #portfolio .pf-strip-vid {
    width: 290px; height: 164px; border-radius: 14px;
    border: 1px solid rgba(20,18,28,.08); box-shadow: 0 10px 26px rgba(20,18,28,.13);
    background: #eceaf0;
  }
  @media (max-width: 700px) {
    html.jasny #portfolio .pf-strip-img, html.jasny #portfolio .pf-strip-vid { width: 214px; height: 120px; }
  }

  /* Команда. Портреты сняты на чёрном поролоне, поэтому карточки остаются
     тёмными плитками — на белом фоне без них вышли бы три дыры. */
  html.jasny #team { background: #fff; position: relative; }
  html.jasny #team .tm { background: #16141b; border-color: rgba(20,18,28,.1); box-shadow: 0 20px 48px rgba(20,18,28,.2); }
  html.jasny #team .tm:hover { box-shadow: 0 30px 66px rgba(124,58,237,.34); }
  /* Зеркальный шов: белое растворяется в тёмном перед контактами. */
  html.jasny #team::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 150px; z-index: 0;
    background: linear-gradient(180deg,
      rgba(255,255,255,0) 0%, rgba(124,58,237,.18) 44%, rgba(22,14,46,.88) 86%, #160e2e 100%);
    pointer-events: none;
  }
  html.jasny #team .sec-head, html.jasny #team .team-grid { position: relative; z-index: 1; }

  /* Полоса цифр и так белая — правим только её границу со светлым верхом. */
  html.jasny .stats { border-top: 1px solid rgba(20,18,28,.08); }
</style>
`;
s = s.replace('</head>', STYL + '</head>');

// ── 5. Скрипты: тумблер и лента ──────────────────────────────────────
const SKRYPT = `
<script>
// Переключатель темы. Светлая — по умолчанию, тёмная запоминается.
(function () {
  var el = document.querySelector('.motyw');
  if (!el) return;
  el.addEventListener('click', function () {
    var ciemny = document.documentElement.classList.toggle('ciemny');
    document.documentElement.classList.toggle('jasny', !ciemny);
    try { localStorage.setItem('motyw', ciemny ? 'ciemny' : 'jasny'); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', ciemny ? '#0d0820' : '#ffffff');
  });
})();

// Видео в ленте включаем только когда полоса реально на экране: иначе
// браузер тянет файлы у человека, который до них не долистал.
(function () {
  var tasma = document.querySelector('#hero .pg-tasma');
  if (!tasma) return;
  var filmy = tasma.querySelectorAll('video');
  if (!filmy.length) return;
  new IntersectionObserver(function (wpisy) {
    wpisy.forEach(function (w) {
      filmy.forEach(function (f) {
        if (w.isIntersecting) { f.play().catch(function () {}); } else { f.pause(); }
      });
    });
  }, { threshold: 0.15 }).observe(tasma);
})();
</script>
`;
s = s.replace('</body>', SKRYPT + '</body>');

await writeFile(P, s, 'utf8');
console.log('перенесено в index.html: новый первый экран, светлая тема, переключатель');
