// Нижняя панель на телефоне + страница 404 + описания подстраниц.
import { readFile, writeFile } from 'node:fs/promises';

const W = 'C:/Users/zahar/zovu-pl';
const P = W + '/index.html';
let s = await readFile(P, 'utf8');

// ── 1. Нижняя панель ─────────────────────────────────────────────────
// На телефоне пункты меню в шапке скрыты (места нет), и человек остаётся
// без навигации вообще: только логотип и KONTAKT. Панель внизу закрывает
// сразу две дыры — переход к работам и кнопку написать, до которой иначе
// надо долистать всю страницу.
if (!s.includes('class="pasek"')) {
  const PASEK = `
<div class="pasek" hidden>
  <a class="pasek-btn" href="#portfolio" data-k="pasek_prace">Prace</a>
  <a class="pasek-btn glowna" href="https://wa.me/48571795097" target="_blank" rel="noopener" data-k="pasek_pisz">Napisz na WhatsApp</a>
</div>
`;
  s = s.replace('</body>', PASEK + '</body>');

  const STYL = `
<style data-pasek>
  .pasek { display: none; }
  @media (max-width: 700px) {
    .pasek {
      display: flex; gap: 8px; position: fixed; z-index: 995;
      left: 10px; right: 10px; bottom: 10px; padding: 8px;
      border-radius: 44px; background: rgba(13,8,32,.88);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,.12);
      box-shadow: 0 12px 34px rgba(0,0,0,.4);
      transform: translateY(140%); transition: transform .35s cubic-bezier(.16,1,.3,1);
    }
    html.jasny .pasek {
      background: rgba(255,255,255,.94); border-color: rgba(20,18,28,.1);
      box-shadow: 0 12px 34px rgba(20,18,28,.22);
    }
    .pasek.widac { transform: translateY(0); }
    .pasek[hidden] { display: flex; }
    .pasek-btn {
      flex: 1; display: inline-flex; align-items: center; justify-content: center;
      padding: 13px 10px; border-radius: 40px; text-decoration: none;
      font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 14px;
      color: #fff; background: rgba(255,255,255,.1); white-space: nowrap;
    }
    html.jasny .pasek-btn { color: #16141b; background: rgba(20,18,28,.07); }
    .pasek-btn.glowna { flex: 1.5; background: #25D366; color: #05230f; }
    html.jasny .pasek-btn.glowna { color: #05230f; }
  }
  @media (prefers-reduced-motion: reduce) { .pasek { transition: none; } }
</style>
`;
  s = s.replace('</head>', STYL + '</head>');

  const SKRYPT = `
<script>
// Панель выезжает, когда человек ушёл ниже первого экрана: наверху она
// перекрывала бы ленту работ, а именно её мы и хотим показать первой.
// Прячется на секции контактов — там кнопки уже есть, две подряд выглядят
// как ошибка. И не мешает баннеру cookie, пока он не закрыт.
(function () {
  var pasek = document.querySelector('.pasek');
  if (!pasek) return;
  var hero = document.getElementById('hero');
  var kontakt = document.getElementById('contact');
  var ck = document.getElementById('cookie-banner');
  function odswiez() {
    var poHero = window.scrollY > (hero ? hero.offsetHeight * 0.75 : 500);
    var wKontakcie = kontakt && kontakt.getBoundingClientRect().top < window.innerHeight * 0.8;
    var ckWidac = ck && ck.classList.contains('show');
    pasek.classList.toggle('widac', poHero && !wKontakcie && !ckWidac);
  }
  window.addEventListener('scroll', odswiez, { passive: true });
  window.addEventListener('resize', odswiez);
  document.addEventListener('click', function () { setTimeout(odswiez, 60); });
  odswiez();
})();
</script>
`;
  s = s.replace('</body>', SKRYPT + '</body>');

  const slowa = {
    en: { pasek_prace: 'Work', pasek_pisz: 'Message on WhatsApp' },
    pl: { pasek_prace: 'Prace', pasek_pisz: 'Napisz na WhatsApp' },
    ru: { pasek_prace: 'Работы', pasek_pisz: 'Написать в WhatsApp' },
  };
  for (const [jezyk, pary] of Object.entries(slowa)) {
    const znak = `\n  ${jezyk}: {\n`;
    const i = s.indexOf(znak);
    const wstaw = Object.entries(pary).map(([k, v]) => `    ${k}:${JSON.stringify(v)},`).join('\n') + '\n';
    s = s.slice(0, i + znak.length) + wstaw + s.slice(i + znak.length);
  }
}

await writeFile(P, s, 'utf8');
console.log('нижняя панель добавлена');

// ── 2. Описания подстраниц ───────────────────────────────────────────
// У /terms и /privacypolicy не было ни описания, ни canonical: в выдаче
// такие страницы показываются случайным куском текста.
const podstrony = {
  'terms/index.html': {
    opis: 'Regulamin i warunki współpracy z ZOVU: zakres prac, terminy, poprawki, prawa do materiałów i płatności.',
    url: 'https://zovu.pl/terms/',
  },
  'privacypolicy/index.html': {
    opis: 'Polityka prywatności ZOVU: jakie dane zbieramy, po co, jak długo je trzymamy i jak możesz je usunąć. Zgodnie z RODO.',
    url: 'https://zovu.pl/privacypolicy/',
  },
};
for (const [plik, dane] of Object.entries(podstrony)) {
  let p = await readFile(W + '/' + plik, 'utf8');
  if (p.includes('name="description"')) { console.log(plik, '— описание уже есть'); continue; }
  const blok = `  <meta name="description" content="${dane.opis}">\n  <link rel="canonical" href="${dane.url}">\n  <meta property="og:title" content="${(p.match(/<title>([^<]*)<\/title>/) || [, 'ZOVU'])[1]}">\n  <meta property="og:description" content="${dane.opis}">\n  <meta property="og:image" content="https://zovu.pl/og-image.jpg">\n  <meta property="og:url" content="${dane.url}">\n`;
  p = p.replace(/(<title>[^<]*<\/title>\r?\n)/, '$1' + blok);
  await writeFile(W + '/' + plik, p, 'utf8');
  console.log(plik, '— описание добавлено');
}
