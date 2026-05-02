(function () {
  "use strict";

  const AUTO_THRESHOLD = 20000;
  const AUTO_RATE = 0.1;

  function money(n) {
    return `${Math.round(n).toLocaleString("ru-RU")} ₽`;
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
        recalc();
      });
    });
  }

  function optionsSum() {
    let s = 0;
    document.querySelectorAll(".checkbox-item input[type=checkbox]").forEach((cb) => {
      if (cb.checked) s += parseFloat(cb.dataset.price || "0") || 0;
    });
    return s;
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
    set("autoDiscountLabel", autoDisc);
    set("afterAutoDiscountLabel", afterAuto);
    set("extraHoursLabel", extraCost);
    set("discountLabel", manualDisc);

    const tp = $("totalPrice");
    if (tp) {
      tp.textContent = money(total);
      tp.dataset.lastTotal = String(Math.round(total));
    }

    const sumList = $("selectedSummaryList");
    if (sumList) {
      sumList.textContent = lines.length
        ? lines.map((l) => `• ${l.title}: ${money(l.amount)}`).join("\n")
        : "Основные услуги пока не выбраны.";
    }

    const summary = $("summaryBox");
    if (summary) {
      const name = $("clientName")?.value?.trim() || "—";
      const phone = $("clientPhone")?.value?.trim() || "—";
      summary.textContent = [
        `Клиент: ${name}`,
        `Телефон: ${phone}`,
        `Услуги: ${money(servicesRaw)}`,
        `После коэфф.: ${money(afterCoeffs)}`,
        `Опции: ${money(optSum)}`,
        `Итого: ${money(total)}`
      ].join("\n");
    }
  }

  function addLine() {
    const opt = getOption();
    if (!opt) return;
    const qty = Math.max(1, parseInt($("serviceQuantity")?.value || "1", 10) || 1);
    const amt = lineAmount(opt, qty);
    const title = opt.textContent.trim().split("—")[0].trim();
    const subtitle = `× ${qty} · ${opt.dataset.unitNote || ""}`;
    lines.push({ id: lineId++, title, subtitle, amount: amt });
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
      alert("Заказ сохранён в CRM. Откройте раздел «Заказы» и нажмите «Обновить список».");
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

    [
      "complexity",
      "urgency",
      "extraHours",
      "hourRate",
      "discount",
      "serviceQuantity"
    ].forEach((id) => $(id)?.addEventListener("input", recalc));
    document.querySelectorAll(".checkbox-item input").forEach((cb) => cb.addEventListener("change", recalc));

    $("resetBtn")?.addEventListener("click", () => {
      lines = [];
      renderLines();
      recalc();
    });

    $("sendToCrmBtn")?.addEventListener("click", sendCrm);

    $("copySummaryBtn")?.addEventListener("click", async () => {
      const t = $("summaryBox")?.textContent || "";
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
