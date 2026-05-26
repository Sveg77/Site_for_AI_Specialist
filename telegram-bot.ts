import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { PrismaClient } from "@prisma/client";
import {
  createEmptySession,
  getQuickRepliesForStep,
  GREETING_LEAD,
  processBotMessage,
  startLeadChat,
  type ChatSession
} from "./lib/chatbot/engine";

const token = process.env.TG_TOKEN;
const ownerChatId = process.env.TG_OWNER_CHAT_ID?.trim();
const siteUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002").replace(
  /\/$/,
  ""
);
const calculatorUrl = `${siteUrl}/calculator.html`;
const managerTelegram = process.env.TG_MANAGER_HANDLE || "https://t.me/Sveg77";

if (!token) {
  throw new Error("Укажите TG_TOKEN в .env (токен от @BotFather).");
}

const bot = new TelegramBot(token, { polling: true });
const prisma = new PrismaClient();
const sessions = new Map<number, ChatSession>();

function getSession(chatId: number): ChatSession {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, createEmptySession());
  }
  return sessions.get(chatId)!;
}

function resetSession(chatId: number) {
  sessions.set(chatId, createEmptySession());
}

function buildTelegramContact(from: TelegramBot.User): string {
  if (from.username) return `@${from.username}`;
  return `tg://user?id=${from.id}`;
}

async function saveOrder(session: ChatSession, taskText: string, from: TelegramBot.User) {
  const phone = [
    buildTelegramContact(from),
    session.contact && session.contact !== buildTelegramContact(from) ? session.contact : "",
    taskText
  ]
    .filter(Boolean)
    .join(" | ");

  try {
    await prisma.order.create({
      data: {
        clientName: session.clientName || from.first_name || "Telegram",
        phone: phone.slice(0, 500),
        totalPrice: 0,
        status: "new"
      }
    });
  } catch (e) {
    console.error("Не удалось сохранить заявку в БД:", e);
  }
}

async function notifyOwner(session: ChatSession, taskText: string, from: TelegramBot.User) {
  if (!ownerChatId) return;
  const lines = [
    "📩 Новая заявка из Telegram-бота",
    `Имя: ${session.clientName || from.first_name || "—"}`,
    `Контакт: ${buildTelegramContact(from)}`,
    session.recommendedService ? `Услуга: ${session.recommendedService}` : "",
    "",
    taskText
  ].filter(Boolean);

  try {
    await bot.sendMessage(ownerChatId, lines.join("\n"));
  } catch (e) {
    console.error("Не удалось отправить уведомление владельцу:", e);
  }
}

function buildReplyKeyboard(step: ChatSession["intakeStep"]) {
  const rows = getQuickRepliesForStep(step);
  if (!rows.length || step === "done") return undefined;
  const buttons = rows.map((label) => [{ text: label }]);
  return {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
}

async function sendBotReplies(chatId: number, messages: string[], session: ChatSession) {
  for (let i = 0; i < messages.length; i++) {
    const opts =
      i === messages.length - 1 && !session.chatCompleted
        ? buildReplyKeyboard(session.intakeStep)
        : { reply_markup: { remove_keyboard: true } };
    await bot.sendMessage(chatId, messages[i], opts);
  }
}

async function handleChatMessage(chatId: number, text: string, from: TelegramBot.User) {
  const session = getSession(chatId);
  const result = processBotMessage(session, text, {
    calculatorUrl,
    managerTelegram
  });

  await sendBotReplies(chatId, result.messages, session);

  if (result.orderCreated) {
    await saveOrder(session, result.orderCreated.taskText, from);
    await notifyOwner(session, result.orderCreated.taskText, from);
  }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  resetSession(chatId);
  await bot.sendMessage(chatId, GREETING_LEAD, { reply_markup: { remove_keyboard: true } });
});

bot.onText(/\/new|\/новый/, async (msg) => {
  const chatId = msg.chat.id;
  resetSession(chatId);
  await bot.sendMessage(chatId, "Новый диалог. " + GREETING_LEAD, { reply_markup: { remove_keyboard: true } });
});

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;
  const chatId = msg.chat.id;
  const from = msg.from;
  if (!from) return;

  const session = getSession(chatId);
  const text = msg.text.trim();

  if (session.leadPhase === "await_name") {
    const name = text.slice(0, 80);
    if (name.length < 2) {
      await bot.sendMessage(chatId, "Укажите, пожалуйста, имя — хотя бы 2 символа.");
      return;
    }
    session.contact = buildTelegramContact(from);
    session.contactMethod = "telegram";
    const welcome = startLeadChat(session, name);
    await sendBotReplies(chatId, welcome, session);
    return;
  }

  if (!session.leadReady) {
    await bot.sendMessage(chatId, "Напишите /start, чтобы начать диалог.");
    return;
  }

  await handleChatMessage(chatId, text, from);
});

console.log("Telegram-бот запущен (личные сообщения). Ожидаю сообщения…");
if (!ownerChatId) {
  console.log(
    "Подсказка: добавьте TG_OWNER_CHAT_ID в .env — тогда заявки будут приходить вам в личку."
  );
}
