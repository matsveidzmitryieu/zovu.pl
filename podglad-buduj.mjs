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
    <div class="pg-proba">
      <div class="pg-tel"><img src="vidposter1.jpg" alt="Kadr z rolki zrobionej przez ZOVU"></div>
      <div class="pg-proba-txt">
        <p>Tak wygląda jedna z rolek, które robimy klientom co tydzień. Scenariusz, zdjęcia, montaż i publikacja — po naszej stronie.</p>
        <div class="pg-cta">
          <a class="pg-btn dark" href="#portfolio">Zobacz prace</a>
          <a class="pg-btn main" href="https://wa.me/48571795097">Napisz na WhatsApp</a>
        </div>
      </div>
    </div>
  </div>
</section>
<style>
  #hero.pg-kulisy { background: #fff; display: block; padding: 0; }
  #hero.pg-kulisy .pg-gora { position: relative; min-height: 54svh; display: flex; align-items: flex-end; }
  #hero.pg-kulisy .pg-foto { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  #hero.pg-kulisy .pg-cien {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(5,5,5,.72) 0%, rgba(5,5,5,.3) 45%, rgba(5,5,5,.68) 100%);
  }
  #hero.pg-kulisy .pg-tresc { position: relative; padding: 74px 22px 30px; width: 100%; }
  /* Цифр здесь НЕТ намеренно: сразу под первым экраном идёт своя полоса
     сайта с 25M+/400K+/100K$+/7+, и вторые такие же читались бы как сбой. */
  #hero.pg-kulisy .pg-dol { padding: 26px 22px 36px; display: grid; gap: 26px; background: #fff; }
  #hero.pg-kulisy .pg-proba { display: flex; gap: 18px; align-items: center; }
  #hero.pg-kulisy .pg-tel {
    flex: 0 0 108px; width: 108px; aspect-ratio: 9/16; border-radius: 14px; overflow: hidden;
    border: 3px solid #16141b; box-shadow: 0 10px 26px rgba(0,0,0,.22);
  }
  #hero.pg-kulisy .pg-tel img { width: 100%; height: 100%; object-fit: cover; display: block; }
  #hero.pg-kulisy .pg-proba-txt p {
    font-family: 'Manrope', sans-serif; font-size: 15px; line-height: 1.55; color: #4a4757;
    margin: 0 0 16px; max-width: 40ch;
  }
  @media (min-width: 900px) {
    #hero.pg-kulisy .pg-gora { min-height: 62svh; }
    #hero.pg-kulisy .pg-tresc { max-width: 1240px; margin: 0 auto; padding: 90px 40px 52px; }
    #hero.pg-kulisy .pg-dol { max-width: 1240px; margin: 0 auto; padding: 34px 40px 54px; }
    #hero.pg-kulisy .pg-proba { gap: 28px; }
    #hero.pg-kulisy .pg-tel { flex: 0 0 136px; width: 136px; }
    #hero.pg-kulisy .pg-proba-txt p { font-size: 17px; max-width: 52ch; }
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
