// Главная дыра по весу: в бегущей строке WIDEO три ролика стояли с
// `autoplay`. Браузер при этом качает файл ЦЕЛИКОМ, не спрашивая, виден ли
// он — а строка продублирована для бесшовной прокрутки, значит каждый файл
// уезжал по два раза. Итого почти 10 МБ на странице, которую человек ещё
// даже не пролистал до работ.
//
// Лечение: лёгкие копии (480px вместо 1280) плюс загрузка по факту показа.
import { readFile, writeFile } from 'node:fs/promises';

const P = 'C:/Users/zahar/zovu-pl/index.html';
let s = await readFile(P, 'utf8');

const zamiany = [
  ['preview1.mp4', 'pas1.mp4'],
  ['preview2.mp4', 'pas2.mp4'],
  ['preview3_small.mp4', 'pas3.mp4'],
];
let n = 0;
for (const [stary, nowy] of zamiany) {
  const przed = s;
  s = s.split(`class="pf-strip-vid" src="${stary}"`).join(`class="pf-strip-vid" src="${nowy}"`);
  if (s !== przed) n++;
}
// autoplay заставляет качать целиком — снимаем, играть будет наблюдатель.
s = s.split('class="pf-strip-vid" src="pas').join('class="pf-strip-vid" data-leniwy src="pas');
s = s.replace(/(<video class="pf-strip-vid"[^>]*?) muted autoplay loop playsinline preload="metadata"/g,
  '$1 muted loop playsinline preload="none"');

if (!s.includes('leniwe-paski')) {
  const SKRYPT = `
<script data-leniwe-paski>
// Ролики в строке работ включаются, только когда строка попала на экран.
// До этого браузер не тянет ни байта: preload="none" плюс наблюдатель.
(function () {
  var filmy = document.querySelectorAll('video.pf-strip-vid[data-leniwy]');
  if (!filmy.length) return;
  var obs = new IntersectionObserver(function (wpisy) {
    wpisy.forEach(function (w) {
      var v = w.target;
      if (w.isIntersecting) { v.play().catch(function () {}); }
      else { v.pause(); }
    });
  }, { threshold: 0.1, rootMargin: '150px' });
  filmy.forEach(function (v) { obs.observe(v); });
})();
</script>
`;
  s = s.replace('</body>', SKRYPT + '</body>');
}

await writeFile(P, s, 'utf8');
console.log('заменено роликов:', n, '· autoplay снят, загрузка по показу');
