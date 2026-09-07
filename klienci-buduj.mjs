// Бегущая строка вместо слов об услугах — имена клиентов.
//
// Строка «SITES ✦ VIDEO ✦ AI ✦ AUTOMATION» повторяла то, что человек уже
// прочитал на первом экране, и была самым большим сплошным фиолетовым
// пятном на странице. Движение оставляем, смысл меняем: имена фирм, для
// которых мы реально работали, — это единственное, что читается как
// доказательство и чего больше нигде на странице нет.
//
// Имена берём те, что уже стоят в портфолио: выдумывать клиентов нельзя,
// и каждый из этих есть на сайте кликабельной работой.
import { readFile, writeFile } from 'node:fs/promises';

const P = 'C:/Users/zahar/zovu-pl/index.html';
let s = await readFile(P, 'utf8');
if (s.includes('marquee-klienci')) { console.log('уже применено'); process.exit(0); }

const KLIENCI = [
  'FIGHT MODE', 'BEE GELATO', 'MAG SHAURMA', 'MAYA GOLD',
  'PICKACTIVE', 'ENERGIA DLA BIZNESU', 'JEWELRY KATOWICE',
  'BAR GUCIO', 'GREEN SPORT',
];
const wiersz = KLIENCI.map((k) => `<span>${k}</span><span class="star">✦</span>`).join('\n    ');

const start = s.indexOf('<div class="marquee" aria-hidden="true">');
const koniec = s.indexOf('</div>', s.indexOf('</div>', start) + 6) + 6;
if (start < 0) throw new Error('не нашёл бегущую строку');

// Дублируем набор дважды: без второй копии лента рвётся в конце круга.
const NOWA = `<div class="marquee marquee-klienci" aria-label="Klienci ZOVU">
  <div class="marquee-track">
    ${wiersz}
    ${wiersz}
  </div>
</div>`;
s = s.slice(0, start) + NOWA + s.slice(koniec);

const STYL = `
<style data-klienci>
  /* Лента клиентов: в тёмной теме остаётся фирменной фиолетовой, в светлой
     становится белой с тёмными буквами — сплошная фиолетовая полоса посреди
     светлой страницы была самым громким пятном, а сказать ей нечего. */
  .marquee-klienci { padding: 26px 0; }
  .marquee-klienci .marquee-track { font-size: clamp(24px, 3.2vw, 42px); letter-spacing: .01em; }
  .marquee-klienci .marquee-track span { padding: 0 24px; }
  html.jasny .marquee-klienci {
    background: #fff; color: #16141b;
    border-top: 1px solid rgba(20,18,28,.1); border-bottom: 1px solid rgba(20,18,28,.1);
  }
  html.jasny .marquee-klienci .star { color: var(--accent); }
  @media (prefers-reduced-motion: reduce) {
    .marquee-klienci .marquee-track { animation: none; }
    .marquee-klienci { overflow-x: auto; }
  }
</style>
`;
s = s.replace('</head>', STYL + '</head>');

await writeFile(P, s, 'utf8');
console.log('лента клиентов поставлена:', KLIENCI.length, 'имён');
