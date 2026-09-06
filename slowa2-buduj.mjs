import { readFile, writeFile } from 'node:fs/promises';
const P = 'C:/Users/zahar/zovu-pl/index.html';
let s = await readFile(P, 'utf8');
if (s.includes('jp_f5:')) { console.log('ключи есть'); process.exit(0); }
const slowa = {
  en: { jp_label:'HOW WE WORK', jp_title:'No surprises', jp_k1t:'A conversation, not a five-page brief', jp_k1o:'You write on WhatsApp — the person who will do the work answers. We ask about your business, your clients and what you have already tried. No sales department.', jp_k2t:'A sample before the contract', jp_k2o:'We show how it will look for you: one reel, one screen of the site or one post. Only then do we talk about the whole thing.', jp_k3t:'We publish, you answer the phone', jp_k3o:'Script, filming, editing and publishing are on us. The material stays yours — you always get the source files.', jp_f3:'people, zero middlemen', jp_f4:'we speak your language', jp_f5:'of source files stay with you' },
  pl: { jp_label:'JAK PRACUJEMY', jp_title:'Bez niespodzianek', jp_k1t:'Rozmowa, nie brief na pięć stron', jp_k1o:'Piszesz na WhatsApp — odpowiada ten, kto będzie robił twoją robotę. Pytamy o firmę, klientów i o to, co już próbowaliście. Bez działu sprzedaży.', jp_k2t:'Próbka przed umową', jp_k2o:'Pokazujemy, jak to będzie wyglądać u ciebie: jedna rolka, jeden ekran strony albo jeden post. Dopiero potem rozmawiamy o całości.', jp_k3t:'Publikujemy, ty odbierasz telefony', jp_k3o:'Scenariusz, zdjęcia, montaż i publikacja są po naszej stronie. Materiały zostają twoje — pliki źródłowe dostajesz zawsze.', jp_f3:'osoby, zero pośredników', jp_f4:'rozmawiamy w twoim języku', jp_f5:'plików źródłowych zostaje u ciebie' },
  ru: { jp_label:'КАК МЫ РАБОТАЕМ', jp_title:'Без сюрпризов', jp_k1t:'Разговор, а не бриф на пять страниц', jp_k1o:'Пишете в WhatsApp — отвечает тот, кто будет делать работу. Спрашиваем про бизнес, клиентов и что уже пробовали. Без отдела продаж.', jp_k2t:'Проба до договора', jp_k2o:'Показываем, как это будет у вас: одна рилса, один экран сайта или один пост. И только потом обсуждаем всё остальное.', jp_k3t:'Публикуем мы, вы отвечаете на звонки', jp_k3o:'Сценарий, съёмка, монтаж и публикация — на нас. Материалы остаются вашими, исходники отдаём всегда.', jp_f3:'человека, без посредников', jp_f4:'говорим на вашем языке', jp_f5:'исходников остаётся у вас' },
};
for (const [jezyk, pary] of Object.entries(slowa)) {
  const znak = `\n  ${jezyk}: {\n`;
  const i = s.indexOf(znak);
  if (i < 0) throw new Error('нет словаря ' + jezyk);
  const wstaw = '    /* jak pracujemy */\n' + Object.entries(pary).map(([k, v]) => `    ${k}:${JSON.stringify(v)},`).join('\n') + '\n';
  s = s.slice(0, i + znak.length) + wstaw + s.slice(i + znak.length);
}
await writeFile(P, s, 'utf8');
console.log('переводы секции добавлены');
