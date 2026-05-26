import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  formatLeadTelegramMessage,
  sendTelegramToOwner,
  type LeadNotifyPayload
} from "@/lib/telegram/notifyOwner";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function jsonWithCors(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LeadNotifyPayload;

    const clientName = String(body.clientName ?? "").trim() || "Не указано";
    const contact = String(body.contact ?? "").trim();
    const phone = String(body.phone ?? "").trim() || contact || "—";
    const task = String(body.task ?? "").trim() || "Заявка из AI-консультанта";

    const payload: LeadNotifyPayload = {
      ...body,
      clientName,
      contact,
      phone,
      task
    };

    const telegram = await sendTelegramToOwner(formatLeadTelegramMessage(payload));

    let savedToDb = false;
    try {
      await prisma.order.create({
        data: {
          clientName,
          phone: [phone, task].filter(Boolean).join(" | ").slice(0, 500),
          totalPrice: 0,
          status: "new"
        }
      });
      savedToDb = true;
    } catch (dbError) {
      console.error("CRM save failed:", dbError);
    }

    if (!telegram.ok) {
      return jsonWithCors(
        {
          ok: false,
          error: telegram.error,
          savedToDb,
          hint: "Проверьте TG_TOKEN и TG_OWNER_CHAT_ID в .env. Напишите боту /start в Telegram один раз."
        },
        503
      );
    }

    return jsonWithCors({ ok: true, savedToDb, telegram: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка сервера";
    return jsonWithCors({ ok: false, error: message }, 500);
  }
}
