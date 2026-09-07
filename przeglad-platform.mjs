// Проверка платформ, версия вторая: телефоны и планшеты проверяем КАК
// сенсорные (hasTouch), потому что правила размера кнопок теперь смотрят на
// способ ввода, а не на ширину экрана. Плюс проверяем галерею — она
// открывается поверх страницы, и до сих пор мы её ни разу не мерили.
import { chromium } from 'playwright';

const ADRES = process.argv[2] || 'https://zovu.pl/';
const EKRANY = [
  { nazwa: 'iPhone SE',      w: 375, h: 667, dotyk: true },
  { nazwa: 'iPhone 15',      w: 393, h: 852, dotyk: true },
  { nazwa: 'iPhone Pro Max', w: 430, h: 932, dotyk: true },
  { nazwa: 'iPad',           w: 768, h: 1024, dotyk: true },
  { nazwa: 'iPad poziomo',   w: 1024, h: 768, dotyk: true },
  { nazwa: 'Laptop',         w: 1440, h: 900, dotyk: false },
  { nazwa: 'Monitor',        w: 1920, h: 1080, dotyk: false },
];

const b = await chromium.launch();
const raport = [];
for (const e of EKRANY) {
  for (const motyw of ['jasny', 'ciemny']) {
    const k = await b.newContext({
      viewport: { width: e.w, height: e.h },
      hasTouch: e.dotyk,
      isMobile: e.dotyk && e.w < 700,
      deviceScaleFactor: 1,
    });
    const p = await k.newPage();
    await p.addInitScript((m) => { try { localStorage.setItem('motyw', m); localStorage.setItem('ck', '1'); } catch (x) {} }, motyw);
    await p.goto(ADRES, { waitUntil: 'load' });
    await p.waitForTimeout(3500);

    const wynik = await p.evaluate((dotyk) => {
      const ck = document.getElementById('cookie-banner'); if (ck) ck.style.display = 'none';
      const bledy = [];
      const W = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > W + 1) bledy.push('страница ездит вбок');
      // Кнопки меряем только там, где палец
      if (dotyk) {
        const male = [...document.querySelectorAll('a[href], button')]
          .filter((el) => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden'; })
          .filter((el) => { const r = el.getBoundingClientRect(); return r.height > 0 && r.width > 0 && (r.height < 38 || r.width < 24); })
          .slice(0, 5)
          .map((el) => (el.textContent.trim() || el.getAttribute('aria-label') || el.className).slice(0, 20));
        if (male.length) bledy.push('мелкие цели: ' + [...new Set(male)].join(' | '));
      }
      // Контраст текста на фоне секции — грубая проверка на «белое на белом»
      const zlyKontrast = [...document.querySelectorAll('h1, h2, h3, p')]
        .filter((el) => el.textContent.trim().length > 6)
        .filter((el) => {
          const s = getComputedStyle(el);
          if (s.webkitTextFillColor === 'rgba(0, 0, 0, 0)') return false;
          const m = s.color.match(/\d+/g); if (!m) return false;
          const jasnosc = (+m[0] * 299 + +m[1] * 587 + +m[2] * 114) / 1000;
          let el2 = el, tlo = null;
          while (el2 && !tlo) { const t = getComputedStyle(el2).backgroundColor.match(/\d+/g); if (t && +(getComputedStyle(el2).backgroundColor.match(/[\d.]+\)$/) || [1])[0] > 0.5 && (t[0] !== '0' || t[1] !== '0' || t[2] !== '0' || getComputedStyle(el2).backgroundColor !== 'rgba(0, 0, 0, 0)')) { if (getComputedStyle(el2).backgroundColor !== 'rgba(0, 0, 0, 0)') tlo = t; } el2 = el2.parentElement; }
          if (!tlo) return false;
          const jasnoscTla = (+tlo[0] * 299 + +tlo[1] * 587 + +tlo[2] * 114) / 1000;
          return Math.abs(jasnosc - jasnoscTla) < 60;
        })
        .slice(0, 3)
        .map((el) => el.textContent.trim().slice(0, 24));
      if (zlyKontrast.length) bledy.push('слабый контраст: ' + zlyKontrast.join(' | '));
      return { bledy };
    }, e.dotyk);

    // Галерея: открываем первую категорию и смотрим, не ломается ли
    let galeria = '';
    try {
      await p.click('.pf-cat', { timeout: 4000 });
      await p.waitForTimeout(1500);
      galeria = await p.evaluate(() => {
        const W = document.documentElement.clientWidth;
        if (document.documentElement.scrollWidth > W + 1) return 'галерея ездит вбок';
        const karty = document.querySelectorAll('.pfg-card').length;
        return karty ? '' : 'галерея пустая';
      });
      await p.keyboard.press('Escape');
    } catch { galeria = 'галерея не открылась'; }
    if (galeria) wynik.bledy.push(galeria);

    raport.push({ ekran: e.nazwa, motyw, ...wynik });
    await k.close();
  }
}
await b.close();

for (const r of raport) {
  console.log(`${r.bledy.length ? '✗' : '✓'} ${r.ekran.padEnd(15)} ${r.motyw.padEnd(7)} ${r.bledy.join(' · ')}`);
}
const zle = raport.filter((r) => r.bledy.length).length;
console.log(zle ? `\nпроблем на ${zle} из ${raport.length}` : `\nчисто: ${raport.length} прогонов, семь размеров, обе темы, галерея открывается везде`);
