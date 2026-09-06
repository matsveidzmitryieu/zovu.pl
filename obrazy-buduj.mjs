// Сжатие картинок сайта БЕЗ смены имён: ссылки в HTML и в JS остаются как
// были, а файл становится легче. Прогрессивный JPEG к тому же показывается
// человеку раньше — сначала грубо, потом резко, вместо полосы сверху вниз.
//
// Правило: не трогаем то, что уже лёгкое (меньше 40 КБ) и то, что после
// сжатия стало БОЛЬШЕ — такое бывает у скриншотов с плоскими заливками.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import sharp from 'sharp';
import path from 'node:path';

const W = 'C:/Users/zahar/zovu-pl';
const pliki = (await readdir(W)).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

let przed = 0, po = 0, zmienione = 0, pominiete = 0;
for (const nazwa of pliki) {
  const sciezka = path.join(W, nazwa);
  const rozmiar = (await stat(sciezka)).size;
  przed += rozmiar;
  if (rozmiar < 40 * 1024) { po += rozmiar; pominiete++; continue; }

  const wejscie = await readFile(sciezka);
  const meta = await sharp(wejscie).metadata();
  // Шире 1600 на сайте не показывается нигде — лишние пиксели это чистый вес.
  const skala = meta.width > 1600 ? { width: 1600 } : null;

  let obraz = sharp(wejscie);
  if (skala) obraz = obraz.resize(skala);
  const wyjscie = /\.png$/i.test(nazwa) && meta.hasAlpha
    ? await obraz.png({ compressionLevel: 9, palette: true }).toBuffer()
    : await obraz.jpeg({ quality: 78, progressive: true, mozjpeg: true }).toBuffer();

  if (wyjscie.length >= rozmiar * 0.97) { po += rozmiar; pominiete++; continue; }
  await writeFile(sciezka, wyjscie);
  po += wyjscie.length;
  zmienione++;
}
console.log(`сжато файлов: ${zmienione}, оставлено как есть: ${pominiete}`);
console.log(`картинки: ${(przed / 1048576).toFixed(1)} -> ${(po / 1048576).toFixed(1)} МБ (минус ${Math.round((1 - po / przed) * 100)}%)`);
