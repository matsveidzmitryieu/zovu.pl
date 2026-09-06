// Две правки по фидбеку Захара.
//
// 1. Полоса фактов в «Jak pracujemy» повторяла то, что уже стоит выше:
//    7 lat и 25M+ есть в белой полосе под первым экраном. Повтор цифры
//    читается не как усиление, а как будто её больше нечем подпереть.
//    Оставляем только то, чего больше нигде нет.
//
// 2. Команда возвращается на ТЁМНОЕ. Портреты сняты на чёрном поролоне, и
//    на белом фоне тёмные плитки выглядели дырами. Секция снова тёмная в
//    обеих темах, а стыки с белым закрыты мягкими швами — светлый сайт с
//    одной тёмной секцией читается как приём, а не как недоделка.
import { readFile, writeFile } from 'node:fs/promises';

const P = 'C:/Users/zahar/zovu-pl/index.html';
let s = await readFile(P, 'utf8');
if (s.includes('data-zespol-ciemny')) { console.log('уже применено'); process.exit(0); }

// ── 1. Полоса фактов: убираем повторы ────────────────────────────────
const stareFakty = `    <div class="jp-fakty">
      <span class="jp-fakt"><b>7</b> <i data-k="jp_f1">lat na rynku</i></span>
      <span class="jp-fakt"><b>25M+</b> <i data-k="jp_f2">wyświetleń</i></span>
      <span class="jp-fakt"><b>3</b> <i data-k="jp_f3">osoby, zero pośredników</i></span>
      <span class="jp-fakt"><b>PL · EN · RU</b> <i data-k="jp_f4">rozmawiamy</i></span>
    </div>`;
const noweFakty = `    <div class="jp-fakty">
      <span class="jp-fakt"><b>3</b> <i data-k="jp_f3">osoby, zero pośredników</i></span>
      <span class="jp-fakt"><b>PL · EN · RU</b> <i data-k="jp_f4">rozmawiamy w twoim języku</i></span>
      <span class="jp-fakt"><b>100%</b> <i data-k="jp_f5">plików źródłowych zostaje u ciebie</i></span>
    </div>`;
if (!s.includes(stareFakty)) throw new Error('не нашёл полосу фактов');
s = s.replace(stareFakty, noweFakty);

// ── 2. Команда снова тёмная ──────────────────────────────────────────
const stareStyle = `  html.jasny #team { background: #fff; position: relative; }
  html.jasny #team .tm { background: #16141b; border-color: rgba(20,18,28,.1); box-shadow: 0 20px 48px rgba(20,18,28,.2); }
  html.jasny #team .tm:hover { box-shadow: 0 30px 66px rgba(124,58,237,.34); }`;
const noweStyle = `  /* Команда остаётся ТЁМНОЙ и в светлой теме: портреты сняты на чёрном
     акустическом поролоне, на белом фоне они выглядели тремя дырами.
     Одна тёмная секция посреди светлого сайта — это приём, а не сбой,
     если стыки закрыты швами (ниже). */
  html.jasny #team { position: relative; }`;
if (!s.includes(stareStyle)) throw new Error('не нашёл стили команды');
s = s.replace(stareStyle, noweStyle);

// Шов сверху (белые работы → тёмная команда) и снизу (тёмная команда →
// белое «Jak pracujemy»). Оба только в светлой теме: в тёмной стыка нет.
const stareSzew = `  html.jasny #team::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 150px; z-index: 0;
    background: linear-gradient(180deg,
      rgba(255,255,255,0) 0%, rgba(124,58,237,.18) 44%, rgba(22,14,46,.88) 86%, #160e2e 100%);
    pointer-events: none;
  }`;
const noweSzew = `  html.jasny #team::before {
    content: ''; position: absolute; left: 0; right: 0; top: -1px; height: 140px; z-index: 0;
    background: linear-gradient(180deg,
      #fff 0%, rgba(255,255,255,.86) 16%, rgba(124,58,237,.22) 58%, rgba(22,14,46,0) 100%);
    pointer-events: none;
  }
  html.jasny #team::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 140px; z-index: 0;
    background: linear-gradient(180deg,
      rgba(22,14,46,0) 0%, rgba(124,58,237,.22) 42%, rgba(255,255,255,.86) 84%, #fff 100%);
    pointer-events: none;
  }`;
if (!s.includes(stareSzew)) throw new Error('не нашёл шов команды');
s = s.replace(stareSzew, noweSzew);

// Заголовок команды снова светлый — он теперь на тёмном.
s = s.replace(
  '  html.jasny #portfolio .sec-title, html.jasny #team .sec-title {\n    background: none; color: #16141b; -webkit-text-fill-color: #16141b;\n  }\n  html.jasny #portfolio .sec-label, html.jasny #team .sec-label { color: var(--accent); }',
  '  html.jasny #portfolio .sec-title {\n    background: none; color: #16141b; -webkit-text-fill-color: #16141b;\n  }\n  html.jasny #portfolio .sec-label { color: var(--accent); }'
);

s = s.replace('<style data-zaufanie>', '<style data-zaufanie data-zespol-ciemny>');
await writeFile(P, s, 'utf8');
console.log('полоса фактов без повторов, команда снова тёмная со швами');
