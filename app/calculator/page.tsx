"use client";

import { useState } from "react";

export default function CalculatorPage() {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [totalPrice, setTotalPrice] = useState(10000);
  const [status, setStatus] = useState("");

  async function sendToCrm() {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName,
        phone,
        totalPrice
      })
    });

    if (res.ok) {
      setStatus("Заявка отправлена в CRM.");
      return;
    }

    setStatus("Ошибка отправки. Проверьте API/БД.");
  }

  return (
    <main className="container-page py-10">
      <h1 className="mb-6 text-3xl font-bold">Калькулятор -> CRM</h1>
      <section className="card max-w-xl space-y-4">
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Имя клиента"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="number"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          value={totalPrice}
          onChange={(e) => setTotalPrice(Number(e.target.value))}
        />
        <button className="btn-primary" onClick={sendToCrm}>
          Сохранить в CRM
        </button>
        {status ? <p className="text-slate-300">{status}</p> : null}
      </section>
    </main>
  );
}
