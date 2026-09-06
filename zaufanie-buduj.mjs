// Блок доверия: «как работаем» + что именно сделали для каждого клиента.
//
// Цифры результата (сколько принесло) здесь НЕ выдумываются. Их либо
// достаём из реальной аналитики, либо не пишем: клиент проверяет первым
// делом чужой сайт, и одна ненайденная цифра стоит дороже, чем её
// отсутствие. Вместо этого пишем ПРОВЕРЯЕМОЕ — что именно сдали.
import { readFile, writeFile } from 'node:fs/promises';

const P = 'C:/Users/zahar/zovu-pl/index.html';
let s = await readFile(P, 'utf8');
if (s.includes('id="jak-pracujemy"')) { console.log('уже применено'); process.exit(0); }

// ── 1. Что сдали каждому клиенту (факты, не метрики) ─────────────────
const co = {
  'shot_fightmode.jpg': 'Strona gali · plakaty · spoty na LED',
  'shot_shaurma.jpg': 'Strona · menu · zdjęcia dań',
  'shot_beegelato.jpg': 'Strona · logo · film produktowy',
  'shot_maya.jpg': 'Strona · sesja produktowa · posty',
  'web_energia.jpg': 'Strona · formularze · automatyzacje',
  'shot_marketing.jpg': 'Landing kursu · reklamy · e-maile',
  'shot_jewelry.jpg': 'Strona · katalog · grafiki',
  'shot_gucio.jpg': 'Strona baru · menu · social media',
  'shot_pickactive.jpg': 'Strona · rolki · prowadzenie IG',
};
let dodane = 0;
for (const [plik, tekst] of Object.entries(co)) {
  const znak = `{ src: '${plik}',`;
  const i = s.indexOf(znak);
  if (i < 0) { console.log('нет карточки', plik); continue; }
  const koniecWiersza = s.indexOf('}', i);
  s = s.slice(0, koniecWiersza) + `, co: ${JSON.stringify(tekst)} ` + s.slice(koniecWiersza);
  dodane++;
}
console.log('подписей к сайтам:', dodane);

// Рендер карточки: подпись под окном браузера.
const stary = `            '<div class="pfg-shot"><img src="' + it.src + '" loading="lazy" alt=""></div>' +
          '</div>';`;
const nowy = `            '<div class="pfg-shot"><img src="' + it.src + '" loading="lazy" alt=""></div>' +
          '</div>' +
          (it.co ? '<div class="pfg-co">' + it.co + '</div>' : '');`;
if (!s.includes(stary)) throw new Error('не нашёл рендер карточки сайта');
s = s.replace(stary, nowy);

// ── 2. Секция «Jak pracujemy» ────────────────────────────────────────
// Три шага без обещаний, которых мы не можем сдержать. Никаких «odpowiedź
// w godzinę» — такое обещание либо выполняется всегда, либо роняет доверие
// ровно в тот момент, когда человек ждёт ответа.
const SEKCJA = `
<!-- JAK PRACUJEMY -->
<section id="jak-pracujemy">
  <div class="jp-in">
    <div class="sec-head">
      <div class="sec-label" data-k="jp_label">JAK PRACUJEMY</div>
      <h2 class="sec-title" data-k="jp_title">Bez niespodzianek</h2>
    </div>
    <ol class="jp-kroki">
      <li class="jp-krok">
        <span class="jp-nr">01</span>
        <h3 data-k="jp_k1t">Rozmowa, nie brief na pięć stron</h3>
        <p data-k="jp_k1o">Piszesz na WhatsApp — odpowiada ten, kto będzie robił twoją robotę. Pytamy o firmę, klientów i o to, co już próbowaliście. Bez działu sprzedaży.</p>
      </li>
      <li class="jp-krok">
        <span class="jp-nr">02</span>
        <h3 data-k="jp_k2t">Próbka przed umową</h3>
        <p data-k="jp_k2o">Pokazujemy, jak to będzie wyglądać u ciebie: jedna rolka, jeden ekran strony albo jeden post. Dopiero potem rozmawiamy o całości.</p>
      </li>
      <li class="jp-krok">
        <span class="jp-nr">03</span>
        <h3 data-k="jp_k3t">Publikujemy, ty odbierasz telefony</h3>
        <p data-k="jp_k3o">Scenariusz, zdjęcia, montaż i publikacja są po naszej stronie. Materiały zostają twoje — pliki źródłowe dostajesz zawsze.</p>
      </li>
    </ol>
    <div class="jp-fakty">
      <span class="jp-fakt"><b>7</b> <i data-k="jp_f1">lat na rynku</i></span>
      <span class="jp-fakt"><b>25M+</b> <i data-k="jp_f2">wyświetleń</i></span>
      <span class="jp-fakt"><b>3</b> <i data-k="jp_f3">osoby, zero pośredników</i></span>
      <span class="jp-fakt"><b>PL · EN · RU</b> <i data-k="jp_f4">rozmawiamy</i></span>
    </div>
  </div>
</section>
`;

// Ставим сразу после работ: человек посмотрел, что мы делаем, и следующий
// его вопрос — «а как это будет со мной».
const kotwica = '<!-- MARQUEE TICKER -->';
if (!s.includes(kotwica)) throw new Error('не нашёл место для секции');
s = s.replace(kotwica, SEKCJA + '\n' + kotwica);

// ── 3. Стили ─────────────────────────────────────────────────────────
const STYL = `
<style data-zaufanie>
  /* Подпись под скриншотом сайта: ЧТО сдали. Метрику результата сюда
     ставим только когда она есть в аналитике, а не «на глаз». */
  .pfg-co {
    margin-top: 10px; font-family: var(--mono); font-size: 11px;
    letter-spacing: .06em; color: rgba(255,255,255,.55); text-align: center;
    line-height: 1.5;
  }
  html.jasny .pfg-co { color: #5d5a6b; }

  #jak-pracujemy { padding: 110px clamp(20px, 4vw, 52px); background: #0d0820; }
  html.jasny #jak-pracujemy { background: #fff; }
  .jp-in { max-width: 1240px; margin: 0 auto; }
  .jp-kroki {
    list-style: none; margin: 54px 0 0; padding: 0;
    display: grid; gap: 26px; grid-template-columns: 1fr;
  }
  @media (min-width: 900px) { .jp-kroki { grid-template-columns: repeat(3, 1fr); gap: 30px; } }
  .jp-krok {
    padding: 30px 28px 32px; border-radius: 18px;
    background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
  }
  html.jasny .jp-krok { background: #fbfaf8; border-color: rgba(20,18,28,.1); }
  .jp-nr {
    font-family: var(--mono); font-size: 12px; letter-spacing: .2em;
    color: var(--accent-2); display: block; margin-bottom: 16px;
  }
  html.jasny .jp-nr { color: var(--accent); }
  .jp-krok h3 {
    font-family: var(--display); font-weight: 600; text-transform: uppercase;
    font-size: 21px; line-height: 1.12; margin: 0 0 12px; color: #fff;
  }
  html.jasny .jp-krok h3 { color: #16141b; }
  .jp-krok p {
    margin: 0; font-size: 15.5px; line-height: 1.6; color: rgba(255,255,255,.68);
  }
  html.jasny .jp-krok p { color: #4a4757; }
  /* Полоса фактов — только проверяемое: годы, наши просмотры, состав
     команды и языки. Ничего про сроки ответа и ничего про чужие продажи. */
  .jp-fakty {
    margin-top: 34px; display: flex; flex-wrap: wrap; gap: 14px 34px;
    padding-top: 26px; border-top: 1px solid rgba(255,255,255,.1);
  }
  html.jasny .jp-fakty { border-top-color: rgba(20,18,28,.12); }
  .jp-fakt { display: inline-flex; align-items: baseline; gap: 9px; }
  .jp-fakt b {
    font-family: var(--display); font-weight: 700; font-size: 27px; color: #fff;
  }
  html.jasny .jp-fakt b { color: #16141b; }
  .jp-fakt i {
    font-style: normal; font-family: var(--mono); font-size: 10.5px;
    letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.5);
  }
  html.jasny .jp-fakt i { color: #6c6878; }
</style>
`;
s = s.replace('</head>', STYL + '</head>');

await writeFile(P, s, 'utf8');
console.log('добавлена секция «Jak pracujemy» и подписи к работам');
