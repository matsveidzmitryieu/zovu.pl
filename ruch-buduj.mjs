// Три правки по замечаниям с монитора Захара.
import { readFile, writeFile } from 'node:fs/promises';

const P = 'C:/Users/zahar/zovu-pl/index.html';
let s = await readFile(P, 'utf8');
if (s.includes('data-ruch')) { console.log('уже применено'); process.exit(0); }

// ── 1. Имена клиентов становятся ссылками ────────────────────────────
// «Либо убрать, либо сделать активным» — делаем активным: имя ведёт в
// портфолио. Лента перестаёт быть украшением и становится навигацией.
const start = s.indexOf('<div class="marquee marquee-klienci"');
const koniec = s.indexOf('</div>', s.indexOf('</div>', start) + 6) + 6;
const kawalek = s.slice(start, koniec);
const zLinkami = kawalek.replace(
  /<span>([A-ZĄĆĘŁŃÓŚŹŻ0-9 .-]+)<\/span>/g,
  '<a href="#portfolio">$1</a>'
);
s = s.slice(0, start) + zLinkami + s.slice(koniec);

// ── 2. Полоса фактов: три равные строки вместо трёх разных «цифр» ────
// Раньше в ряд стояли «3», «PL · EN · RU» и «100%» — разные по смыслу и по
// ширине, отсюда ощущение кривизны, которое не лечится выравниванием.
// Это не цифры результата, а обещания, поэтому и подаём их как обещания.
const stareFakty = s.slice(s.indexOf('<div class="jp-fakty">'), s.indexOf('</div>', s.indexOf('<div class="jp-fakty">')) + 6);
const noweFakty = `<ul class="jp-fakty">
      <li data-k="jp_f3">Trzy osoby — piszesz do tego, kto robi robotę</li>
      <li data-k="jp_f4">Rozmawiamy po polsku, angielsku i rosyjsku</li>
      <li data-k="jp_f5">Pliki źródłowe zawsze zostają u ciebie</li>
    </ul>`;
s = s.replace(stareFakty, noweFakty);

const slowa = {
  en: {
    jp_f3: 'Three people — you write to the one doing the work',
    jp_f4: 'We speak Polish, English and Russian',
    jp_f5: 'Source files always stay with you',
  },
  pl: {
    jp_f3: 'Trzy osoby — piszesz do tego, kto robi robotę',
    jp_f4: 'Rozmawiamy po polsku, angielsku i rosyjsku',
    jp_f5: 'Pliki źródłowe zawsze zostają u ciebie',
  },
  ru: {
    jp_f3: 'Три человека — пишете тому, кто делает работу',
    jp_f4: 'Говорим по-польски, по-английски и по-русски',
    jp_f5: 'Исходники всегда остаются у вас',
  },
};
for (const [jezyk, pary] of Object.entries(slowa)) {
  for (const [k, v] of Object.entries(pary)) {
    const re = new RegExp(`(\\n  ${jezyk}: \\{[\\s\\S]*?)\\n    ${k}:"[^"]*",`);
    s = s.replace(re, `$1\n    ${k}:${JSON.stringify(v)},`);
  }
}

// ── 3. Стили ─────────────────────────────────────────────────────────
const STYL = `
<style data-ruch>
  /* Полоса обещаний: три равные строки с галочкой. Ровность тут даёт не
     выравнивание, а одинаковость — одинаковый тип строки, один размер,
     одна высота. Прежний ряд смешивал число, языки и процент, и никакая
     сетка этого не спасала. */
  .jp-fakty {
    list-style: none; margin: 30px 0 0; padding: 26px 0 0;
    display: grid; gap: 14px; grid-template-columns: 1fr;
    border-top: 1px solid rgba(255,255,255,.1);
  }
  html.jasny .jp-fakty { border-top-color: rgba(20,18,28,.12); }
  @media (min-width: 900px) { .jp-fakty { grid-template-columns: repeat(3, 1fr); gap: 16px 36px; } }
  .jp-fakty li {
    display: grid; grid-template-columns: 20px 1fr; gap: 10px; align-items: start;
    font-family: 'Manrope', sans-serif; font-size: 15.5px; line-height: 1.5;
    color: rgba(255,255,255,.72);
  }
  html.jasny .jp-fakty li { color: #3f3c4b; }
  .jp-fakty li::before {
    content: '✓'; color: var(--accent-2); font-weight: 800; line-height: 1.4;
  }
  html.jasny .jp-fakty li::before { color: var(--accent); }

  /* Имена клиентов — ссылки, но выглядят как часть ленты. */
  .marquee-klienci a { color: inherit; text-decoration: none; display: inline-block; padding: 0 24px; }
  .marquee-klienci a:hover { color: #fff; }
  html.jasny .marquee-klienci a:hover { color: var(--accent); }

  /* ГЛАВНОЕ. У Захара в Windows выключены анимации, и браузер сообщает
     сайту prefers-reduced-motion: reduce — прежнее правило честно
     ОСТАНАВЛИВАЛО ленты и включало полосу прокрутки. Для человека с
     укачиванием от движения полная остановка правильна, но бегущая строка
     без движения выглядит поломкой. Компромисс: движение остаётся, но
     втрое медленнее и без рывков, а полосы прокрутки нет. */
  @media (prefers-reduced-motion: reduce) {
    .marquee-klienci .marquee-track { animation: marquee 150s linear infinite !important; }
    .marquee-klienci { overflow: hidden !important; }
    #hero .pg-tor { animation: pgJedzie 170s linear infinite !important; }
    #hero .pg-tasma { overflow: hidden !important; }
    .pf-strip-track { animation: pfscroll 140s linear infinite !important; }
  }
</style>
`;
s = s.replace('</head>', STYL + '</head>');

await writeFile(P, s, 'utf8');
console.log('готово: ссылки в ленте, новая полоса обещаний, медленное движение вместо остановки');
