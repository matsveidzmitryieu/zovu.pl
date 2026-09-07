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

  /* Плавающая таблетка снизу: стекло становится белым, но фирменное
     свечение остаётся — на белом оно просто плотнее и ближе к элементу. */
  html.jasny .pfg-nav {
    background: rgba(255,255,255,.92); border-color: rgba(124,58,237,.28);
    box-shadow:
      0 14px 44px rgba(124,58,237,.28),
      0 0 44px rgba(139,92,246,.22),
      0 0 0 1px rgba(124,58,237,.16);
  }
  html.jasny .pfg-tab { color: #4a4757; }
  html.jasny .pfg-tab:hover { color: #16141b; }
  html.jasny .pfg-tab.active { color: #fff; }
  html.jasny .pfg-close { color: #4a4757; border-left-color: rgba(20,18,28,.14); }
  html.jasny .pfg-close:hover { color: #16141b; }

  /* Карточки. Неоновое свечение остаётся — оно фирменное, — но перенастроено
     под белый фон. В тёмной теме гало 130 px при прозрачности .8 читается
     как свет; на белом такой же радиус даёт серую грязь, потому что светлее
     фона уже некуда. Поэтому на светлой: радиус вдвое меньше, цвет плотнее
     и добавлено фиолетовое кольцо в 1 px — свечение видно, грязи нет. */
  html.jasny .pfg-card { background: #eceaf0; border-color: rgba(124,58,237,.28); }
  html.jasny .pfg-browser,
  html.jasny .pfg-grid--video .pfg-card.pfg-vid,
  html.jasny .pfg-grid--gfx .pfg-card.pfg-gfx {
    border-color: rgba(124,58,237,.45);
    box-shadow:
      0 0 0 1px rgba(124,58,237,.28),
      0 12px 36px rgba(124,58,237,.30),
      0 0 72px rgba(139,92,246,.44);
  }
  html.jasny .pfg-card:hover,
  html.jasny .pfg-card.pfg-site:hover .pfg-browser,
  html.jasny .pfg-grid--video .pfg-card.pfg-vid:hover,
  html.jasny .pfg-grid--gfx .pfg-card.pfg-gfx:hover {
    border-color: var(--accent);
    box-shadow:
      0 0 0 1px rgba(124,58,237,.55),
      0 18px 48px rgba(124,58,237,.38),
      0 0 90px rgba(139,92,246,.5);
  }

  /* Подпись под скриншотом «что сдали» была всегда светлой — раньше галерея
     открывалась тёмной в обеих темах. Теперь нет. */
  html.jasny .pfg-co { color: #6c6878; }

  /* Листалка страниц. */
  html.jasny .pfg-pager.show {
    background: rgba(255,255,255,.94); border-color: rgba(124,58,237,.25);
    box-shadow: 0 8px 26px rgba(124,58,237,.26), 0 0 34px rgba(139,92,246,.18);
  }
  html.jasny .pfg-pager button { color: #4a4757; border-color: rgba(20,18,28,.18); }
  html.jasny .pfg-pager button:active,
  html.jasny .pfg-pager button:hover { color: var(--accent); border-color: var(--accent); }
  html.jasny .pfg-pager-dots { color: #6c6878; }

  /* Просмотр картинки во весь экран остаётся тёмным намеренно: фотографию
     смотрят на нейтральном тёмном, так её видно, а не рамку вокруг. */
  html.jasny .pfg-lb { background: rgba(20,18,28,.9); }
  /* Тень самой картинки НЕ трогаем: фон под ней тёмный, там родное неоновое
     гало работает как задумано. */
</style>
`;
if (!h.includes('<style data-galeria-jasna>')) {
  h = h.replace('</head>', style + '</head>');
  console.log('светлая тема галереи добавлена');
}

// ── 3. Нижняя панель на телефоне не лезет поверх галереи ────────────────
// Захар: «на телефоне при заходе в портфолио Prace и WhatsApp остаются, и
// нельзя нажать Strony и Grafikę». Панель висит внизу на z-index 995, а
// вкладки галереи — таблетка на bottom: 18px: они физически в одном месте,
// и панель накрывала половину вкладок. Пока галерея открыта, панель уезжает
// вниз тем же движением, каким она приходит; закроется галерея — вернётся
// сама, за это отвечает тот же селектор, никакого JS.
const stylPasek = `
<style data-galeria-pasek>
  .pfg.open ~ .pasek { transform: translateY(140%); pointer-events: none; }
</style>
`;
if (!h.includes('<style data-galeria-pasek>')) {
  h = h.replace('</head>', stylPasek + '</head>');
  console.log('нижняя панель убрана из-под галереи');
}

// Старое пояснение рядом с .pfg-co больше не верно и вводит в заблуждение.
const stareTlumaczenie = `  /* Галерея открывается тёмным оверлеем в ОБЕИХ темах, поэтому подпись
     тут всегда светлая: тёмный текст на фиолетовом не читался. */`;
const noweTlumaczenie = `  /* Цвет подписи в светлой теме переопределён в data-galeria-jasna:
     до 08.09.2026 галерея была тёмной в обеих темах, теперь нет. */`;
if (h.includes(stareTlumaczenie)) h = h.replace(stareTlumaczenie, noweTlumaczenie);

if (h !== bylo) { writeFileSync(PLIK, h); console.log('index.html обновлён'); }
else console.log('нечего менять');
