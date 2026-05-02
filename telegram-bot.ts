import TelegramBot from "node-telegram-bot-api";

const token = process.env.TG_TOKEN;
const appUrl = process.env.APP_URL;

if (!token || !appUrl) {
  throw new Error("Set TG_TOKEN and APP_URL in environment.");
}

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const text = msg.text ?? "";
  const res = await fetch(`${appUrl}/api/ai-manager`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = (await res.json()) as { reply?: string };
  await bot.sendMessage(msg.chat.id, data.reply ?? "Ошибка генерации ответа.");
});
