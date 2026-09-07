// Галерея портфолио: две поломки, о которых сказал Захар.
//
// 1. «При заходе в портфолио оно чёрное». Галерея сделана ДО светлой темы и
//    правил под `html.jasny` у неё не было ни одного — со светлой страницы
//    человек проваливался в чёрно-фиолетовый экран. Это не «дизайн», это
//    просто непокрытая тема.
//
// 2. «Когда свапаю тему, вообще на мейн экран свапает». Виноват вот этот
//    обработчик: «любой клик по ссылке или кнопке в шапке закрывает
//    галерею, чтобы ссылка сработала». Кнопка темы и переключатель языка
//    живут в той же шапке, но никуда не ведут — и человека выкидывало на
//    главную посреди просмотра. Закрываем только на том, что реально уводит.
//
// Скрипт идемпотентный.

import { readFileSync, writeFileSync } from 'node:fs';

const PLIK = 'index.html';
let h = readFileSync(PLIK, 'utf8');
const bylo = h;

// ── 1. Тема и язык больше не закрывают галерею ──────────────────────────
const staryHak = `  document.querySelectorAll('nav a, nav button').forEach(function (el) {
    el.addEventListener('click', function () {
      if (pfg.classList.contains('open')) close();
    });
  });`;
const nowyHak = `  document.querySelectorAll('nav a, nav button').forEach(function (el) {
    // Кнопка темы и языки стоят в той же шапке, но никуда не ведут:
    // закрывать из-за них галерею — значит выкидывать человека на главную
    // посреди просмотра. Закрываем только на том, что уводит со страницы.
    if (el.classList.contains('motyw') || el.classList.contains('lang')) return;
    el.addEventListener('click', function () {
      if (pfg.classList.contains('open')) close();
    });
  });`;
if (h.includes(staryHak)) {
  h = h.replace(staryHak, nowyHak);
  console.log('тема и язык больше не закрывают галерею');
}

// ── 2. Светлая тема галереи ─────────────────────────────────────────────
// Правила пишем через html.jasny — светлая тема у сайта надстройка, тёмная
// это сайт БЕЗ этих правил. Иначе появится вторая тема, которую чинить
// придётся дважды.
const style = `
<style data-galeria-jasna>
  html.jasny .pfg { background: linear-gradient(180deg, #fbfaf8 0%, #f1eff5 100%); }

  /* Плавающая таблетка снизу: на белом фоне тёмное стекло с фиолетовым
     свечением выглядело как чужой элемент. */
  html.jasny .pfg-nav {
    background: rgba(255,255,255,.92); border-color: rgba(20,18,28,.12);
    box-shadow: 0 14px 44px rgba(20,18,28,.18), 0 0 0 1px rgba(20,18,28,.05);
  }
  html.jasny .pfg-tab { color: #4a4757; }
  html.jasny .pfg-tab:hover { color: #16141b; }
  html.jasny .pfg-tab.active { color: #fff; }
  html.jasny .pfg-close { color: #4a4757; border-left-color: rgba(20,18,28,.14); }
  html.jasny .pfg-close:hover { color: #16141b; }

  /* Карточки. Фиолетовое гало на 130 px было рассчитано на чёрный фон; на
     белом оно превращается в грязное пятно, поэтому даём обычную тень. */
  html.jasny .pfg-card { background: #eceaf0; border-color: rgba(20,18,28,.12); }
  html.jasny .pfg-card:hover { border-color: var(--accent); box-shadow: 0 14px 40px rgba(20,18,28,.22); }
  html.jasny .pfg-browser,
  html.jasny .pfg-grid--video .pfg-card.pfg-vid,
  html.jasny .pfg-grid--gfx .pfg-card.pfg-gfx {
    border-color: rgba(20,18,28,.14);
    box-shadow: 0 18px 50px rgba(20,18,28,.18), 0 0 0 1px rgba(20,18,28,.06);
  }
  html.jasny .pfg-card.pfg-site:hover .pfg-browser,
  html.jasny .pfg-grid--video .pfg-card.pfg-vid:hover,
  html.jasny .pfg-grid--gfx .pfg-card.pfg-gfx:hover {
    border-color: var(--accent);
    box-shadow: 0 26px 70px rgba(124,58,237,.28), 0 0 0 1px rgba(124,58,237,.35);
  }

  /* Подпись под скриншотом «что сдали» была всегда светлой — раньше галерея
     открывалась тёмной в обеих темах. Теперь нет. */
  html.jasny .pfg-co { color: #6c6878; }

  /* Листалка страниц. */
  html.jasny .pfg-pager.show {
    background: rgba(255,255,255,.94); border-color: rgba(20,18,28,.12);
    box-shadow: 0 8px 26px rgba(20,18,28,.16);
  }
  html.jasny .pfg-pager button { color: #4a4757; border-color: rgba(20,18,28,.18); }
  html.jasny .pfg-pager button:active,
  html.jasny .pfg-pager button:hover { color: var(--accent); border-color: var(--accent); }
  html.jasny .pfg-pager-dots { color: #6c6878; }

  /* Просмотр картинки во весь экран остаётся тёмным намеренно: фотографию
     смотрят на нейтральном тёмном, так её видно, а не рамку вокруг. */
  html.jasny .pfg-lb { background: rgba(20,18,28,.9); }
  html.jasny .pfg-lb img {
    border-color: rgba(255,255,255,.45);
    box-shadow: 0 30px 90px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.12);
  }
</style>
`;
if (!h.includes('<style data-galeria-jasna>')) {
  h = h.replace('</head>', style + '</head>');
  console.log('светлая тема галереи добавлена');
}

// Старое пояснение рядом с .pfg-co больше не верно и вводит в заблуждение.
const stareTlumaczenie = `  /* Галерея открывается тёмным оверлеем в ОБЕИХ темах, поэтому подпись
     тут всегда светлая: тёмный текст на фиолетовом не читался. */`;
const noweTlumaczenie = `  /* Цвет подписи в светлой теме переопределён в data-galeria-jasna:
     до 08.09.2026 галерея была тёмной в обеих темах, теперь нет. */`;
if (h.includes(stareTlumaczenie)) h = h.replace(stareTlumaczenie, noweTlumaczenie);

if (h !== bylo) { writeFileSync(PLIK, h); console.log('index.html обновлён'); }
else console.log('нечего менять');
