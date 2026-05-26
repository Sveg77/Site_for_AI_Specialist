(function () {
  "use strict";

  var CONFIG = {
    managerTelegram: "https://t.me/Sveg77",
    managerTelegramHandle: "@Sveg77",
    calculatorUrl: "calculator.html",
    privacyUrl: "privacy-policy.html",
    servicesKey: "landingAdminServices",
    ordersKey: "landingAdminOrders",
    chatsKey: "landingAdminChats",
    apiBase: "",
    apiNotifyUrl: "",
    apiOrdersUrl: ""
  };

  if (window.siteChatbotConfig && typeof window.siteChatbotConfig === "object") {
    Object.keys(window.siteChatbotConfig).forEach(function (key) {
      CONFIG[key] = window.siteChatbotConfig[key];
    });
  }

  var DEFAULT_SERVICES = [
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

  function injectWidget() {
    if (document.getElementById("chatbot-launcher")) return;

    var root = document.createElement("div");
    root.className = "chatbot-root";
    root.innerHTML =
      '<button type="button" class="chatbot-launcher" id="chatbot-launcher" aria-label="Открыть AI-консультант" aria-expanded="false" title="AI-консультант">' +
      '<span class="chatbot-launcher-pulse" aria-hidden="true"></span>' +
      '<svg class="chatbot-launcher-svg" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path class="chatbot-launcher-bubble" d="M6 5.5h16a2.5 2.5 0 0 1 2.5 2.5v9.2a2.5 2.5 0 0 1-2.5 2.5H11.4L6 22.8V8a2.5 2.5 0 0 1 2.5-2.5Z" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round"/>' +
      '<path d="M10 11.2h8M10 14.4h5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle class="chatbot-launcher-spark" cx="21.5" cy="7" r="2.2" fill="currentColor"/>' +
      "</svg>" +
      '<span class="chatbot-launcher-hint">AI-консультант</span>' +
      "</button>" +
      '<div class="chatbot-panel is-lead-phase" id="chatbot-panel" hidden role="dialog" aria-labelledby="chatbot-panel-title">' +
      '<header class="chatbot-header">' +
      '<h2 class="chatbot-header-title" id="chatbot-panel-title">AI-помощник</h2>' +
      '<div class="chatbot-header-actions">' +
      '<button type="button" class="chatbot-header-new" id="chatbot-header-new">Новый чат</button>' +
      '<button type="button" class="chatbot-close" id="chatbot-close" aria-label="Закрыть">×</button>' +
      "</div></header>" +
      '<div class="chatbot-body">' +
      '<div class="chatbot-lead-screen" id="chatbot-lead-screen">' +
      '<div class="chatbot-greeting">Рада, что вы заглянули! Помогу спокойно разобраться с задачей, подобрать удобный формат работы и подсказать по услугам — без спешки и сложных терминов.</div>' +
      '<form class="chatbot-lead-form" id="chatbot-lead-form">' +
      '<p class="chatbot-lead-intro">Перед началом чата понадобится немного информации.</p>' +
      '<label class="chatbot-field" id="chatbot-name-field">' +
      '<span class="chatbot-field-label">Ваше имя</span>' +
      '<input type="text" id="chatbot-name" name="name" required autocomplete="name" placeholder="Как к вам обращаться">' +
      '<span class="chatbot-field-error" id="chatbot-name-error" hidden></span>' +
      "</label>" +
      '<label class="chatbot-field" id="chatbot-method-field">' +
      '<span class="chatbot-field-label">Способ связи</span>' +
      '<select id="chatbot-contact-method" name="contactMethod" required>' +
      '<option value="">Выберите способ связи</option>' +
      '<option value="telegram">Telegram</option>' +
      '<option value="whatsapp">WhatsApp</option>' +
      '<option value="phone">Телефон</option>' +
      '<option value="email">E-mail</option>' +
      "</select>" +
      '<span class="chatbot-field-error" id="chatbot-method-error" hidden></span>' +
      "</label>" +
      '<label class="chatbot-field" id="chatbot-contact-field">' +
      '<span class="chatbot-field-label" id="chatbot-contact-label">Контакт</span>' +
      '<input type="text" id="chatbot-contact-value" name="contact" required disabled placeholder="Сначала выберите способ связи">' +
      '<span class="chatbot-field-hint" id="chatbot-contact-hint" hidden></span>' +
      '<span class="chatbot-field-error" id="chatbot-contact-error" hidden></span>' +
      "</label>" +
      '<div class="chatbot-consent-wrap" id="chatbot-consent-wrap">' +
      '<label class="chatbot-consent"><input type="checkbox" id="chatbot-consent" required>' +
      '<span class="chatbot-consent-text">' +
      '<span>Я ознакомлен(а) с <a href="' + CONFIG.privacyUrl + '" target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a>.</span>' +
      "<span>Даю согласие на обработку персональных данных.</span>" +
      "</span></label>" +
      '<span class="chatbot-field-error" id="chatbot-consent-error" hidden></span>' +
      "</div>" +
      '<button type="submit" class="chatbot-submit" id="chatbot-submit">Начать чат</button>' +
      "</form></div>" +
      '<div class="chatbot-chat-screen" id="chatbot-chat-screen" hidden>' +
      '<div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite"></div>' +
      '<div class="chatbot-quick-replies" id="chatbot-quick-replies" hidden></div>' +
      '<form class="chatbot-message-form" id="chatbot-message-form">' +
      '<input type="text" id="chatbot-input" placeholder="Напишите вопрос..." autocomplete="off" maxlength="2000" disabled>' +
      '<button type="submit" class="chatbot-send" id="chatbot-send" aria-label="Отправить" disabled>→</button>' +
      "</form></div></div></div>";

    document.body.appendChild(root);
  }

  injectWidget();

  var launcher = document.getElementById("chatbot-launcher");
  var panel = document.getElementById("chatbot-panel");
  var closeBtn = document.getElementById("chatbot-close");
  var messagesEl = document.getElementById("chatbot-messages");
  var quickRepliesEl = document.getElementById("chatbot-quick-replies");
  var leadForm = document.getElementById("chatbot-lead-form");
  var msgForm = document.getElementById("chatbot-message-form");
  var msgInput = document.getElementById("chatbot-input");
  var sendBtn = document.getElementById("chatbot-send");
  var headerNewBtn = document.getElementById("chatbot-header-new");
  var leadScreen = document.getElementById("chatbot-lead-screen");
  var chatScreen = document.getElementById("chatbot-chat-screen");
  var nameInput = document.getElementById("chatbot-name");
  var contactMethodInput = document.getElementById("chatbot-contact-method");
  var contactValueInput = document.getElementById("chatbot-contact-value");
  var contactLabelEl = document.getElementById("chatbot-contact-label");
  var contactHintEl = document.getElementById("chatbot-contact-hint");
  var contactFieldEl = document.getElementById("chatbot-contact-field");
  var consentInput = document.getElementById("chatbot-consent");
  var submitBtn = document.getElementById("chatbot-submit");
  var nameErrorEl = document.getElementById("chatbot-name-error");
  var methodErrorEl = document.getElementById("chatbot-method-error");
  var contactErrorEl = document.getElementById("chatbot-contact-error");
  var consentErrorEl = document.getElementById("chatbot-consent-error");
  var nameFieldEl = document.getElementById("chatbot-name-field");
  var methodFieldEl = document.getElementById("chatbot-method-field");
  var consentWrapEl = document.getElementById("chatbot-consent-wrap");
  var leadValidationActive = false;

  if (!launcher || !panel || !messagesEl || !leadScreen || !chatScreen) return;

  function setPanelPhase(phase) {
    var isLead = phase === "lead";
    panel.classList.toggle("is-lead-phase", isLead);
    panel.classList.toggle("is-chat-phase", !isLead);
    leadScreen.hidden = !isLead;
    chatScreen.hidden = isLead;
  }

  var session = {
    id: "",
    leadReady: false,
    clientName: "",
    contact: "",
    contactMethod: "",
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

  function readArray(key) {
    try {
      var raw = localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeArray(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizePhone(value) {
    return (value || "").replace(/[^\d+]/g, "");
  }

  function formatRuPhone(digits) {
    var d = digits.replace(/\D/g, "");
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (d.startsWith("9")) d = "7" + d;
    if (!d.startsWith("7")) d = "7" + d;
    d = d.slice(0, 11);
    var p1 = d.slice(1, 4);
    var p2 = d.slice(4, 7);
    var p3 = d.slice(7, 9);
    var p4 = d.slice(9, 11);
    var result = "+7";
    if (p1) result += " (" + p1;
    if (p1.length === 3) result += ")";
    if (p2) result += " " + p2;
    if (p3) result += "-" + p3;
    if (p4) result += "-" + p4;
    return result;
  }

  function isPhoneComplete(value) {
    return normalizePhone(value).length >= 11;
  }

  function getContactMethodLabel(value) {
    if (value === "telegram") return "Telegram";
    if (value === "whatsapp") return "WhatsApp";
    if (value === "phone") return "Телефон";
    if (value === "email") return "E-mail";
    if (value === "other") return "Другой";
    return "Не указан";
  }

  function setContactHint(text) {
    if (!contactHintEl) return;
    if (text) {
      contactHintEl.textContent = text;
      contactHintEl.hidden = false;
    } else {
      contactHintEl.textContent = "";
      contactHintEl.hidden = true;
    }
  }

  function updateContactInputByMethod() {
    var method = contactMethodInput.value;
    contactValueInput.value = "";
    contactValueInput.disabled = !method;
    contactValueInput.type = "text";
    contactValueInput.removeAttribute("maxlength");
    contactValueInput.removeAttribute("inputmode");
    contactValueInput.removeAttribute("pattern");
    contactValueInput.removeAttribute("autocomplete");

    if (contactFieldEl) {
      contactFieldEl.classList.toggle("is-disabled", !method);
    }

    if (!method) {
      if (contactLabelEl) contactLabelEl.textContent = "Контакт";
      contactValueInput.placeholder = "Сначала выберите способ связи";
      setContactHint("");
      updateLeadSubmitState();
      return;
    }

    if (method === "telegram") {
      if (contactLabelEl) contactLabelEl.textContent = "Telegram";
      contactValueInput.placeholder = "@username";
      contactValueInput.autocomplete = "username";
      setContactHint("Укажите ник в Telegram, например @svetlana_ai");
      updateLeadSubmitState();
      return;
    }

    if (method === "whatsapp") {
      if (contactLabelEl) contactLabelEl.textContent = "WhatsApp";
      contactValueInput.placeholder = "+7 (___) ___-__-__";
      contactValueInput.inputMode = "tel";
      contactValueInput.maxLength = 18;
      contactValueInput.autocomplete = "tel";
      setContactHint("Номер WhatsApp с кодом страны, например +7 (905) 123-45-67");
      updateLeadSubmitState();
      return;
    }

    if (method === "phone") {
      if (contactLabelEl) contactLabelEl.textContent = "Телефон";
      contactValueInput.placeholder = "+7 (___) ___-__-__";
      contactValueInput.inputMode = "tel";
      contactValueInput.maxLength = 18;
      contactValueInput.autocomplete = "tel";
      setContactHint("Россия: +7 и код города/оператора, маска подставится автоматически");
      updateLeadSubmitState();
      return;
    }

    if (method === "email") {
      if (contactLabelEl) contactLabelEl.textContent = "E-mail";
      contactValueInput.type = "email";
      contactValueInput.placeholder = "name@example.com";
      contactValueInput.autocomplete = "email";
      setContactHint("Адрес в формате имя@домен.ru");
    }
    updateLeadSubmitState();
  }

  function validateContactByMethod() {
    var method = contactMethodInput.value;
    var value = contactValueInput.value.trim();
    if (!method || !value) return false;
    if (method === "telegram") return /^@?[a-zA-Z0-9_]{5,}$/.test(value);
    if (method === "whatsapp" || method === "phone") return isPhoneComplete(value);
    if (method === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return value.length >= 3;
  }

  function getContactValidationError() {
    var method = contactMethodInput.value;
    var value = contactValueInput.value.trim();
    if (!method) return "";
    if (!value) {
      if (method === "telegram") return "Укажите ник в Telegram";
      if (method === "whatsapp") return "Укажите номер WhatsApp";
      if (method === "phone") return "Укажите номер телефона";
      if (method === "email") return "Укажите адрес e-mail";
      return "Укажите контакт";
    }
    if (method === "telegram" && !/^@?[a-zA-Z0-9_]{5,}$/.test(value)) {
      return "Ник в формате @username, не короче 5 символов";
    }
    if ((method === "whatsapp" || method === "phone") && !isPhoneComplete(value)) {
      return "Введите полный номер: +7 (___) ___-__-__";
    }
    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Введите e-mail в формате name@example.com";
    }
    return "";
  }

  function setFieldError(errorEl, fieldWrap, message) {
    if (!errorEl) return;
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      if (fieldWrap) fieldWrap.classList.add("has-error");
    } else {
      errorEl.textContent = "";
      errorEl.hidden = true;
      if (fieldWrap) fieldWrap.classList.remove("has-error");
    }
  }

  function updateLeadErrors(force) {
    if (force) leadValidationActive = true;
    if (!leadValidationActive) return;

    var nameVal = nameInput.value.trim();
    setFieldError(nameErrorEl, nameFieldEl, nameVal ? "" : "Укажите ваше имя");

    var method = contactMethodInput.value;
    setFieldError(methodErrorEl, methodFieldEl, method ? "" : "Выберите способ связи");

    var contactErr = method ? getContactValidationError() : "";
    setFieldError(contactErrorEl, contactFieldEl, contactErr);
    if (contactHintEl) {
      contactHintEl.hidden = !!contactErr || !method;
    }

    setFieldError(
      consentErrorEl,
      consentWrapEl,
      consentInput.checked ? "" : "Подтвердите согласие на обработку данных"
    );
  }

  function clearLeadErrors() {
    leadValidationActive = false;
    setFieldError(nameErrorEl, nameFieldEl, "");
    setFieldError(methodErrorEl, methodFieldEl, "");
    setFieldError(contactErrorEl, contactFieldEl, "");
    setFieldError(consentErrorEl, consentWrapEl, "");
    if (contactHintEl && contactMethodInput.value) {
      contactHintEl.hidden = false;
    }
  }

  function focusFirstLeadError() {
    if (nameErrorEl && !nameErrorEl.hidden) {
      nameInput.focus();
      return;
    }
    if (methodErrorEl && !methodErrorEl.hidden) {
      contactMethodInput.focus();
      return;
    }
    if (contactErrorEl && !contactErrorEl.hidden) {
      contactValueInput.focus();
      return;
    }
    if (consentErrorEl && !consentErrorEl.hidden) {
      consentInput.focus();
    }
  }

  function isLeadFormComplete() {
    if (!nameInput.value.trim()) return false;
    if (!contactMethodInput.value) return false;
    if (!validateContactByMethod()) return false;
    if (!consentInput.checked) return false;
    return true;
  }

  function updateLeadSubmitState() {
    if (!submitBtn) return;
    submitBtn.classList.toggle("is-ready", isLeadFormComplete());
    updateLeadErrors(false);
  }

  function normalizeContactByMethod() {
    var method = contactMethodInput.value;
    var value = contactValueInput.value.trim();
    if (method === "telegram") return value.startsWith("@") ? value : "@" + value;
    if (method === "whatsapp" || method === "phone") return normalizePhone(value);
    return value;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function addMessage(role, text) {
    var msg = document.createElement("div");
    msg.className = "chat-msg " + role;
    msg.innerHTML = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    if (!session.id) return;
    var chats = readArray(CONFIG.chatsKey);
    var chat = chats.find(function (item) {
      return item.id === session.id;
    });
    if (!chat) return;
    chat.messages.push({
      role: role,
      text: text.replace(/<br>/g, "\n").replace(/<[^>]+>/g, ""),
      createdAt: new Date().toISOString()
    });
    chat.lastMessage = text.replace(/<[^>]+>/g, " ");
    chat.updatedAt = new Date().toISOString();
    chat.brief = Object.assign({}, session.brief);
    writeArray(CONFIG.chatsKey, chats);
  }

  function clearQuickReplies() {
    quickRepliesEl.innerHTML = "";
    quickRepliesEl.hidden = true;
  }

  function getQuickRepliesForStep(step) {
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

  function showQuickReplies() {
    clearQuickReplies();
    var variants = getQuickRepliesForStep(session.intakeStep);
    if (!variants.length || session.chatCompleted) return;

    quickRepliesEl.hidden = false;
    variants.forEach(function (label) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chat-quick-btn";
      button.textContent = label;
      button.addEventListener("click", function () {
        processUserMessage(label);
      });
      quickRepliesEl.appendChild(button);
    });
    quickRepliesEl.scrollIntoView({ block: "nearest" });
  }

  function getServices() {
    var services = readArray(CONFIG.servicesKey);
    if (services.length) return services;
    return DEFAULT_SERVICES.slice();
  }

  function formatServicePrice(service) {
    if (service.priceLabel) return service.priceLabel;
    if (service.price && Number(service.price) > 0) {
      return "от " + Number(service.price).toLocaleString("ru-RU") + " ₽";
    }
    return "по задаче";
  }

  function classifyNeed(text) {
    var t = text.toLowerCase();
    if (/(аудит|проверить|улучшить|анализ|доработ)/.test(t)) return "support";
    if (/(бот|telegram|mini app|лендинг|сайт|прилож|mvp|вайбкод)/.test(t)) return "project";
    if (/(контент|текст|воронк|маркетинг|прогрев|промпт|gpt)/.test(t)) return "content";
    if (/(дизайн|фото|видео|логотип|карточк|нейро)/.test(t)) return "design";
    if (/(соцсет|instagram|вконтакт|ведение|аккаунт)/.test(t)) return "social";
    if (/(консульт|разобрать|с чего начать|перв)/.test(t)) return "consultation";
    return "consultation";
  }

  function recommendService(category) {
    var services = getServices();
    var matched =
      services.find(function (s) {
        return s.category === category;
      }) || services[0];
    session.recommendedService = matched ? matched.name : "";
    var price = matched ? formatServicePrice(matched) : "по задаче";
    var calcLink =
      '<a href="' +
      CONFIG.calculatorUrl +
      '" target="_blank" rel="noopener noreferrer">калькуляторе</a>';
    return (
      "Спасибо, картина уже яснее.<br>Рекомендую начать с: <strong>" +
      escapeHtml(matched.name) +
      "</strong>.<br>Ориентир: <strong>" +
      escapeHtml(price) +
      "</strong>.<br>Точнее посчитать можно в " +
      calcLink +
      " (скидка 10% при сумме от 20 000 ₽).<br><br>Напишите: <em>Согласен, оформить заявку</em> — или задайте уточняющий вопрос."
    );
  }

  function extractBudget(text) {
    var t = text.toLowerCase();
    var match = text.match(/(\d[\d\s]{2,})\s*(тыс|тр|k|₽|руб)/i);
    if (match) return match[0].trim();
    if (/(не знаю|пока нет|обсудим|гибк)/.test(t)) return "уточнить на консультации";
    if (/(до\s*\d|от\s*\d|бюджет)/.test(t)) return text.trim();
    return "";
  }

  function buildBriefText() {
    return [
      "Ниша: " + (session.brief.niche || "не указана"),
      "Цель: " + (session.brief.goal || "не указана"),
      "Размещение: " + (session.brief.placement || "не указано"),
      "Аудитория: " + (session.brief.audience || "не указана"),
      "Сроки: " + (session.brief.timeline || "не указаны"),
      "Бюджет: " + (session.brief.budget || "не указан")
    ].join("; ");
  }

  function handleIntake(text) {
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
      var category = classifyNeed(buildBriefText());
      return recommendService(category);
    }
    return "";
  }

  function resolveApiNotifyUrl() {
    if (CONFIG.apiNotifyUrl) return CONFIG.apiNotifyUrl;
    var base = (CONFIG.apiBase || "").replace(/\/$/, "");
    if (!base && typeof window !== "undefined" && window.location.protocol !== "file:") {
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        base = "http://localhost:3002";
      }
    }
    if (base) return base + "/api/chatbot/notify";
    return "";
  }

  function syncOrderToTelegram(order) {
    var url = resolveApiNotifyUrl();
    if (!url) return Promise.resolve();
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: order.clientName,
        contact: order.contact,
        phone: order.phone,
        task: order.task,
        formTitle: order.formTitle,
        recommendedService: order.recommendedService,
        pageUrl: order.pageUrl,
        brief: order.brief
      })
    }).catch(function () {
      /* сервер не запущен или другой домен */
    });
  }

  function syncOrderToApi(order) {
    syncOrderToTelegram(order);
    if (!CONFIG.apiOrdersUrl) return Promise.resolve();
    var phone = order.phone || order.contact || "—";
    return fetch(CONFIG.apiOrdersUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: order.clientName,
        phone: phone,
        totalPrice: Number(order.amount) || 0,
        status: "new"
      })
    }).catch(function () {});
  }

  function createOrderFromChat(taskText, escalated) {
    var orders = readArray(CONFIG.ordersKey);
    var order = {
      id: "ORD-" + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      clientName: session.clientName || "Не указано",
      contact: session.contact
        ? session.contact + " (" + getContactMethodLabel(session.contactMethod) + ")"
        : "Не указан",
      phone:
        session.contactMethod === "whatsapp" || session.contactMethod === "phone"
          ? session.contact
          : "",
      task: taskText || "Заявка из чат-бота",
      category: escalated ? "support" : classifyNeed(taskText || ""),
      recommendedService: session.recommendedService || "",
      amount: 0,
      status: "new",
      archived: false,
      source: "chatbot",
      pageUrl: window.location.pathname,
      brief: Object.assign({}, session.brief),
      formTitle: escalated ? "Тикет оператору" : "Заявка из чат-бота"
    };
    orders.unshift(order);
    writeArray(CONFIG.ordersKey, orders);
    syncOrderToApi(order);
  }

  function escalateToOperator(reason) {
    var chats = readArray(CONFIG.chatsKey);
    var chat = chats.find(function (item) {
      return item.id === session.id;
    });
    if (chat) {
      chat.ticket = true;
      chat.ticketStatus = "open";
      chat.ticketReason = reason || "Пользователь запросил оператора";
      chat.updatedAt = new Date().toISOString();
      writeArray(CONFIG.chatsKey, chats);
    }
    createOrderFromChat(reason || "Нужен живой оператор", true);
  }

  function listServicesHtml() {
    var services = getServices();
    return services
      .slice(0, 8)
      .map(function (s) {
        return "• " + escapeHtml(s.name) + " — " + escapeHtml(formatServicePrice(s));
      })
      .join("<br>");
  }

  function botReply(userText) {
    var text = (userText || "").toLowerCase();

    if (/(оператор|живой|человек|менеджер|сложно|трудно|не понима)/.test(text)) {
      escalateToOperator(userText);
      return (
        "Передала запрос менеджеру — свяжутся в ближайшее время.<br>Можно написать напрямую: " +
        '<a href="' +
        CONFIG.managerTelegram +
        '" target="_blank" rel="noopener noreferrer">' +
        CONFIG.managerTelegramHandle +
        "</a>."
      );
    }

    if (/(калькулятор|посчитать|расчёт|расчет)/.test(text)) {
      return (
        "Предварительный расчёт — в " +
        '<a href="' +
        CONFIG.calculatorUrl +
        '">калькуляторе на сайте</a>. ' +
        "После выбора услуг можно скопировать заявку или отправить в CRM."
      );
    }

    if (/(согласен|оформ|подходит|беру)/.test(text)) {
      var taskText =
        session.intakeStep === "done"
          ? userText + ". Бриф: " + buildBriefText()
          : userText + (session.brief.niche ? ". Бриф (частично): " + buildBriefText() : "");
      createOrderFromChat(taskText, false);
      session.chatCompleted = true;
      return [
        "Отлично, оформляю заявку.",
        "Готово! Заявка сохранена — свяжусь с вами в течение 24 часов. Можно также написать в " +
          '<a href="' +
          CONFIG.managerTelegram +
          '" target="_blank" rel="noopener noreferrer">Telegram</a>.'
      ];
    }

    if (/(цена|стоим|бюджет|сколько|прайс)/.test(text)) {
      if (session.intakeStep !== "done") {
        return "Чтобы подсказать по стоимости точнее, давайте сначала чуть познакомимся с задачей. В какой сфере вы работаете или развиваете проект?";
      }
      return (
        "Ориентиры по услугам:<br>" +
        listServicesHtml() +
        "<br><br>Подробный расчёт — в " +
        '<a href="' +
        CONFIG.calculatorUrl +
        '">калькуляторе</a>.'
      );
    }

    if (session.intakeStep !== "done") {
      return handleIntake(userText);
    }

    var need = classifyNeed(userText + " " + buildBriefText());
    return recommendService(need);
  }

  function processUserMessage(text) {
    if (!session.leadReady || session.chatCompleted) return;
    var normalizedText = (text || "").trim();
    if (!normalizedText) return;
    clearQuickReplies();
    addMessage("user", escapeHtml(normalizedText));
    msgInput.value = "";
    var response = botReply(normalizedText);
    window.setTimeout(function () {
      if (Array.isArray(response)) {
        response.forEach(function (message, index) {
          window.setTimeout(function () {
            addMessage("bot", message);
          }, index * 200);
        });
      } else {
        addMessage("bot", response);
      }
      showQuickReplies();
      if (session.chatCompleted) {
        clearQuickReplies();
        msgInput.disabled = true;
        sendBtn.disabled = true;
        return;
      }
      if (session.intakeStep === "done") {
        msgInput.focus();
      }
    }, 280);
  }

  function initChatRecord() {
    session.id = "CHAT-" + Date.now().toString(36).toUpperCase();
    var chats = readArray(CONFIG.chatsKey);
    chats.unshift({
      id: session.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientName: session.clientName,
      phone: session.contact,
      contactMethod: session.contactMethod,
      leadAccepted: true,
      ticket: false,
      ticketStatus: "none",
      lastMessage: "",
      brief: Object.assign({}, session.brief),
      messages: []
    });
    writeArray(CONFIG.chatsKey, chats);
  }

  function resetToLeadState() {
    session.id = "";
    session.leadReady = false;
    session.chatCompleted = false;
    session.recommendedService = "";
    session.intakeStep = "niche";
    session.brief = {
      niche: "",
      goal: "",
      placement: "",
      audience: "",
      timeline: "",
      budget: ""
    };

    messagesEl.innerHTML = "";
    clearQuickReplies();
    setPanelPhase("lead");
    msgInput.disabled = true;
    sendBtn.disabled = true;
    msgInput.value = "";
    nameInput.value = "";
    contactMethodInput.value = "";
    contactValueInput.value = "";
    consentInput.checked = false;
    updateContactInputByMethod();
    clearLeadErrors();
    updateLeadSubmitState();
  }

  function openPanel() {
    panel.hidden = false;
    panel.classList.remove("is-open");
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        panel.classList.add("is-open");
      });
    });
    launcher.classList.add("chatbot-launcher--hidden");
    launcher.setAttribute("aria-expanded", "true");
    if (!session.leadReady) {
      resetToLeadState();
    } else {
      setPanelPhase("chat");
      msgInput.disabled = session.chatCompleted;
      sendBtn.disabled = session.chatCompleted;
    }
    window.requestAnimationFrame(function () {
      if (session.leadReady && !session.chatCompleted) msgInput.focus();
      else if (!leadScreen.hidden) nameInput.focus();
    });
  }

  function closePanel() {
    panel.hidden = true;
    panel.classList.remove("is-open");
    launcher.classList.remove("chatbot-launcher--hidden");
    launcher.setAttribute("aria-expanded", "false");
  }

  function updateLauncherContrast() {
    if (launcher.classList.contains("chatbot-launcher--hidden")) return;
    var rect = launcher.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;
    var stack = document.elementsFromPoint(centerX, centerY);
    if (!stack || !stack.length) return;

    var probeEl = null;
    for (var i = 0; i < stack.length; i += 1) {
      var el = stack[i];
      if (el === launcher || panel.contains(el)) continue;
      probeEl = el;
      break;
    }

    if (!probeEl) {
      launcher.classList.remove("is-on-light-bg");
      return;
    }

    var host = probeEl.closest(".hero, .section, .site-header, .site-footer, .final-cta, main");
    if (!host) {
      launcher.classList.remove("is-on-light-bg");
      return;
    }

    function luminanceFromRgb(bg) {
      var m = bg && bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/i);
      if (!m) return null;
      var alpha = typeof m[4] === "undefined" ? 1 : Number(m[4]);
      if (alpha === 0) return null;
      var r = Number(m[1]);
      var g = Number(m[2]);
      var b = Number(m[3]);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    }

    var node = host;
    var luminance = null;
    while (node && node !== document.documentElement) {
      var bg = window.getComputedStyle(node).backgroundColor;
      luminance = luminanceFromRgb(bg);
      if (luminance !== null) break;
      node = node.parentElement;
    }

    var isDark = true;
    if (luminance !== null) isDark = luminance < 0.52;
    if (host.classList.contains("hero")) isDark = true;

    launcher.classList.toggle("is-on-light-bg", !isDark);
  }

  closePanel();
  setPanelPhase("lead");
  msgInput.disabled = true;
  sendBtn.disabled = true;
  updateContactInputByMethod();
  updateLeadSubmitState();

  nameInput.addEventListener("input", updateLeadSubmitState);
  consentInput.addEventListener("change", updateLeadSubmitState);

  launcher.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);
  document.addEventListener("click", function (event) {
    if (panel.hidden) return;
    var path = typeof event.composedPath === "function" ? event.composedPath() : [];
    if (path.indexOf(panel) !== -1 || path.indexOf(launcher) !== -1) return;
    closePanel();
  });
  contactMethodInput.addEventListener("change", function () {
    updateContactInputByMethod();
    if (contactMethodInput.value) contactValueInput.focus();
  });
  window.addEventListener("scroll", updateLauncherContrast, { passive: true });
  window.addEventListener("resize", updateLauncherContrast);
  window.addEventListener("load", function () {
    updateLauncherContrast();
    window.setTimeout(updateLauncherContrast, 200);
  });

  contactValueInput.addEventListener("input", function () {
    if (contactMethodInput.value === "whatsapp" || contactMethodInput.value === "phone") {
      contactValueInput.value = formatRuPhone(contactValueInput.value);
    }
    updateLeadSubmitState();
  });

  leadForm.addEventListener("submit", function (event) {
    event.preventDefault();
    updateLeadErrors(true);
    if (!isLeadFormComplete()) {
      focusFirstLeadError();
      return;
    }
    session.clientName = nameInput.value.trim();
    session.contact = normalizeContactByMethod();
    session.contactMethod = contactMethodInput.value;
    session.leadReady = true;
    session.chatCompleted = false;
    initChatRecord();
    setPanelPhase("chat");
    msgInput.disabled = false;
    sendBtn.disabled = false;
    session.intakeStep = "niche";
    session.brief = {
      niche: "",
      goal: "",
      placement: "",
      audience: "",
      timeline: "",
      budget: ""
    };
    addMessage("bot", "Здравствуйте, " + escapeHtml(session.clientName) + "! Рада быть на связи.");
    addMessage(
      "bot",
      "Я задам буквально несколько вопросов.<br><br>Расскажите, пожалуйста, в какой сфере вы работаете или что за проект планируете?"
    );
    showQuickReplies();
    window.requestAnimationFrame(function () {
      msgInput.focus();
    });
  });

  msgForm.addEventListener("submit", function (event) {
    event.preventDefault();
    processUserMessage(msgInput.value);
  });

  if (headerNewBtn) headerNewBtn.addEventListener("click", resetToLeadState);
  updateLauncherContrast();
})();
