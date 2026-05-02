"use client";

import { useEffect, useState } from "react";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VALUES,
  isOrderStatus,
  type OrderStatusValue
} from "@/lib/orderStatus";

type Order = {
  id: string;
  clientName: string;
  phone: string;
  totalPrice: number;
  status: string;
  createdAt: string;
};

function statusLabel(status: string): string {
  if (isOrderStatus(status)) return ORDER_STATUS_LABELS[status];
  return status || "—";
}

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({
    clientName: "",
    phone: "",
    totalPrice: "",
    status: "new" as OrderStatusValue
  });
  const [editError, setEditError] = useState<string | null>(null);

  function buildQueryString() {
    const p = new URLSearchParams();
    if (search.trim()) p.set("search", search.trim());
    if (filterStatus) p.set("status", filterStatus);
    const min = minTotal.trim();
    const max = maxTotal.trim();
    if (min) p.set("minTotal", min);
    if (max) p.set("maxTotal", max);
    return p.toString();
  }

  async function loadOrders() {
    setLoadError(null);
    const qs = buildQueryString();
    const res = await fetch(qs ? `/api/orders?${qs}` : "/api/orders", {
      cache: "no-store"
    });
    const data = await res.json();
    if (!res.ok) {
      setItems([]);
      setLoadError(typeof data?.error === "string" ? data.error : `Ошибка ${res.status}`);
      return;
    }
    if (!Array.isArray(data)) {
      setItems([]);
      setLoadError("Некорректный ответ сервера");
      return;
    }
    setItems(data);
  }

  async function resetFiltersAndReload() {
    setSearch("");
    setFilterStatus("");
    setMinTotal("");
    setMaxTotal("");
    setLoadError(null);
    const res = await fetch("/api/orders", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setItems([]);
      setLoadError(typeof data?.error === "string" ? data.error : `Ошибка ${res.status}`);
      return;
    }
    if (!Array.isArray(data)) {
      setItems([]);
      setLoadError("Некорректный ответ сервера");
      return;
    }
    setItems(data);
  }

  async function patchOrder(id: string, patch: Record<string, unknown>) {
    setSavingId(id);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(typeof data?.error === "string" ? data.error : `Ошибка ${res.status}`);
        return;
      }
      await loadOrders();
    } finally {
      setSavingId(null);
    }
  }

  async function deleteOrder(id: string) {
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    await loadOrders();
  }

  function openEdit(order: Order) {
    setEditError(null);
    setEditOrder(order);
    setEditForm({
      clientName: order.clientName,
      phone: order.phone,
      totalPrice: String(order.totalPrice),
      status: isOrderStatus(order.status) ? order.status : "new"
    });
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editOrder) return;
    setEditError(null);
    const totalPrice = Number(editForm.totalPrice.replace(",", "."));
    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
      setEditError("Укажите корректную сумму");
      return;
    }
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editOrder.id,
        clientName: editForm.clientName,
        phone: editForm.phone,
        totalPrice,
        status: editForm.status
      })
    });
    const data = await res.json();
    if (!res.ok) {
      setEditError(typeof data?.error === "string" ? data.error : `Ошибка ${res.status}`);
      return;
    }
    setEditOrder(null);
    await loadOrders();
  }

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- только первый показ списка
  }, []);

  return (
    <main className="container-page py-10">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">Заказы</h1>
      </div>

      <div className="card mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          Поиск
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            placeholder="Имя или телефон"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          Статус
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Все</option>
            {ORDER_STATUS_VALUES.map((v) => (
              <option key={v} value={v}>
                {ORDER_STATUS_LABELS[v]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          Сумма от, ₽
          <input
            type="number"
            min={0}
            className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={minTotal}
            onChange={(e) => setMinTotal(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          Сумма до, ₽
          <input
            type="number"
            min={0}
            className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={maxTotal}
            onChange={(e) => setMaxTotal(e.target.value)}
          />
        </label>
        <button type="button" className="btn-primary" onClick={loadOrders}>
          Применить фильтры
        </button>
        <button type="button" className="btn-secondary" onClick={() => void resetFiltersAndReload()}>
          Сбросить
        </button>
        <button type="button" className="btn-secondary" onClick={loadOrders}>
          Обновить
        </button>
      </div>

      {loadError ? (
        <p className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-red-200">{loadError}</p>
      ) : null}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2 pr-2">Дата</th>
              <th className="py-2 pr-2">Клиент</th>
              <th className="py-2 pr-2">Телефон</th>
              <th className="py-2 pr-2">Сумма</th>
              <th className="py-2 pr-2">Статус</th>
              <th className="py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id} className="border-t border-slate-800">
                <td className="py-3 pr-2 whitespace-nowrap text-slate-400">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "—"}
                </td>
                <td className="py-3 pr-2">{order.clientName}</td>
                <td className="py-3 pr-2">{order.phone}</td>
                <td className="py-3 pr-2">{Math.round(order.totalPrice)} ₽</td>
                <td className="py-3 pr-2">
                  <select
                    className="max-w-[13rem] rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100"
                    value={order.status}
                    title={statusLabel(order.status)}
                    disabled={savingId === order.id}
                    onChange={(e) => {
                      patchOrder(order.id, { status: e.target.value });
                    }}
                  >
                    {!isOrderStatus(order.status) ? (
                      <option value={order.status}>
                        {order.status || "—"} (текущий)
                      </option>
                    ) : null}
                    {ORDER_STATUS_VALUES.map((v) => (
                      <option key={v} value={v}>
                        {ORDER_STATUS_LABELS[v]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary text-xs py-1 px-2" onClick={() => openEdit(order)}>
                      Править
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-xs py-1 px-2"
                      onClick={() => deleteOrder(order.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editOrder ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-order-title"
        >
          <form
            className="card w-full max-w-md border-slate-700 shadow-xl"
            onSubmit={submitEdit}
          >
            <h2 id="edit-order-title" className="mb-4 text-lg font-semibold">
              Заказ: {editOrder.clientName}
            </h2>
            {editError ? <p className="mb-3 text-sm text-red-300">{editError}</p> : null}
            <label className="mb-3 flex flex-col gap-1 text-sm text-slate-400">
              Клиент
              <input
                required
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                value={editForm.clientName}
                onChange={(e) => setEditForm((f) => ({ ...f, clientName: e.target.value }))}
              />
            </label>
            <label className="mb-3 flex flex-col gap-1 text-sm text-slate-400">
              Телефон
              <input
                required
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </label>
            <label className="mb-3 flex flex-col gap-1 text-sm text-slate-400">
              Сумма, ₽
              <input
                required
                type="text"
                inputMode="decimal"
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                value={editForm.totalPrice}
                onChange={(e) => setEditForm((f) => ({ ...f, totalPrice: e.target.value }))}
              />
            </label>
            <label className="mb-4 flex flex-col gap-1 text-sm text-slate-400">
              Статус
              <select
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, status: e.target.value as OrderStatusValue }))
                }
              >
                {ORDER_STATUS_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {ORDER_STATUS_LABELS[v]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setEditOrder(null)}>
                Отмена
              </button>
              <button type="submit" className="btn-primary">
                Сохранить
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
