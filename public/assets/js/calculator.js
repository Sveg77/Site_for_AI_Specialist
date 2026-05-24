(function () {
  "use strict";

  const AUTO_THRESHOLD = 20000;
  const AUTO_RATE = 0.1;

  function money(n) {
    return `${Math.round(n).toLocaleString("ru-RU")} ₽`;
  }

  /** Сумма удержания/скидки со знаком минус (как в макете: «− 10 000 ₽»). */
  function moneyMinus(n) {
    return "− " + money(Math.max(0, n));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function basePriceHint(opt) {
    if (!opt) return "—";
    const base = parseFloat(opt.value);
    if (!Number.isFinite(base) || base <= 0) return "Бесплатно";
    if (opt.dataset.isFrom === "true") return "от " + money(base);
    return money(base);
  }

  function $(id) {
    return document.getElementById(id);
  }

  let lines = [];
  let lineId = 1;

  function getOption() {
    const sel = $("serviceType");
    return sel ? sel.options[sel.selectedIndex] : null;
  }

  function lineAmount(opt, qty) {
    if (!opt) return 0;
    const base = parseFloat(opt.value) || 0;
    const unit = opt.dataset.unitType || "fixed";
    const packSize = Math.max(1, parseInt(opt.dataset.packageSize || "1", 10));
    const q = Math.max(1, qty);

    switch (unit) {
      case "hour":
      case "chars1000":
      case "piece":
      case "story":
      case "photo":
        return base * q;
      case "package":
        return base * Math.ceil(q / packSize);
      case "fixed":
      default:
        return base * q;
    }
  }

  function updateServiceMeta() {
    const opt = getOption();
    const note = $("serviceUnitNote");
    const from = $("serviceFromNote");
    const qtyLabel = $("serviceQuantityLabel");
    const qtyHelp = $("serviceQuantityHelp");
    if (!opt || !note || !from) return;

    note.textContent = opt.dataset.unitNote || "—";
    from.textContent = opt.dataset.isFrom === "true" ? "От … (минимум)" : "Фиксированная стоимость";

    const unit = opt.dataset.unitType || "fixed";
    if (qtyLabel) {
      if (unit === "hour") qtyLabel.textContent = "Часы";
      else if (unit === "chars1000") qtyLabel.textContent = "Тысячи знаков";
      else if (unit === "piece" || unit === "photo") qtyLabel.textContent = "Количество (шт.)";
      else if (unit === "package") qtyLabel.textContent = "Количество единиц в пакетах";
      else if (unit === "story") qtyLabel.textContent = "Количество сториз";
      else qtyLabel.textContent = "Количество";
    }
    if (qtyHelp) {
      qtyHelp.textContent =
        unit === "fixed"
          ? "Для фиксированных услуг обычно используется 1."
          : "Укажите объём по тарифу выбранной услуги.";
    }
  }

  function renderLines() {
    const box = $("selectedServicesContainer");
    if (!box) return;
    if (!lines.length) {
      box.innerHTML =
        '<div class="empty-state">Пока ни одна основная услуга не добавлена.</div>';
      return;
    }
    box.innerHTML = lines
      .map(
        (l) => `
      <div class="service-item" data-id="${l.id}">
        <div class="service-item-top">
          <div>
            <div class="service-item-title">${l.title}</div>
            <div class="service-item-subtitle">${l.subtitle}</div>
          </div>
          <button type="button" class="btn-delete" data-del="${l.id}">Удалить</button>
        </div>
        <div class="service-item-total"><span>Итого по позиции</span><strong>${money(l.amount)}</strong></div>
      </div>`
      )
      .join("");

    box.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-del"));
        lines = lines.filter((x) => x.id !== id);
        renderLines();
        recalc();
      });
    });
  }

  function renderOrderPreview(servicesRaw, autoDisc) {
    const listEl = $("orderServicesList");
    const subEl = $("orderPreviewSubtotal");
    const discEl = $("orderPreviewDiscountNotice");
    if (!listEl || !subEl || !discEl) return;

    if (!lines.length) {
      listEl.className = "order-preview-list order-preview-list--empty";
      listEl.textContent = "Добавьте услуги слева — здесь появится состав предварительного расчёта.";
      subEl.hidden = true;
      subEl.textContent = "";
      discEl.hidden = true;
      return;
    }

    listEl.className = "order-preview-list";
    listEl.innerHTML = lines
      .map((l, i) => {
        const n = i + 1;
        const name = escapeHtml(l.namePlain || l.title);
        const hint = escapeHtml(l.priceHint || "—");
        const uw = escapeHtml(l.unitWord || "услуга");
        const qty = Number(l.qty) || 1;
        const lineText = `${n}. ${name} — ${hint} — ${qty} × ${uw} =`;
        return `<div class="order-preview-item"><div class="order-preview-item-line">${lineText}</div><div class="order-preview-item-sum">${escapeHtml(
          money(l.amount)
        )}</div></div>`;
      })
      .join("");

    subEl.hidden = false;
    subEl.textContent = "Итого по услугам до коэффициентов: " + money(servicesRaw);
    discEl.hidden = autoDisc <= 0;
  }

  function optionsSum() {
    let s = 0;
    document.querySelectorAll(".checkbox-item input[type=checkbox]").forEach((cb) => {
      if (cb.checked) s += parseFloat(cb.dataset.price || "0") || 0;
    });
    return s;
  }

  /** Текст выбранного пункта select (подпись «Базовый — x1.0» и т.д.). */
  function selectOptionText(selectId) {
    const sel = $(selectId);
    if (!sel) return "—";
    const opt = sel.options[sel.selectedIndex];
    return opt ? opt.textContent.trim() : "—";
  }

  /** Список выбранных доп. опций для текстовой заявки. */
  function selectedExtraOptionsText() {
    const parts = [];
    document.querySelectorAll(".checkbox-item input[type=checkbox]").forEach((cb) => {
      if (!cb.checked) return;
      const lab = document.querySelector(`label[for="${cb.id}"]`);
      parts.push(lab ? lab.textContent.trim() : cb.id);
    });
    return parts.length ? parts.join("; ") : "без дополнительных опций";
  }

  function nzLabel(v) {
    const t = String(v ?? "").trim();
    return t.length ? t : "не указано";
  }

  /** Плоский текст заявки для копирования (без HTML). */
  let lastPlainSummary = "";

  function renderApplicationSummary(ctx) {
    const summary = $("summaryBox");
    if (!summary) return;

    const {
      servicesRaw,
      afterCoeffs,
      optSum,
      autoBase,
      autoDisc,
      afterAuto,
      extraH,
      rate,
      extraCost,
      discPct,
      manualDisc,
      total
    } = ctx;

    const clientNameRaw = $("clientName")?.value?.trim() || "";
    const phoneRaw = $("clientPhone")?.value?.trim() || "";
    const commentRaw = $("projectComment")?.value?.trim() || "";

    const plain = [];
    plain.push("Заявка на предварительный расчёт услуг специалиста по нейросетям");
    plain.push("");
    plain.push(`Клиент: ${nzLabel(clientNameRaw)}`);
    plain.push(`Телефон: ${nzLabel(phoneRaw)}`);
    plain.push("");
    if (!lines.length) {
      plain.push("Основные услуги: Основные услуги не выбраны");
    } else {
      plain.push("Основные услуги:");
      lines.forEach((l, i) => {
        const nm = l.namePlain || l.title;
        const h = l.priceHint || "—";
        const uw = l.unitWord || "услуга";
        const q = Number(l.qty) || 1;
        plain.push(`${i + 1}. ${nm} — ${h} — ${q} × ${uw} = ${money(l.amount)}`);
      });
    }
    plain.push(`Итого по основным услугам: ${money(servicesRaw)}`);
    plain.push("");
    plain.push(`Сложность: ${selectOptionText("complexity")}`);
    plain.push(`Срочность: ${selectOptionText("urgency")}`);
    plain.push(`Сумма после коэффициентов: ${money(afterCoeffs)}`);
    plain.push("");
    plain.push(`Дополнительные опции: ${selectedExtraOptionsText()}`);
    plain.push(`Стоимость доп. опций: ${money(optSum)}`);
    plain.push("");
    plain.push(`Сумма для автоскидки: ${money(autoBase)}`);
    plain.push(`Автоматическая скидка 10%: ${autoDisc > 0 ? "применена" : "не применена"}`);
    plain.push(`Размер автоскидки: ${money(autoDisc)}`);
    plain.push(`Сумма после автоскидки: ${money(afterAuto)}`);
    plain.push("");
    plain.push(`Доп. часы: ${extraH}`);
    plain.push(`Ставка за час доработок: ${money(rate)}`);
    plain.push(`Стоимость доработок: ${money(extraCost)}`);
    plain.push("");
    plain.push(`Ручная скидка: ${discPct}%`);
    plain.push(`Размер ручной скидки: ${money(manualDisc)}`);
    plain.push("");
    plain.push(`Комментарий: ${commentRaw ? commentRaw : "не указан"}`);
    plain.push("");
    plain.push("────────────────────────");
    plain.push(`Предварительная итоговая стоимость: ${money(total)}`);
    plain.push("");
    plain.push(
      "Запрос на услуги не является оформленным заказом. Расчёт предварительный. Окончательная стоимость определяется после оформления проекта."
    );

    lastPlainSummary = plain.join("\n");

    const p = (text) => `<p class="summary-line">${escapeHtml(text)}</p>`;
    const gap = () => '<div class="summary-block-gap"></div>';

    const html = [];
    html.push('<div class="summary-request-title">Заявка на предварительный расчёт услуг специалиста по нейросетям</div>');
    html.push(p(`Клиент: ${nzLabel(clientNameRaw)}`));
    html.push(p(`Телефон: ${nzLabel(phoneRaw)}`));
    html.push(gap());
    if (!lines.length) {
      html.push(p("Основные услуги: Основные услуги не выбраны"));
    } else {
      html.push(p("Основные услуги:"));
      lines.forEach((l, i) => {
        const nm = l.namePlain || l.title;
        const h = l.priceHint || "—";
        const uw = l.unitWord || "услуга";
        const q = Number(l.qty) || 1;
        html.push(p(`${i + 1}. ${nm} — ${h} — ${q} × ${uw} = ${money(l.amount)}`));
      });
    }
    html.push(p(`Итого по основным услугам: ${money(servicesRaw)}`));
    html.push(gap());
    html.push(p(`Сложность: ${selectOptionText("complexity")}`));
    html.push(p(`Срочность: ${selectOptionText("urgency")}`));
    html.push(p(`Сумма после коэффициентов: ${money(afterCoeffs)}`));
    html.push(gap());
    html.push(p(`Дополнительные опции: ${selectedExtraOptionsText()}`));
    html.push(p(`Стоимость доп. опций: ${money(optSum)}`));
    html.push(gap());
    html.push(p(`Сумма для автоскидки: ${money(autoBase)}`));
    html.push(p(`Автоматическая скидка 10%: ${autoDisc > 0 ? "применена" : "не применена"}`));
    html.push(p(`Размер автоскидки: ${money(autoDisc)}`));
    html.push(p(`Сумма после автоскидки: ${money(afterAuto)}`));
    html.push(gap());
    html.push(p(`Доп. часы: ${extraH}`));
    html.push(p(`Ставка за час доработок: ${money(rate)}`));
    html.push(p(`Стоимость доработок: ${money(extraCost)}`));
    html.push(gap());
    html.push(p(`Ручная скидка: ${discPct}%`));
    html.push(p(`Размер ручной скидки: ${money(manualDisc)}`));
    html.push(gap());
    html.push(p(`Комментарий: ${commentRaw ? commentRaw : "не указан"}`));
    html.push('<div class="summary-total-rule" aria-hidden="true"></div>');
    html.push(`<p class="summary-total-line">Предварительная итоговая стоимость: ${escapeHtml(money(total))}</p>`);
    html.push(
      p(
        "Запрос на услуги не является оформленным заказом. Расчёт предварительный. Окончательная стоимость определяется после оформления проекта."
      )
    );

    summary.innerHTML = html.join("");
  }

  function recalc() {
    const servicesRaw = lines.reduce((a, l) => a + l.amount, 0);
    const comp = parseFloat($("complexity")?.value || "1");
    const urg = parseFloat($("urgency")?.value || "1");
    const afterCoeffs = servicesRaw * comp * urg;
    const optSum = optionsSum();
    const autoBase = afterCoeffs + optSum;
    let autoDisc = 0;
    if (autoBase > AUTO_THRESHOLD) autoDisc = autoBase * AUTO_RATE;
    const afterAuto = autoBase - autoDisc;
    const extraH = Math.max(0, parseFloat($("extraHours")?.value || "0") || 0);
    const rate = Math.max(0, parseFloat($("hourRate")?.value || "0") || 0);
    const extraCost = extraH * rate;
    const discPct = Math.min(100, Math.max(0, parseFloat($("discount")?.value || "0") || 0));
    const beforeManual = afterAuto + extraCost;
    const manualDisc = beforeManual * (discPct / 100);
    const total = beforeManual - manualDisc;

    const set = (id, v) => {
      const el = $(id);
      if (el) el.textContent = money(v);
    };

    set("servicesRawTotalLabel", servicesRaw);
    const cl = $("complexityLabel");
    if (cl) cl.textContent = "x" + String(comp);
    const ul = $("urgencyLabel");
    if (ul) ul.textContent = "x" + String(urg);
    set("servicesCalculatedTotalLabel", afterCoeffs);
    set("optionsLabel", optSum);
    set("autoDiscountBaseLabel", autoBase);

    const autoDiscEl = $("autoDiscountLabel");
    if (autoDiscEl) autoDiscEl.textContent = moneyMinus(autoDisc);

    set("afterAutoDiscountLabel", afterAuto);
    set("extraHoursLabel", extraCost);

    const manualDiscEl = $("discountLabel");
    if (manualDiscEl) manualDiscEl.textContent = moneyMinus(manualDisc);

    const resultNote = $("resultNote");
    if (resultNote) {
      if (autoDisc > 0) {
        resultNote.classList.add("result-note--discount-on");
        resultNote.textContent =
          "Автоматическая скидка 10% применена, так как сумма услуг с учётом доп. опций превышает 20 000 ₽.";
      } else {
        resultNote.classList.remove("result-note--discount-on");
        resultNote.textContent =
          "Автоматическая скидка 10% применяется, если сумма услуг после коэффициентов вместе с доп. опциями превышает 20 000 ₽.";
      }
    }

    const tp = $("totalPrice");
    if (tp) {
      tp.textContent = money(total);
      tp.dataset.lastTotal = String(Math.round(total));
    }

    renderOrderPreview(servicesRaw, autoDisc);

    renderApplicationSummary({
      servicesRaw,
      afterCoeffs,
      optSum,
      autoBase,
      autoDisc,
      afterAuto,
      extraH,
      rate,
      extraCost,
      discPct,
      manualDisc,
      total
    });
  }

  function addLine() {
    const opt = getOption();
    if (!opt) return;
    const qty = Math.max(1, parseInt($("serviceQuantity")?.value || "1", 10) || 1);
    const amt = lineAmount(opt, qty);
    const fullText = opt.textContent.trim();
    const segs = fullText.split("—").map((s) => s.trim());
    const namePlain = segs[0] || fullText;
    const fromTail = segs.length > 1 ? segs.slice(1).join(" — ").trim() : "";
    const priceHint = fromTail || basePriceHint(opt);
    const unitWord = opt.dataset.unitLabel || "услуга";
    const title = namePlain;
    const subtitle = `× ${qty} · ${opt.dataset.unitNote || ""}`;
    lines.push({
      id: lineId++,
      title,
      namePlain,
      priceHint,
      unitWord,
      qty,
      subtitle,
      amount: amt
    });
    renderLines();
    recalc();
  }

  async function sendCrm() {
    const tp = $("totalPrice");
    const num = parseFloat(tp?.dataset?.lastTotal || "0") || 0;
    const clientName = $("clientName")?.value?.trim() || "Клиент";
    const phone = $("clientPhone")?.value?.trim() || "—";
    const apiUrl = new URL("/api/orders", window.location.origin).toString();
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName, phone, totalPrice: num })
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      alert("Заявка сохранена в CRM. Откройте раздел «Заказы» и нажмите «Обновить список».");
      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({ type: "crm-order-created" }, window.location.origin);
        } catch (_) {}
      }
      return;
    }
    const msg = body && body.error ? String(body.error) : "HTTP " + res.status;
    alert("Ошибка CRM: " + msg);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.__applyI18n === "function") window.__applyI18n();

    $("serviceType")?.addEventListener("change", updateServiceMeta);
    updateServiceMeta();

    $("addServiceBtn")?.addEventListener("click", addLine);

    function bindRecalc(id) {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", recalc);
      el.addEventListener("change", recalc);
    }

    ["complexity", "urgency", "extraHours", "hourRate", "discount", "serviceQuantity"].forEach(bindRecalc);

    document.querySelectorAll(".checkbox-item input").forEach((cb) => {
      cb.addEventListener("change", recalc);
      cb.addEventListener("input", recalc);
    });

    ["clientName", "clientPhone", "projectComment"].forEach((id) => bindRecalc(id));

    $("resetBtn")?.addEventListener("click", () => {
      lines = [];
      renderLines();
      recalc();
    });

    $("sendToCrmBtn")?.addEventListener("click", sendCrm);

    $("copySummaryBtn")?.addEventListener("click", async () => {
      const t = lastPlainSummary || $("summaryBox")?.innerText || "";
      try {
        await navigator.clipboard.writeText(t);
        alert("Скопировано в буфер обмена.");
      } catch {
        alert(t);
      }
    });

    renderLines();
    recalc();
  });
})();
