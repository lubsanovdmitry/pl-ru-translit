# Статический транслитератор

В приложении доступны две контекстные системы:

- польская латиница → кириллица по
  [`polish_cyrillic_v1.md`](./polish_cyrillic_v1.md);
- русская кириллица → западнославянская латиница по
  [`russkaja_latinica_zapadnoslavjanskogo_tipa.md`](./russkaja_latinica_zapadnoslavjanskogo_tipa.md).

Оба преобразования выполняются локально в браузере. Сервер, Worker, база
данных, API и переменные окружения не нужны.

## Локальный запуск

Требуется Node.js 22.13 или новее.

```bash
npm install
npm run dev
```

## Статическая сборка

```bash
npm run build
```

Готовый сайт появляется в `dist/`. Каталог содержит только статические HTML,
CSS, JavaScript и изображения и может размещаться на Cloudflare Pages, GitHub
Pages, Netlify, S3 или любом обычном веб-сервере.

## Cloudflare (Workers Static Assets)

Конфигурация — `wrangler.jsonc`: каталог `dist/` отдаётся как статические
файлы, кода Worker нет. Сборка использует относительные пути (`base: "./"`),
поэтому сайт работает и в подкаталоге (например, GitHub Pages).

```bash
npx wrangler login
npm run deploy
```

`npm run deploy` собирает сайт и выполняет `wrangler deploy`. Проверка без
публикации: `npm run build && npx wrangler deploy --dry-run`.

## Проверка

```bash
npm test
```

Команда собирает статический сайт, проверяет отсутствие серверного артефакта и
прогоняет примеры обеих спецификаций через движки транслитерации.

## Основные файлы

- `src/App.tsx` — интерфейс;
- `src/globals.css` — стили и размеры полей;
- `lib/transliterate.mjs` — польская латиница → кириллица;
- `lib/transliterate-russian.mjs` — русская кириллица → латиница;
- `lib/word-case.mjs` — перенос регистра слова (общий для обоих движков);
- `wrangler.jsonc` — настройка деплоя на Cloudflare;
- `tests/transliterate.test.mjs` — тесты польской системы;
- `tests/transliterate-russian.test.mjs` — тесты русской системы.
