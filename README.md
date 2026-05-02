# AI SaaS CRM + Website

Проект по ТЗ из `TZ.md`:

- сайт специалиста (`/`)
- CRM (`/orders`)
- dashboard аналитики (`/dashboard`)
- login (`/login`)
- калькулятор -> CRM (`/calculator`)
- AI manager API (`/api/ai-manager`)
- Telegram bot script (`telegram-bot.ts`)

## Стек

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth (JWT)
- OpenAI API
- Recharts

## Быстрый старт

1. Установите Node.js LTS.
2. Скопируйте `.env.example` в `.env` и заполните переменные.
3. Установите зависимости:
   - `npm install`
4. Сгенерируйте Prisma client:
   - `npx prisma generate`
5. Примените миграцию:
   - `npx prisma migrate dev --name init`
6. Запустите проект:
   - `npm run dev`
