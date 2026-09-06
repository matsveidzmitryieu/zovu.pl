// Три доработки после прохода по сайту.
import { readFile, writeFile, access } from 'node:fs/promises';
import sharp from 'sharp';
import path from 'node:path';

const W = 'C:/Users/zahar/zovu-pl';
const P = W + '/index.html';
let s = await readFile(P, 'utf8');

// ── 1. Строка услуг на первом экране ─────────────────────────────────
// Новый заголовок говорит только про рилсы. Человек, которому нужен сайт
// или реклама, closes вкладку, потому что не увидел своего слова. Старый
// hero эту строку имел — возвращаем её, но одной мono-строкой, без блока.
if (!s.includes('pg-uslugi')) {
  const stary = '<h1 class="pg-h1"><span data-k="hero_n1">Rolka dziennie.</span><br><span data-k="hero_n2">Bez twojego czasu</span></h1>';
  const nowy = stary + '\n      <div class="pg-uslugi" data-k="hero_uslugi">STRONY · WIDEO · SOCIAL MEDIA · REKLAMA · AUTOMATYZACJA</div>';
  if (!s.includes(stary)) throw new Error('не нашёл заголовок первого экрана');
  s = s.replace(stary, nowy);

  const slowa = {
    en: 'WEBSITES · VIDEO · SOCIAL MEDIA · ADS · AUTOMATION',
    pl: 'STRONY · WIDEO · SOCIAL MEDIA · REKLAMA · AUTOMATYZACJA',
    ru: 'САЙТЫ · ВИДЕО · СОЦСЕТИ · РЕКЛАМА · АВТОМАТИЗАЦИЯ',
  };
  for (const [jezyk, tekst] of Object.entries(slowa)) {
    const znak = `\n  ${jezyk}: {\n`;
    const i = s.indexOf(znak);
    s = s.slice(0, i + znak.length) + `    hero_uslugi:${JSON.stringify(tekst)},\n` + s.slice(i + znak.length);
  }
}

// ── 2. Размеры картинок ──────────────────────────────────────────────
// Без width/height браузер не знает, сколько места занять, и вёрстка
// прыгает по мере загрузки — на телефоне это выглядит как поломка.
const obrazy = [...s.matchAll(/<img\b[^>]*?src="([^"]+\.(?:jpg|jpeg|png|webp))"[^>]*>/gi)];
let opisane = 0, pominiete = 0;
const rozmiary = new Map();
for (const m of obrazy) {
  const tag = m[0];
  if (/\bwidth=/.test(tag)) continue;
  const plik = m[1];
  if (/^https?:/.test(plik)) { pominiete++; continue; }
  if (!rozmiary.has(plik)) {
    try {
      const meta = await sharp(path.join(W, decodeURIComponent(plik))).metadata();
      rozmiary.set(plik, [meta.width, meta.height]);
    } catch { rozmiary.set(plik, null); }
  }
  const wym = rozmiary.get(plik);
  if (!wym) { pominiete++; continue; }
  const nowyTag = tag.replace('<img', `<img width="${wym[0]}" height="${wym[1]}"`);
  s = s.replace(tag, nowyTag);
  opisane++;
}
console.log('размеры проставлены:', opisane, '· пропущено:', pominiete);

// ── 3. Заставка под светлую тему ─────────────────────────────────────
// Чёрная вспышка при заходе на светлый сайт выглядит как чужая страница.
if (!s.includes('html.jasny .splash')) {
  const STYL = `
<style data-splash-jasny>
  /* Заставка в светлой теме — светлая: чёрная вспышка на белом сайте
     читается как «загрузилось что-то другое». */
  html.jasny .splash { background: #fbfaf8; }
  html.jasny .splash-text { color: #16141b; }
  html.jasny .splash-sub { color: rgba(22,20,27,.45); }
</style>
`;
  s = s.replace('</head>', STYL + '</head>');
}

// Стиль строки услуг.
if (!s.includes('.pg-uslugi {')) {
  const STYL2 = `
<style data-uslugi>
  #hero .pg-uslugi {
    margin-top: 18px; font-family: var(--mono); font-size: 11px;
    letter-spacing: .18em; line-height: 1.9; color: rgba(255,255,255,.72);
    max-width: 32ch;
  }
  @media (min-width: 900px) { #hero .pg-uslugi { font-size: 12.5px; max-width: none; margin-top: 22px; } }
</style>
`;
  s = s.replace('</head>', STYL2 + '</head>');
}

await writeFile(P, s, 'utf8');
console.log('готово: строка услуг, размеры картинок, светлая заставка');
