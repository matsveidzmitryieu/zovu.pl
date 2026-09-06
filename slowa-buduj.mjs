// Свои ключи для нового первого экрана.
//
// Первый заход переиспользовал старые (hero_l1, hero_l3) — и applyLang
// честно вернул на место прежний заголовок «Tworzymy … sprzedają.» поверх
// нового. Ключи должны быть новыми, иначе словарь всегда победит разметку.
import { readFile, writeFile } from 'node:fs/promises';

const P = 'C:/Users/zahar/zovu-pl/index.html';
let s = await readFile(P, 'utf8');
if (s.includes('hero_n1:')) { console.log('ключи уже есть'); process.exit(0); }

const slowa = {
  en: {
    hero_tagn: 'CREATIVE AGENCY · KATOWICE',
    hero_n1: 'A reel a day.',
    hero_n2: 'Without your time',
    hero_prace: 'LATEST REELS FOR CLIENTS',
    hero_opis: 'Script, filming, editing and publishing — on us. You just answer the phone.',
    hero_cta1: 'See our work',
    hero_cta2: 'Message on WhatsApp',
  },
  pl: {
    hero_tagn: 'AGENCJA KREATYWNA · KATOWICE',
    hero_n1: 'Rolka dziennie.',
    hero_n2: 'Bez twojego czasu',
    hero_prace: 'OSTATNIE ROLKI DLA KLIENTÓW',
    hero_opis: 'Scenariusz, zdjęcia, montaż i publikacja — po naszej stronie. Ty tylko odbierasz telefony.',
    hero_cta1: 'Zobacz prace',
    hero_cta2: 'Napisz na WhatsApp',
  },
  ru: {
    hero_tagn: 'КРЕАТИВНОЕ АГЕНТСТВО · КАТОВИЦЕ',
    hero_n1: 'Ролик в день.',
    hero_n2: 'Без вашего времени',
    hero_prace: 'ПОСЛЕДНИЕ РИЛСЫ ДЛЯ КЛИЕНТОВ',
    hero_opis: 'Сценарий, съёмка, монтаж и публикация — на нас. Вы только отвечаете на звонки.',
    hero_cta1: 'Смотреть работы',
    hero_cta2: 'Написать в WhatsApp',
  },
};

for (const [jezyk, pary] of Object.entries(slowa)) {
  const znak = `\n  ${jezyk}: {\n`;
  const i = s.indexOf(znak);
  if (i < 0) throw new Error('не нашёл словарь ' + jezyk);
  const wstaw =
    '\n    /* новый первый экран */\n' +
    Object.entries(pary)
      .map(([k, v]) => `    ${k}:${JSON.stringify(v)},`)
      .join('\n') +
    '\n';
  s = s.slice(0, i + znak.length) + wstaw.slice(1) + s.slice(i + znak.length);
}

// Разметка первого экрана переезжает на новые ключи.
s = s.replace('<div class="pg-eyebrow" data-k="hero_tag">', '<div class="pg-eyebrow" data-k="hero_tagn">');
s = s.replace('<span data-k="hero_l1">Rolka dziennie.</span>', '<span data-k="hero_n1">Rolka dziennie.</span>');
s = s.replace('<span data-k="hero_l3">Bez twojego czasu</span>', '<span data-k="hero_n2">Bez twojego czasu</span>');

await writeFile(P, s, 'utf8');
console.log('добавлено ключей:', Object.keys(slowa.pl).length, '× 3 языка');
