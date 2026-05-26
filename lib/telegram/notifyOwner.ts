export interface LeadNotifyPayload {
  clientName?: string;
  contact?: string;
  phone?: string;
  task?: string;
  formTitle?: string;
  recommendedService?: string;
  pageUrl?: string;
  brief?: Record<string, string>;
}

function formatBrief(brief?: Record<string, string>): string {
  if (!brief) return "";
  const lines = [
    brief.niche && `Ниша: ${brief.niche}`,
    brief.goal && `Цель: ${brief.goal}`,
    brief.placement && `Размещение: ${brief.placement}`,
    brief.audience && `Аудитория: ${brief.audience}`,
    brief.timeline && `Сроки: ${brief.timeline}`,
    brief.budget && `Бюджет: ${brief.budget}`
  ].filter(Boolean);
  return lines.length ? "\n\n" + lines.join("\n") : "";
}

export function formatLeadTelegramMessage(payload: LeadNotifyPayload): string {
  const title = payload.formTitle || "Заявка с сайта (AI-консультант)";
  const lines = [
    `📩 ${title}`,
    `Имя: ${payload.clientName || "—"}`,
    `Контакт: ${payload.contact || payload.phone || "—"}`,
    payload.recommendedService ? `Услуга: ${payload.recommendedService}` : "",
    payload.pageUrl ? `Страница: ${payload.pageUrl}` : "",
    "",
    payload.task || "—",
    formatBrief(payload.brief)
  ].filter((line) => line !== "");

  return lines.join("\n");
}

export async function sendTelegramToOwner(text: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TG_TOKEN?.trim();
  const chatId = process.env.TG_OWNER_CHAT_ID?.trim();

  if (!token || !chatId) {
    return { ok: false, error: "Не заданы TG_TOKEN или TG_OWNER_CHAT_ID в .env" };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4000),
      disable_web_page_preview: true
    })
  });

  const data = (await res.json()) as { ok?: boolean; description?: string };
  if (!res.ok || !data.ok) {
    return { ok: false, error: data.description || `HTTP ${res.status}` };
  }
  return { ok: true };
}
