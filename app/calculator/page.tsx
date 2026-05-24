export default function CalculatorPage() {
  return (
    <main className="container-page py-6">
      <h1 className="mb-4 text-3xl font-bold">Калькулятор → CRM</h1>
      <p className="mb-4 text-slate-400">
        Ниже ваш калькулятор в том же виде. Кнопка «Отправить в CRM» создаёт запись заявки через{" "}
        <code className="text-teal-300">POST /api/orders</code> (имя, телефон, предварительная итоговая сумма).
        Это не оформленный заказ: сумма в CRM — предварительная оценка до согласования проекта.
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <iframe
          title="Калькулятор услуг"
          src="/Калькулятор.html?embed=1#calculator"
          className="h-[min(2400px,90vh)] w-full border-0"
          style={{ minHeight: "800px" }}
        />
      </div>
    </main>
  );
}
