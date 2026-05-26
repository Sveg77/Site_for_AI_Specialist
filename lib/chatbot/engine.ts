export type IntakeStep = "niche" | "goal" | "placement" | "audience" | "timeline" | "done";

export type LeadPhase = "await_name" | "ready";

export type ServiceCategory =
  | "consultation"
  | "project"
  | "content"
  | "design"
  | "social"
  | "support";

export interface ChatService {
  name: string;
  category: ServiceCategory;
  price: number;
  priceLabel?: string;
}

export interface ChatBrief {
  niche: string;
  goal: string;
  placement: string;
  audience: string;
  timeline: string;
  budget: string;
}

export interface ChatSession {
  leadPhase: LeadPhase;
  leadReady: boolean;
  clientName: string;
  contact: string;
  contactMethod: string;
  intakeStep: IntakeStep;
  recommendedService: string;
  brief: ChatBrief;
  chatCompleted: boolean;
}

export const DEFAULT_SERVICES: ChatService[] = [
  { name: "Первая консультация (до 15 мин)", category: "consultation", price: 0, priceLabel: "Бесплатно" },
  { name: "Консультация по нейросетям в нише", category: "consultation", price: 2000, priceLabel: "от 2000 ₽/час" },
  { name: "Чат-бот без ИИ", category: "project", price: 10000, priceLabel: "от 10 000 ₽" },
  { name: "Чат-бот с ИИ", category: "project", price: 20000, priceLabel: "от 20 000 ₽" },
  { name: "Лендинг (1 страница)", category: "project", price: 10000, priceLabel: "от 10 000 ₽" },
  { name: "Многостраничный сайт", category: "project", price: 50000, priceLabel: "от 50 000 ₽" },
  { name: "Мобильное приложение", category: "project", price: 75000, priceLabel: "от 75 000 ₽" },
  { name: "Контент и маркетинг", category: "content", price: 10000, priceLabel: "от 10 000 ₽" },
  { name: "Мультимедиа и дизайн", category: "design", price: 1000, priceLabel: "от 1000 ₽" },
  { name: "Ведение соцсетей", category: "social", price: 40000, priceLabel: "от 40 000 ₽" },
  { name: "Сопровождение / аудит проекта", category: "support", price: 0, priceLabel: "по задаче" }
];

export function createEmptySession(): ChatSession {
  return {
    leadPhase: "await_name",
    leadReady: false,
    clientName: "",
    contact: "",
    contactMethod: "telegram",
    intakeStep: "niche",
    recommendedService: "",
    brief: {
      niche: "",
      goal: "",
      placement: "",
      audience: "",
      timeline: "",
      budget: ""
    },
    chatCompleted: false
  };
}

export function getQuickRepliesForStep(step: IntakeStep): string[] {
  if (step === "niche") {
    return ["Эксперт / консультант", "Интернет-магазин", "Онлайн-обучение", "Услуги B2B/B2C", "Другое"];
  }
  if (step === "goal") {
    return ["Заявки", "Продажи", "Запись клиентов", "Презентация услуги", "MVP / тест идеи"];
  }
  if (step === "placement") {
    return ["Сайт / лендинг", "Telegram-бот", "Мобильное приложение", "Соцсети / контент", "Другое"];
  }
  if (step === "timeline") {
    return ["До 2 недель", "1 месяц", "2–3 месяца", "Сроки гибкие"];
  }
  return [];
}

export function formatServicePrice(service: ChatService): string {
  if (service.priceLabel) return service.priceLabel;
  if (service.price > 0) return `от ${service.price.toLocaleString("ru-RU")} ₽`;
  return "по задаче";
}

export function classifyNeed(text: string): ServiceCategory {
  const t = text.toLowerCase();
  if (/(аудит|проверить|улучшить|анализ|доработ)/.test(t)) return "support";
  if (/(бот|telegram|mini app|лендинг|сайт|прилож|mvp|вайбкод)/.test(t)) return "project";
  if (/(контент|текст|воронк|маркетинг|прогрев|промпт|gpt)/.test(t)) return "content";
  if (/(дизайн|фото|видео|логотип|карточк|нейро)/.test(t)) return "design";
  if (/(соцсет|instagram|вконтакт|ведение|аккаунт)/.test(t)) return "social";
  if (/(консульт|разобрать|с чего начать|перв)/.test(t)) return "consultation";
  return "consultation";
}

export function extractBudget(text: string): string {
  const t = text.toLowerCase();
  const match = text.match(/(\d[\d\s]{2,})\s*(тыс|тр|k|₽|руб)/i);
  if (match) return match[0].trim();
  if (/(не знаю|пока нет|обсудим|гибк)/.test(t)) return "уточнить на консультации";
  if (/(до\s*\d|от\s*\d|бюджет)/.test(t)) return text.trim();
  return "";
}

export function buildBriefText(session: ChatSession): string {
  return [
    `Ниша: ${session.brief.niche || "не указана"}`,
    `Цель: ${session.brief.goal || "не указана"}`,
    `Размещение: ${session.brief.placement || "не указано"}`,
    `Аудитория: ${session.brief.audience || "не указана"}`,
    `Сроки: ${session.brief.timeline || "не указаны"}`,
    `Бюджет: ${session.brief.budget || "не указан"}`
  ].join("; ");
}

export interface BotReplyOptions {
  calculatorUrl?: string;
  managerTelegram?: string;
}

function recommendService(session: ChatSession, category: ServiceCategory, opts: BotReplyOptions): string {
  const matched = DEFAULT_SERVICES.find((s) => s.category === category) ?? DEFAULT_SERVICES[0];
  session.recommendedService = matched.name;
  const price = formatServicePrice(matched);
  const calcUrl = opts.calculatorUrl ?? "calculator.html";
  return (
    `Спасибо, картина уже яснее.\n` +
    `Рекомендую начать с: ${matched.name}.\n` +
    `Ориентир: ${price}.\n` +
    `Точнее посчитать: ${calcUrl}\n` +
    `(скидка 10% при сумме от 20 000 ₽).\n\n` +
    `Напишите: «Согласен, оформить заявку» — или задайте уточняющий вопрос.`
  );
}

function listServicesText(): string {
  return DEFAULT_SERVICES.slice(0, 8)
    .map((s) => `• ${s.name} — ${formatServicePrice(s)}`)
    .join("\n");
}

function handleIntake(session: ChatSession, text: string, opts: BotReplyOptions): string {
  if (session.intakeStep === "niche") {
    session.brief.niche = text;
    session.intakeStep = "goal";
    return "Спасибо, записала. Подскажите, пожалуйста, какая цель сейчас ближе: заявки, продажи, запись клиентов, презентация услуги или что-то своё?";
  }
  if (session.intakeStep === "goal") {
    session.brief.goal = text;
    session.intakeStep = "placement";
    return "Понятно, спасибо. Где хотите разместить решение — сайт, Telegram-бот, приложение, соцсети или пока не определились?";
  }
  if (session.intakeStep === "placement") {
    session.brief.placement = text;
    session.intakeStep = "audience";
    return "Хорошо. Расскажите коротко о вашей аудитории и что человеку важно сделать на сайте или в боте в первую очередь.";
  }
  if (session.intakeStep === "audience") {
    session.brief.audience = text;
    session.intakeStep = "timeline";
    return "Отлично. Если есть пожелания по срокам или ориентир по бюджету — напишите в свободной форме, можно примерно.";
  }
  if (session.intakeStep === "timeline") {
    session.brief.timeline = text;
    session.brief.budget = extractBudget(text) || session.brief.budget;
    session.intakeStep = "done";
    return recommendService(session, classifyNeed(buildBriefText(session)), opts);
  }
  return "";
}

export interface BotReplyResult {
  messages: string[];
  orderCreated?: {
    taskText: string;
    escalated: boolean;
  };
}

export function processBotMessage(
  session: ChatSession,
  userText: string,
  opts: BotReplyOptions = {}
): BotReplyResult {
  const text = userText.trim();
  const lower = text.toLowerCase();

  if (/(оператор|живой|человек|менеджер|сложно|трудно|не понима)/.test(lower)) {
    return {
      messages: [
        "Передала запрос менеджеру — свяжутся в ближайшее время." +
          (opts.managerTelegram ? `\nМожно написать: ${opts.managerTelegram}` : "")
      ],
      orderCreated: { taskText: text || "Нужен живой оператор", escalated: true }
    };
  }

  if (/(калькулятор|посчитать|расчёт|расчет)/.test(lower)) {
    return {
      messages: [
        `Предварительный расчёт на сайте: ${opts.calculatorUrl ?? "calculator.html"}`
      ]
    };
  }

  if (/(согласен|оформ|подходит|беру)/.test(lower)) {
    const taskText =
      session.intakeStep === "done"
        ? `${text}. Бриф: ${buildBriefText(session)}`
        : text + (session.brief.niche ? `. Бриф (частично): ${buildBriefText(session)}` : "");
    session.chatCompleted = true;
    return {
      messages: [
        "Отлично, оформляю заявку.",
        "Готово! Заявка сохранена — свяжусь с вами в течение 24 часов." +
          (opts.managerTelegram ? `\nTelegram: ${opts.managerTelegram}` : "")
      ],
      orderCreated: { taskText, escalated: false }
    };
  }

  if (/(цена|стоим|бюджет|сколько|прайс)/.test(lower)) {
    if (session.intakeStep !== "done") {
      return {
        messages: [
          "Чтобы подсказать по стоимости точнее, давайте сначала чуть познакомимся с задачей. В какой сфере вы работаете или развиваете проект?"
        ]
      };
    }
    return {
      messages: [
        `Ориентиры по услугам:\n${listServicesText()}\n\nПодробный расчёт: ${opts.calculatorUrl ?? "calculator.html"}`
      ]
    };
  }

  if (session.intakeStep !== "done") {
    return { messages: [handleIntake(session, text, opts)] };
  }

  const need = classifyNeed(`${text} ${buildBriefText(session)}`);
  return { messages: [recommendService(session, need, opts)] };
}

export function startLeadChat(session: ChatSession, clientName: string): string[] {
  session.clientName = clientName;
  session.leadPhase = "ready";
  session.leadReady = true;
  session.chatCompleted = false;
  session.intakeStep = "niche";
  session.brief = {
    niche: "",
    goal: "",
    placement: "",
    audience: "",
    timeline: "",
    budget: ""
  };
  return [
    `Здравствуйте, ${clientName}! Рада быть на связи.`,
    "Я задам буквально несколько вопросов.\n\nРасскажите, пожалуйста, в какой сфере вы работаете или что за проект планируете?"
  ];
}

export const GREETING_LEAD =
  "Рада, что вы заглянули! Помогу спокойно разобраться с задачей, подобрать удобный формат работы и подсказать по услугам — без спешки и сложных терминов.\n\n" +
  "Перед началом чата понадобится немного информации.\n\nКак к вам обращаться? (напишите имя)";
