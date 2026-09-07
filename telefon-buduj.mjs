// Правка первого экрана НА ТЕЛЕФОНЕ. Две жалобы Захара по живому сайту:
// заголовок сплющён и лица человека на кадре не видно.
//
// Почему так вышло. Кадр hero_montaz.jpg — горизонтальный, 16:9. На телефоне
// блок кадра почти квадратный, значит cover масштабирует картинку ПО ВЫСОТЕ и
// режет её по бокам: монитор с лицом уезжает в правый угол и становится
// размером с ноготь, а поверх него ложится белый заголовок. Плюс line-height
// у h1 был .94 — три строки капслоком слипались в один кирпич.
//
// Что делает скрипт (идемпотентно):
//   1) режет из исходного кадра ОТДЕЛЬНУЮ вертикальную версию для телефона,
//      где лицо в центре и крупно, а под ним осталась монтажная линейка;
//   2) подставляет её через <picture> только на ширине до 700px;
//   3) даёт заголовку воздух и поднимает высоту блока так, чтобы лицо
//      оказалось НИЖЕ плавающей шапки и ВЫШЕ заголовка;
//   4) уносит строку услуг из-под заголовка в блок ниже — без этого текст
//      наезжает на подбородок.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const PLIK = 'index.html';
const KADR_TEL = 'hero_montaz_tel.jpg';
const ZRODLO = 'D:/My AI/Zovu.pl/Portfolio/Wideo-Portfolio/A WIDEO CV.mp4';

// ── 1. Кадр для телефона ────────────────────────────────────────────────
// Исходник 1920×1080, кадр на 6,5 с. Лицо на мониторе в точке (1290, 276).
// Окно 700×1030 от левого верхнего угла (905, 0). Оно начинается от самого
// верха, потому что выше лица в кадре всего 156 px — только так лицо
// оказывается ниже плавающей шапки сайта.
// Ширину выбирали не «покрупнее лицо», а «видно, что он монтирует»: в окно
// целиком входит монтажная линейка с клипами и рука на клавиатуре в левом
// нижнем углу. Первая версия была ýже (588×789) — Захар: «чуть близко и не
// видно, что его монтируют». Пропорция 0,68 совпадает с телефонами от SE до
// Pro Max, поэтому по бокам почти ничего не срезается.
// Увеличиваем вдвое: 700 px на экран с тройной плотностью — это мыло.
if (!existsSync(KADR_TEL)) {
  if (!existsSync(ZRODLO)) throw new Error('Нет исходного видео: ' + ZRODLO);
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error',
    '-ss', '6.5', '-i', ZRODLO, '-frames:v', '1',
    '-vf', 'crop=700:1030:905:0,scale=1400:2060:flags=lanczos',
    '-q:v', '4', KADR_TEL, '-y',
  ]);
  console.log('кадр для телефона собран:', KADR_TEL);
}

let h = readFileSync(PLIK, 'utf8');
const bylo = h;

// ── 2. <picture>: на телефоне другой файл ───────────────────────────────
const staryImg = '<img width="1600" height="900" class="pg-foto" src="hero_montaz.jpg" alt="Montaż rolki: oś czasu na ekranie" fetchpriority="high">';
const nowyImg =
  '<picture>' +
    `<source media="(max-width: 700px)" srcset="${KADR_TEL}" width="1400" height="2060">` +
    staryImg +
  '</picture>';
if (h.includes(staryImg) && !h.includes('<source media="(max-width: 700px)"')) {
  h = h.replace(staryImg, nowyImg);
  console.log('подставлен <picture>');
}

// ── 3. Строка услуг — копия ПОД лентой рилсов ───────────────────────────
// Захар: «тут как-то много текста». До кнопки шли подряд два надстрочника
// капслоком с разрядкой — серый и фиолетовый; по отдельности нормальные,
// вместе читаются одной стеной, и глаз проскакивает мимо кнопки. Услуги
// не выкидываем (без них сайт говорит только про рилсы, и человек с
// запросом «сайт» уходит) — ставим ПОСЛЕ ленты, тише и мельче. Порядок
// для читателя: обещание → доказательство → кнопка.
// Ключ data-k тот же: applyLang идёт по querySelectorAll, обе копии
// переводятся сами, новых ключей заводить не нужно.
const kotwica = '      </div>\n    </div>\n  </div>\n</section>';
const kopia = '      </div>\n    </div>\n' +
  '    <div class="pg-uslugi pg-uslugi-tel" data-k="hero_uslugi">STRONY · WIDEO · SOCIAL MEDIA · REKLAMA · AUTOMATYZACJA</div>\n' +
  '  </div>\n</section>';
if (h.includes(kotwica) && !h.includes('pg-uslugi-tel')) {
  h = h.replace(kotwica, kopia);
  console.log('строка услуг поставлена под лентой рилсов');
}

// ── 4. Стили ────────────────────────────────────────────────────────────
const style = `
<style data-telefon>
  /* Телефон: кадр стал вертикальным, значит блоку нужна высота, иначе лицо
     снова окажется под шапкой. Минимум в ПИКСЕЛЯХ, а не только в svh: шапка
     у всех телефонов одной высоты, а svh на маленьком экране даёт мало. */
  @media (max-width: 700px) {
    #hero .pg-gora { min-height: clamp(580px, 70svh, 660px); }
    #hero .pg-foto { object-position: 50% 0%; }

    /* Затемнение: середину отпускаем, чтобы лицо не уходило в серость,
       а низ давим сильнее — там лежит белый заголовок. */
    #hero .pg-cien {
      background: linear-gradient(180deg,
        rgba(5,5,5,.55) 0%, rgba(5,5,5,.12) 30%, rgba(5,5,5,.10) 50%,
        rgba(5,5,5,.60) 74%, rgba(5,5,5,.90) 100%);
    }

    /* Воздух в заголовке: .94 склеивало три строки капслоком в кирпич. */
    #hero .pg-h1 { font-size: clamp(38px, 11.5vw, 60px); line-height: 1.06; }
    #hero .pg-eyebrow { margin-bottom: 16px; }
    #hero .pg-tresc { padding: 74px 20px 44px; }

    /* Строка услуг из-под заголовка уходит под ленту рилсов: под заголовком
       три строки моноширинным наезжали на подбородок, а в блоке с кнопкой
       она была вторым надстрочником подряд. Отступ свой: лента идёт во всю
       ширину, поля есть только у соседнего блока. */
    #hero .pg-tresc .pg-uslugi { display: none; }
    #hero .pg-uslugi-tel {
      display: block; margin: 0; max-width: none;
      padding: 0 22px; opacity: .72;
    }
  }
  @media (min-width: 701px) { #hero .pg-uslugi-tel { display: none; } }
  html.jasny #hero .pg-uslugi-tel { color: #3f3c4b; }
</style>
`;
if (!h.includes('<style data-telefon>')) {
  h = h.replace('</head>', style + '</head>');
  console.log('стили телефона добавлены');
}

if (h !== bylo) { writeFileSync(PLIK, h); console.log('index.html обновлён'); }
else console.log('нечего менять');
