"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  clientName: string;
  phone: string;
  totalPrice: number;
  status: string;
};

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [search, setSearch] = useState("");

  async function loadOrders() {
    const res = await fetch(`/api/orders?search=${encodeURIComponent(search)}`);
    const data = (await res.json()) as Order[];
    setItems(data);
  }

  async function deleteOrder(id: string) {
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    await loadOrders();
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container-page py-10">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">Заказы</h1>
        <input
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Поиск по имени или телефону"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary" onClick={loadOrders}>
          Найти
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2">Клиент</th>
              <th className="py-2">Телефон</th>
              <th className="py-2">Сумма</th>
              <th className="py-2">Статус</th>
              <th className="py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id} className="border-t border-slate-800">
                <td className="py-3">{order.clientName}</td>
                <td className="py-3">{order.phone}</td>
                <td className="py-3">{Math.round(order.totalPrice)} ₽</td>
                <td className="py-3">{order.status}</td>
                <td className="py-3">
                  <button className="btn-secondary" onClick={() => deleteOrder(order.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
