// Пересчёт width/height в разметке после сжатия картинок.
//
// Часть файлов ужалась по ширине до 1600, а атрибуты в HTML остались от
// исходников. Браузер считает по ним пропорции — рассинхрон растянул бы
// картинку. Проходим все теги и приводим числа к тому, что реально в файле.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import path from 'node:path';

const W = 'C:/Users/zahar/zovu-pl';
const P = W + '/index.html';
let s = await readFile(P, 'utf8');

const tagi = [...s.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
const rozmiary = new Map();
let poprawione = 0;

for (const tag of tagi) {
  const src = (tag.match(/src="([^"]+)"/) || [])[1];
  if (!src || /^https?:|^data:/.test(src)) continue;
  if (!/\bwidth="(\d+)"/.test(tag)) continue;
  if (!rozmiary.has(src)) {
    try {
      const meta = await sharp(path.join(W, decodeURIComponent(src))).metadata();
      rozmiary.set(src, [meta.width, meta.height]);
    } catch { rozmiary.set(src, null); }
  }
  const wym = rozmiary.get(src);
  if (!wym) continue;
  const staraSzer = +tag.match(/\bwidth="(\d+)"/)[1];
  const staraWys = +(tag.match(/\bheight="(\d+)"/) || [, 0])[1];
  if (staraSzer === wym[0] && staraWys === wym[1]) continue;
  const nowyTag = tag
    .replace(/\bwidth="\d+"/, `width="${wym[0]}"`)
    .replace(/\bheight="\d+"/, `height="${wym[1]}"`);
  s = s.split(tag).join(nowyTag);
  poprawione++;
}

await writeFile(P, s, 'utf8');
console.log('размеров исправлено:', poprawione);
