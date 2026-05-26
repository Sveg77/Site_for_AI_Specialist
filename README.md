# AI SaaS CRM + Website

Проект по ТЗ из `TZ.md`:

- сайт специалиста (`/`)
- CRM (`/orders`)
- dashboard аналитики (`/dashboard`)
- login (`/login`)
- калькулятор → CRM (`/calculator` — встроен `public/Калькулятор.html`, кнопка «Отправить в CRM»)
- AI manager API (`/api/ai-manager`)
- Telegram-бот в ЛС (`telegram-bot.ts`, `npm run telegram` — тот же сценарий, что виджет на сайте)

## Стек

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + **SQLite локально** (чтобы работало без установки PostgreSQL)
- PostgreSQL — как в ТЗ: см. `docker-compose.yml` и комментарий в `prisma/schema.prisma`
- NextAuth (JWT)
- OpenAI API
- Recharts

## Быстрый старт

1. Установите Node.js LTS.
2. Скопируйте `.env.example` в `.env` (или оставьте созданный `.env` с `file:./dev.db`).
3. `npm install`
4. `npx prisma generate`
5. `npx prisma migrate dev --name init` (создаёт `prisma/dev.db`)
6. `npm run dev` → откройте [http://localhost:3002](http://localhost:3002)  
   (Порт **3002** задан в `package.json`, чтобы не пересекаться с **3000**, который часто занят самим Cursor.)

Сборка: `npm run build` (проверено).

### Ошибка «Expected clientReferenceManifest to be defined»

Это сбой внутреннего кэша Next.js (папка `.next`), а не ваш код в CRM. Сделайте так:

1. Остановите сервер (`Ctrl+C`).
2. В корне проекта выполните: `npm run clean` **или** удалите папку `.next` вручную.
3. Снова: `npm run dev` (или одной командой: `npm run dev:clean`).

Если повторится — выполните `npm run build` и снова `npm run dev`.

### PostgreSQL по ТЗ

1. Установите [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. `docker compose up -d`
3. В `prisma/schema.prisma` смените `provider` на `postgresql`, в `.env` укажите  
   `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_saas"`
4. `npx prisma migrate dev`

### Калькулятор

- Статика: `public/Калькулятор.html`, скрипты `public/assets/js/i18n.js`, `calculator.js`.
- Корневый `Калькулятор.html` можно править и заново копировать в `public/`, если нужна синхронизация.
