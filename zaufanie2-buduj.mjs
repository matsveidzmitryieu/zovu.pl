// Блок «Jak pracujemy» — переделка.
//
// Захар спросил, вызывает ли он доверие. Разбор: нет, и вот почему.
//   1) Три шага — это обещание продавца, проверить его нельзя ни одним
//      кликом. Такой блок есть у каждого агентства, читатель его листает.
//   2) Шаг 03 дословно повторял первый экран: «Scenariusz, zdjęcia, montaż
//      i publikacja — po naszej stronie. Ty tylko odbierasz telefony».
//      Одна фраза дважды на странице ослабляет обе.
//   3) Самое сильное было закопано в середину списка. «Próbka przed umową»
//      — единственное на странице, что нам чего-то стоит и что клиент может
//      проверить прямо сейчас. Это оффер, а не пункт процесса.
//   4) «Bez niespodzianek» — оборонительный заголовок: сажает мысль, что
//      сюрпризы вообще возможны, отвечая на невысказанное возражение.
//
// Стало: заголовок — сам оффер, под ним проба и один шаг «разговор», рядом
// кнопка. Факты внизу не тронуты, они короткие и проверяемые. Обещаний про
// сроки ответа по-прежнему НЕТ намеренно.
//
// Ключи i18n новые (jp_tytul2, jp_lead, jp_rozmowa, jp_cta), старые ключи
// шагов удалены: переиспользованный ключ убивает новую разметку — applyLang
// честно вернёт старый текст поверх нового.

import { readFileSync, writeFileSync } from 'node:fs';

const PLIK = 'index.html';
let h = readFileSync(PLIK, 'utf8');
const bylo = h;

// ── 1. Разметка ─────────────────────────────────────────────────────────
const staryTytul = '<h2 class="sec-title" data-k="jp_title">Bez niespodzianek</h2>';
const nowyTytul = '<h2 class="sec-title" data-k="jp_tytul2">Najpierw próbka, potem umowa</h2>';
if (h.includes(staryTytul)) h = h.replace(staryTytul, nowyTytul);

const kroki = h.match(/ {4}<ol class="jp-kroki">[\s\S]*?<\/ol>\n/);
if (kroki) {
  h = h.replace(kroki[0],
`    <div class="jp-oferta">
      <p class="jp-lead" data-k="jp_lead">Zanim cokolwiek podpiszesz, zrobimy jedną rzecz na twojej firmie: rolkę, ekran strony albo post. Zobaczysz, jak to wygląda u ciebie, a nie w cudzym portfolio.</p>
      <p class="jp-rozmowa" data-k="jp_rozmowa">Zaczynamy od rozmowy na WhatsApp — odpowiada ten, kto będzie robił twoją robotę. Pytamy o firmę, o klientów i o to, co już próbowaliście. Bez działu sprzedaży i briefu na pięć stron.</p>
      <a class="jp-btn" href="https://wa.me/48571795097" data-k="jp_cta">Poproś o próbkę</a>
    </div>
`);
}

// ── 2. Словари: старые ключи шагов убрать, новые добавить ───────────────
const nowe = [
  // порядок словарей в файле: EN, RU, PL
  `    jp_tytul2:"First a sample, then a contract",
    jp_lead:"Before you sign anything, we make one thing for your business: a reel, one screen of your site or a post. You see how it looks for you, not in someone else's portfolio.",
    jp_rozmowa:"We start with a conversation on WhatsApp — the person who will do the work answers. We ask about your business, your clients and what you have already tried. No sales department, no five-page brief.",
    jp_cta:"Ask for a sample",
`,
  `    jp_tytul2:"Сначала проба, потом договор",
    jp_lead:"Прежде чем вы что-то подпишете, сделаем одну вещь на вашем материале: рилс, экран сайта или пост. Увидите, как это выглядит у вас, а не в чужом портфолио.",
    jp_rozmowa:"Начинаем с разговора в WhatsApp — отвечает тот, кто будет делать работу. Спрашиваем про бизнес, клиентов и что уже пробовали. Без отдела продаж и брифа на пять страниц.",
    jp_cta:"Попросить пробу",
`,
  `    jp_tytul2:"Najpierw próbka, potem umowa",
    jp_lead:"Zanim cokolwiek podpiszesz, zrobimy jedną rzecz na twojej firmie: rolkę, ekran strony albo post. Zobaczysz, jak to wygląda u ciebie, a nie w cudzym portfolio.",
    jp_rozmowa:"Zaczynamy od rozmowy na WhatsApp — odpowiada ten, kto będzie robił twoją robotę. Pytamy o firmę, o klientów i o to, co już próbowaliście. Bez działu sprzedaży i briefu na pięć stron.",
    jp_cta:"Poproś o próbkę",
`,
];
let i = 0;
h = h.replace(/ {4}jp_title:"[^"]*",\n(?: {4}jp_k\d[to]:"[^"]*",\n)+/g, () => nowe[i++] ?? '');
if (i !== 3 && i !== 0) throw new Error('Словари разошлись: заменено ' + i + ' из 3');

// ── 3. Стили ────────────────────────────────────────────────────────────
const style = `
<style data-zaufanie2>
  /* Заголовок секции был чёрным В ОБЕИХ темах — блок делали под светлую и в
     «наш режим» не заглянули, поэтому в тёмной он был чёрным по чёрному и
     не читался вовсе. Задаём цвет явно; -webkit-text-fill-color сбрасываем
     на всякий случай: соседние заголовки залиты градиентом через
     background-clip, и одним color такой не перекрасить. */
  #jak-pracujemy .sec-title { color: #fff; -webkit-text-fill-color: currentColor; }
  html.jasny #jak-pracujemy .sec-title { color: #16141b; }

  /* Оффер вместо списка шагов. Карточка одна, поэтому ширину держим по
     тексту: строка длиннее 62 знаков читается тяжело. */
  .jp-oferta {
    display: grid; gap: 16px; max-width: 64ch;
    padding: clamp(22px, 3vw, 30px); border-radius: 18px;
    border: 1px solid rgba(255,255,255,.10); background: rgba(255,255,255,.035);
  }
  html.jasny .jp-oferta { background: #fbfaf8; border-color: rgba(20,18,28,.1); }
  .jp-lead {
    margin: 0; font-family: 'Manrope', sans-serif; font-weight: 700;
    font-size: clamp(18px, 2.1vw, 23px); line-height: 1.42; color: #fff;
  }
  html.jasny .jp-lead { color: #16141b; }
  .jp-rozmowa {
    margin: 0; font-family: 'Manrope', sans-serif; font-weight: 500;
    font-size: 16px; line-height: 1.6; color: rgba(255,255,255,.72);
  }
  html.jasny .jp-rozmowa { color: #4a4757; }
  /* Кнопка та же, что в первом экране: зелёный WhatsApp узнают без подписи.
     Высота 48 px — цель для пальца, а не по ширине экрана: у планшета
     ширина большая, а палец тот же. */
  .jp-btn {
    justify-self: start; display: inline-flex; align-items: center;
    min-height: 48px; padding: 0 26px; border-radius: 40px;
    background: #25D366; color: #05230f; text-decoration: none;
    font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 15px;
    transition: transform .18s ease;
  }
  .jp-btn:hover { transform: translateY(-2px); }
  .jp-btn:focus-visible { outline: 3px solid var(--accent-2); outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) { .jp-btn { transition: none; } }

  /* На широком экране карточку разворачиваем в две колонки, иначе справа
     остаётся пустое поле в половину ширины. Медиазапрос стоит ПОСЛЕ
     базовых правил: при равной силе побеждает то, что объявлено позже, —
     из-за обратного порядка max-width уже один раз не сработал. */
  @media (min-width: 900px) {
    .jp-oferta {
      grid-template-columns: 1.05fr .95fr; gap: 24px 44px;
      max-width: none; align-items: start;
    }
    .jp-lead { grid-row: span 2; align-self: center; }
  }
</style>
`;
if (!h.includes('<style data-zaufanie2>')) h = h.replace('</head>', style + '</head>');

if (h !== bylo) { writeFileSync(PLIK, h); console.log('блок «Jak pracujemy» переделан'); }
else console.log('нечего менять');
