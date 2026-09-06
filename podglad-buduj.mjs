// Две страницы-превью нового первого экрана, чтобы смотреть с телефона
// на живом сайте, а не на макете.
//
// Обе — копии index.html, в которых заменена ТОЛЬКО секция #hero: всё
// остальное (навбар, работы, команда, контакты, скрипты) остаётся тем же,
// поэтому сравнение честное. Страницы закрыты от поисковика: noindex, и в
// sitemap их нет — иначе Google начнёт показывать черновики.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const W = 'C:/Users/zahar/zovu-pl';
const src = await readFile(W + '/index.html', 'utf8');

const start = src.indexOf('<section id="hero">');
const koniec = src.indexOf('</section>', start) + '</section>'.length;
if (start < 0 || koniec < start) throw new Error('не нашёл секцию hero');

// Общие стили обоих превью. Именование pg-* — чтобы ничего не столкнулось
// с классами сайта: специфичность тут решает всё, а страница чужая.
const CSS = `
<style>
  #hero.pg-hero { position: relative; width: 100%; overflow: hidden; background: #050505; }
  #hero.pg-hero * { box-sizing: border-box; }
  .pg-eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .22em;
    text-transform: uppercase; color: rgba(255,255,255,.62); margin-bottom: 14px;
  }
  .pg-h1 {
    font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase;
    font-size: clamp(40px, 12vw, 82px); line-height: .94; letter-spacing: -.005em;
    color: #fff; margin: 0 0 14px;
  }
  .pg-sub {
    font-family: 'Manrope', sans-serif; font-size: clamp(15px, 4vw, 18px); line-height: 1.5;
    color: rgba(255,255,255,.82); max-width: 30ch; margin: 0 0 22px;
  }
  .pg-cta { display: flex; flex-wrap: wrap; gap: 10px; }
  .pg-btn {
    display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
    font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 15px;
    padding: 14px 24px; border-radius: 40px; transition: transform .18s ease;
  }
  .pg-btn:hover { transform: translateY(-2px); }
  .pg-btn.main { background: #25D366; color: #05230f; }
  .pg-btn.ghost { background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.28); }
  .pg-btn.dark { background: #16141b; color: #fff; }
  @media (prefers-reduced-motion: reduce) { .pg-btn { transition: none; } }

  /* ── Белая плашка навбара ──────────────────────────────────────────
     Пробуем светлый верх: чёрная пилюля на тёмном первом экране сливалась
     в одно пятно, а белая сразу задаёт «сайт светлый». Перекрашиваем
     только цвета — форма, поведение при скролле и разметка остаются
     сайтовыми. Селекторы усилены тегом nav, иначе исходные правила
     по тегу и по классу перебивают наши. */
  nav .nav-inner {
    background: rgba(255,255,255,.94);
    border-color: rgba(20,18,28,.1);
    box-shadow: 0 10px 30px rgba(20,18,28,.16);
  }
  nav.scrolled .nav-inner { box-shadow: 0 4px 18px rgba(20,18,28,.14); }
  nav a.nav-link { color: #26232f; }
  nav a.nav-link:hover { color: #6d28d9; }
  nav .nav-logo span { color: #16141b; }
  nav .nav-lang .lang { color: rgba(38,35,47,.55); }
  nav .nav-lang .lang:hover { color: #16141b; }
  nav .nav-lang .lang.on { color: #6d28d9; }
  nav .nav-soc { color: rgba(38,35,47,.55); }
  nav .nav-soc:hover { color: #6d28d9; }

  /* ── Портфолио на светлом ──────────────────────────────────────────
     Первый экран стал светлым, а сразу под ним снова начинался сплошной
     фиолетовый — переход читался как другой сайт. Секция работ теперь на
     белом, фиолетовый остался номерами строк и подсветкой при наведении.
     Обложки крупнее и с тенью: на белом тонкая рамка не держит карточку.
     Правила по id/тегу перебивают классовые — отсюда #portfolio впереди. */
  #portfolio { background: #fff; }
  /* Заголовок секции залит градиентом через background-clip, поэтому одним
     color его не перекрасить: пока не снят -webkit-text-fill-color, буквы
     остаются светло-сиреневыми и на белом просто исчезают. */
  #portfolio .sec-title {
    background: none; color: #16141b; -webkit-text-fill-color: #16141b;
  }
  #portfolio .pf-cat-name { color: #16141b; }
  #portfolio .sec-label { color: #6d28d9; }
  #portfolio .pf-cats { border-top-color: rgba(20,18,28,.12); }
  #portfolio .pf-cat { border-bottom-color: rgba(20,18,28,.12); }
  #portfolio .pf-cat:hover { background: rgba(109,40,217,.05); }
  #portfolio .pf-cat-desc { color: #5d5a6b; }
  #portfolio .pf-cat-arrow { color: rgba(20,18,28,.32); }
  #portfolio .pf-strip-img, #portfolio .pf-strip-vid {
    width: 290px; height: 164px; border-radius: 14px;
    border: 1px solid rgba(20,18,28,.08);
    box-shadow: 0 10px 26px rgba(20,18,28,.13);
    background: #eceaf0;
  }
  @media (max-width: 700px) {
    #portfolio .pf-strip-img, #portfolio .pf-strip-vid { width: 214px; height: 120px; }
  }
</style>`;

// ── Вариант 3: человек на весь экран ────────────────────────────────
const HERO_CZLOWIEK = `<section id="hero" class="pg-hero pg-czlowiek">
  <div class="pg-tresc">
    <div class="pg-slowa">
      <div class="pg-eyebrow">MAT · ZAŁOŻYCIEL ZOVU · KATOWICE</div>
      <h1 class="pg-h1">Odbieram<br>osobiście</h1>
      <p class="pg-sub">Bez działu sprzedaży i bez ofert na trzy strony. Piszesz — rozmawiamy o twojej firmie.</p>
      <div class="pg-cta">
        <a class="pg-btn main" href="https://wa.me/48571795097">Napisz na WhatsApp</a>
        <a class="pg-btn ghost" href="#portfolio">Zobacz prace</a>
      </div>
    </div>
    <div class="pg-kadr">
      <img class="pg-foto" src="Митя.jpg" alt="Mat, założyciel ZOVU">
      <div class="pg-cien"></div>
    </div>
  </div>
</section>
<style>
  /* Телефон: фото держит весь экран, слова лежат в нижней трети — лицо
     должно оставаться ВЫШЕ текста, иначе заголовок читается по глазам. */
  #hero.pg-czlowiek {
    /* У сайта #hero — flex-колонка с padding 100px 20px 40px. В колонке
       вертикаль задаёт justify-content, а не align-items, и чужие отступы
       надо обнулить: свои поля страница ставит сама. */
    min-height: 88svh; display: flex; flex-direction: column;
    justify-content: flex-end; padding: 0;
  }
  #hero.pg-czlowiek .pg-tresc { position: static; width: 100%; padding: 0; }
  #hero.pg-czlowiek .pg-kadr { position: absolute; inset: 0; z-index: 0; }
  #hero.pg-czlowiek .pg-foto {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; object-position: 50% 14%;
  }
  #hero.pg-czlowiek .pg-cien {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(5,5,5,.55) 0%, rgba(5,5,5,.05) 26%, rgba(5,5,5,.72) 58%, rgba(5,5,5,.96) 100%);
  }
  #hero.pg-czlowiek .pg-slowa { position: relative; z-index: 2; padding: 0 22px 46px; }
  /* На широком экране фото НЕ растягиваем на всю ширину: исходник 640x640,
     во весь экран он превратился бы в мыло. Вместо этого разворот — текст
     слева, портрет карточкой справа в своём натуральном размере. */
  @media (min-width: 900px) {
    #hero.pg-czlowiek {
      min-height: 86svh; justify-content: center; padding: 0;
      background: radial-gradient(120% 90% at 78% 30%, rgba(124,58,237,.28) 0%, rgba(5,5,5,0) 62%), #050505;
    }
    #hero.pg-czlowiek .pg-cien { display: none; }
    #hero.pg-czlowiek .pg-foto {
      position: static; width: 100%; height: 100%; max-height: 62svh;
      object-position: 50% 18%; border-radius: 22px;
    }
    #hero.pg-czlowiek .pg-tresc {
      max-width: 1240px; margin: 0 auto; padding: 60px 40px;
      display: grid; grid-template-columns: 1.05fr .95fr; gap: 64px; align-items: center;
    }
    #hero.pg-czlowiek .pg-kadr {
      position: relative; border-radius: 22px; overflow: hidden; max-width: 520px;
      justify-self: end; box-shadow: 0 30px 70px rgba(0,0,0,.55);
      border: 1px solid rgba(255,255,255,.09);
    }
    #hero.pg-czlowiek .pg-h1 { font-size: clamp(56px, 5.4vw, 88px); }
    #hero.pg-czlowiek .pg-sub { max-width: 36ch; font-size: 18px; }
  }
  @media (max-width: 899px) {
    #hero.pg-czlowiek .pg-kadr { position: absolute; inset: 0; }
  }
</style>`;

// ── Вариант 4: за кадром ────────────────────────────────────────────
const HERO_KULISY = `<section id="hero" class="pg-hero pg-kulisy">
  <div class="pg-gora">
    <img class="pg-foto" src="hero_montaz.jpg" alt="Montaż rolki: oś czasu na ekranie">
    <div class="pg-cien"></div>
    <div class="pg-tresc">
      <div class="pg-eyebrow">AGENCJA KREATYWNA · KATOWICE</div>
      <h1 class="pg-h1">Rolka dziennie.<br>Bez twojego czasu</h1>
    </div>
  </div>
  <div class="pg-dol">
    <div class="pg-naglowek">
      <div>
        <div class="pg-eyebrow pg-eyebrow-ciemny">OSTATNIE ROLKI DLA KLIENTÓW</div>
        <p>Scenariusz, zdjęcia, montaż i publikacja — po naszej stronie. Ty tylko odbierasz telefony.</p>
      </div>
      <div class="pg-cta">
        <a class="pg-btn dark" href="#portfolio">Zobacz prace</a>
        <a class="pg-btn main" href="https://wa.me/48571795097">Napisz na WhatsApp</a>
      </div>
    </div>
    <div class="pg-tasma" aria-label="Rolki zrobione przez ZOVU">
      <div class="pg-tor">${['1', '4', '5', '2', '3', '7', '8', '9', '1', '4', '5', '2', '3', '7', '8', '9']
        .map((n, i) => {
          // Только три самых лёгких файла играют видео — остальные стоят
          // обложками. Иначе первый экран тянул бы десять мегабайт, а на
          // телефоне это и есть та секунда, на которой человек уходит.
          const zywe = ['1', '4', '5'].includes(n) && i < 8;
          // Карточка — ссылка на портфолио: человек уже смотрит на работы,
          // клик по ним должен вести к работам, а не быть картинкой.
          const srodek = zywe
            ? `<video src="video${n}.mp4" poster="vidposter${n}.jpg" muted loop playsinline preload="none"></video>`
            : `<img src="vidposter${n}.jpg" alt="Kadr z rolki zrobionej przez ZOVU">`;
          return `<a class="pg-karta" href="#portfolio" aria-label="Zobacz nasze prace">${srodek}</a>`;
        })
        .join('\n        ')}
      </div>
    </div>
  </div>
</section>
<script>
// Лента едет сама, но видео включаем только когда полоса реально на экране:
// иначе браузер тянет файлы у человека, который до них не долистал.
(function () {
  var tasma = document.querySelector('#hero.pg-kulisy .pg-tasma');
  if (!tasma) return;
  var filmy = tasma.querySelectorAll('video');
  var obs = new IntersectionObserver(function (wpisy) {
    wpisy.forEach(function (w) {
      filmy.forEach(function (f) {
        if (w.isIntersecting) { f.play().catch(function () {}); }
        else { f.pause(); }
      });
    });
  }, { threshold: 0.15 });
  obs.observe(tasma);
})();
</script>
<style>
  #hero.pg-kulisy { background: #fff; display: block; padding: 0; }
  #hero.pg-kulisy .pg-gora { position: relative; min-height: 46svh; display: flex; align-items: flex-end; }
  #hero.pg-kulisy .pg-foto { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  #hero.pg-kulisy .pg-cien {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(5,5,5,.72) 0%, rgba(5,5,5,.3) 45%, rgba(5,5,5,.68) 100%);
  }
  #hero.pg-kulisy .pg-tresc { position: relative; padding: 74px 22px 30px; width: 100%; }
  /* Цифр здесь НЕТ намеренно: сразу под первым экраном идёт своя полоса
     сайта с 25M+/400K+/100K$+/7+, и вторые такие же читались бы как сбой. */
  #hero.pg-kulisy .pg-dol { padding: 24px 0 30px; display: grid; gap: 20px; background: #fff; }
  #hero.pg-kulisy .pg-naglowek { padding: 0 22px; display: grid; gap: 16px; }
  @media (max-width: 480px) {
    /* Кнопки в один ряд: вертикально они съедали треть экрана, и лента
       работ уезжала под сгиб — а она тут главное. */
    #hero.pg-kulisy .pg-cta { flex-wrap: nowrap; gap: 8px; }
    #hero.pg-kulisy .pg-btn { padding: 13px 16px; font-size: 14px; white-space: nowrap; }
  }
  #hero.pg-kulisy .pg-eyebrow-ciemny { color: #6d28d9; margin-bottom: 9px; }
  #hero.pg-kulisy .pg-naglowek p {
    font-family: 'Manrope', sans-serif; font-size: 16px; line-height: 1.5; color: #3f3c4b;
    margin: 0; max-width: 44ch; font-weight: 500;
  }
  /* Лента во всю ширину экрана — она и есть то живое, ради чего белый блок
     вообще нужен. Карточки едут сами; наведение и «меньше движения»
     останавливают, чтобы можно было рассмотреть. */
  #hero.pg-kulisy .pg-tasma {
    overflow: hidden; width: 100%;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 42px, #000 calc(100% - 42px), transparent);
    mask-image: linear-gradient(90deg, transparent, #000 42px, #000 calc(100% - 42px), transparent);
  }
  #hero.pg-kulisy .pg-tor {
    display: flex; gap: 12px; width: max-content;
    animation: pgJedzie 56s linear infinite;
  }
  /* Лента НЕ останавливается под курсором: пауза выглядела как поломка —
     человек ведёт мышь к карточке, а движение обрывается. */
  @keyframes pgJedzie { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @media (prefers-reduced-motion: reduce) {
    #hero.pg-kulisy .pg-tor { animation: none; }
    #hero.pg-kulisy .pg-tasma { overflow-x: auto; }
  }
  #hero.pg-kulisy .pg-karta {
    flex: 0 0 132px; width: 132px; aspect-ratio: 9/16; border-radius: 14px; overflow: hidden;
    background: #ecebef; box-shadow: 0 8px 22px rgba(20,18,28,.16);
    display: block; text-decoration: none; transition: transform .25s ease, box-shadow .25s ease;
  }
  #hero.pg-kulisy .pg-karta:hover { transform: translateY(-6px); box-shadow: 0 16px 34px rgba(20,18,28,.28); }
  #hero.pg-kulisy .pg-karta:focus-visible { outline: 3px solid #6d28d9; outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) { #hero.pg-kulisy .pg-karta { transition: none; } }
  #hero.pg-kulisy .pg-karta video,
  #hero.pg-kulisy .pg-karta img { width: 100%; height: 100%; object-fit: cover; display: block; }
  @media (min-width: 900px) {
    #hero.pg-kulisy .pg-gora { min-height: 48svh; }
    #hero.pg-kulisy .pg-tresc { max-width: 1240px; margin: 0 auto; padding: 90px 40px 42px; }
    #hero.pg-kulisy .pg-dol { padding: 34px 0 44px; gap: 26px; }
    #hero.pg-kulisy .pg-naglowek {
      max-width: 1240px; margin: 0 auto; padding: 0 40px; width: 100%;
      grid-template-columns: 1fr auto; align-items: end; gap: 40px;
    }
    #hero.pg-kulisy .pg-naglowek p { font-size: 18px; max-width: 52ch; }
    #hero.pg-kulisy .pg-karta { flex: 0 0 152px; width: 152px; }
    #hero.pg-kulisy .pg-tor { gap: 16px; }
  }
</style>`;

async function zbuduj(katalog, hero) {
  let s = src.slice(0, start) + hero + src.slice(koniec);
  // Черновик не должен попасть в поиск.
  s = s.replace('  <title>', '  <meta name="robots" content="noindex, nofollow">\n  <title>');
  s = s.replace('</head>', CSS + '\n</head>');
  // Превью лежит в КОРНЕ рядом с index.html, а не в подпапке: половина
  // картинок сайта подставляется из JS относительными путями, и из
  // вложенной папки галерея просто не грузилась бы.
  await writeFile(`${W}/podglad-${katalog}.html`, s, 'utf8');
  console.log('готово:', `podglad-${katalog}.html`, Math.round(s.length / 1024) + ' КБ');
}

await zbuduj('czlowiek', HERO_CZLOWIEK);
await zbuduj('kulisy', HERO_KULISY);
