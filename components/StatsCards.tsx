type Stats = {
  total: number;
  revenue: number;
  avg: number;
};

export function StatsCards({ data }: { data: Stats }) {
  const cards = [
    { title: "Заказы", value: data.total.toString() },
    { title: "Выручка", value: `${Math.round(data.revenue)} ₽` },
    { title: "Средний чек", value: `${Math.round(data.avg)} ₽` }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <article key={card.title} className="card">
          <p className="text-sm text-slate-400">{card.title}</p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
        </article>
      ))}
    </div>
  );
}
