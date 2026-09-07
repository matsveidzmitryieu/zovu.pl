// Кадр героя НА КОМПЬЮТЕРЕ — отодвинуть камеру.
//
// Захар: «на компе митину фотку тоже чуть поменьше, но на телефоне оставить
// какую есть».
//
// Почему просто «уменьшить» не работает. У кадра `object-fit: cover`, и на
// широком экране масштаб задаёт ШИРИНА: контейнер 1920 px, картинка была
// 1600 px — значит браузер РАСТЯГИВАЛ её в 1,2 раза и резал по высоте.
// Разрешение файла тут ни при чём: хоть 1600, хоть 1920 — на экране размер
// один и тот же. Уменьшить лицо можно только одним способом — дать картинке
// поле по бокам, чтобы сама сцена занимала меньше её ширины.
//
// Поэтому холст расширен с 16:9 до 2240×1080: настоящий кадр 1920 px стоит
// по центру, а по 160 px слева и справа — размытая и притемнённая растяжка
// его же краёв. Слева кадр и так чёрный, справа тёмно-фиолетовая стена, шва
// не видно. На экране 1920 масштаб падает с 1,2 до 0,857: лицо меньше почти
// на треть, и в кадр входит рука на клавиатуре, которой раньше не было.
//
// Телефон не трогаем: у него свой файл hero_montaz_tel.jpg и своя обрезка,
// см. telefon-buduj.mjs.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const PLIK = 'index.html';
const KADR = 'hero_montaz.jpg';
const ZRODLO = 'D:/My AI/Zovu.pl/Portfolio/Wideo-Portfolio/A WIDEO CV.mp4';
const STARY = '<img width="1600" height="900" class="pg-foto" src="hero_montaz.jpg"';
const NOWY = '<img width="2240" height="1080" class="pg-foto" src="hero_montaz.jpg"';

let h = readFileSync(PLIK, 'utf8');

if (h.includes(STARY)) {
  if (!existsSync(ZRODLO)) throw new Error('Нет исходного видео: ' + ZRODLO);
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error',
    '-ss', '6.5', '-i', ZRODLO, '-frames:v', '1',
    '-filter_complex',
      '[0:v]split=3[main][l][r];' +
      '[l]crop=60:1080:0:0,scale=160:1080,gblur=sigma=40,eq=brightness=-0.10[lb];' +
      '[r]crop=60:1080:1860:0,scale=160:1080,gblur=sigma=40,eq=brightness=-0.10[rb];' +
      '[lb][main][rb]hstack=inputs=3[out]',
    '-map', '[out]', '-q:v', '4', KADR, '-y',
  ]);
  // Размеры в разметке пересчитываем вместе с файлом: разъехавшиеся
  // width/height рвут пропорцию до загрузки картинки.
  h = h.replace(STARY, NOWY);
  writeFileSync(PLIK, h);
  console.log('кадр расширен до 2240×1080, размеры в разметке обновлены');
}

// На ноутбуке 1440 полоса кадра всего 432 px, и при окне «от 16% сверху»
// макушка уезжала под плавающую шапку — голова была срезана. Опускаем окно
// до 8%: на широком мониторе полоса выше и правило не нужно, там своё.
const style = `
<style data-kadr-pc>
  @media (min-width: 900px) and (max-width: 1499px) {
    #hero .pg-foto { object-position: 50% 8%; }
  }
</style>
`;
if (!h.includes('<style data-kadr-pc>')) {
  h = h.replace('</head>', style + '</head>');
  writeFileSync(PLIK, h);
  console.log('окно кадра на ноутбуке опущено');
}
