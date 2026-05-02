import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container-page py-10">
      <section className="grid gap-6 md:grid-cols-2">
        <article className="card">
          <p className="text-sm text-slate-400">Сайт специалиста</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight">AI SaaS CRM + Website</h1>
          <p className="mt-4 text-slate-300">
            Fullstack-платформа по вашему ТЗ: CRM заказы, аналитика, AI менеджер, калькулятор и
            точка расширения под Telegram-бот и подписки.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/calculator" className="btn-primary">
              Калькулятор
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Dashboard
            </Link>
          </div>
        </article>
        <article className="card">
          <p className="text-sm text-slate-400">Стек</p>
          <ul className="mt-4 space-y-2 text-slate-200">
            <li>Next.js App Router + TypeScript</li>
            <li>Tailwind CSS</li>
            <li>Prisma + PostgreSQL</li>
            <li>NextAuth (JWT)</li>
            <li>OpenAI API</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
