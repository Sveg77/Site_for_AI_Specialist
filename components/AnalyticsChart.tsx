"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const demoData = [
  { day: "Пн", orders: 3 },
  { day: "Вт", orders: 5 },
  { day: "Ср", orders: 4 },
  { day: "Чт", orders: 7 },
  { day: "Пт", orders: 6 }
];

export function AnalyticsChart() {
  return (
    <div className="card mt-6 h-72">
      <p className="mb-3 text-sm text-slate-400">Динамика заказов (демо)</p>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={demoData}>
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line type="monotone" dataKey="orders" stroke="#14b8a6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
