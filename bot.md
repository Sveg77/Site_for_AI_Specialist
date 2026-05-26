# AI-консультант на сайте

Виджет: `app.js` → `public/assets/js/chatbot.js`.

## Заявки в ваш Telegram (личные сообщения)

Отдельный бот для переписки с клиентами **не нужен**. Нужен только «служебный» бот от [@BotFather](https://t.me/BotFather) — он **не общается** с посетителями, а **присылает вам** заявки в личку, когда кто-то оформил заявку на сайте.

### Шаг 1. BotFather (один раз)

1. [@BotFather](https://t.me/BotFather) → `/newbot` (или используйте уже созданного бота).
2. Скопируйте **токен** → в `.env` как `TG_TOKEN`.

### Шаг 2. Ваш chat id

1. [@userinfobot](https://t.me/userinfobot) → Start.
2. Число **Id** → в `.env` как `TG_OWNER_CHAT_ID`.

### Шаг 3. Напишите боту один раз

Откройте **вашего** бота в Telegram (того, чей токен в `.env`) и нажмите **Запустить** / `/start`.  
Иначе Telegram не даст присылать вам сообщения.

### Шаг 4. Файл `.env`

```env
TG_TOKEN=токен_от_BotFather
TG_OWNER_CHAT_ID=ваш_Id
APP_URL=http://localhost:3002
DATABASE_URL=file:./dev.db
```

### Шаг 5. Запуск сайта с API

В терминале в папке проекта:

```bash
npm install
npx prisma generate
npm run dev
```

Сайт откройте как обычно (`index.html` через Live Server **или** страницы с того же компьютера).  
Уведомления уходят на `http://localhost:3002/api/chatbot/notify` (прописано в `app.js`).

### Шаг 6. Проверка

1. Откройте сайт, AI-консультант → заполните форму → пройдите диалог → «Согласен, оформить заявку».
2. В Telegram должно прийти сообщение с именем, контактом и брифом.

Заявки также попадают в CRM: [http://localhost:3002/orders](http://localhost:3002/orders).

### На продакшене

В `app.js` замените:

```javascript
window.siteChatbotConfig = { apiBase: "https://ваш-домен.ru" };
```

---

## Виджет на сайте (кратко)

- Форма: имя, способ связи, контакт, согласие.
- Бриф: ниша → цель → размещение → аудитория → сроки.
- Локально: `localStorage` (`landingAdminOrders`, `admin-leads.html`).
- В Telegram: через API `/api/chatbot/notify`.

## Опционально: `npm run telegram`

Отдельный сценарий — полный чат в Telegram для клиентов. Для **только заявок с сайта** не требуется.
