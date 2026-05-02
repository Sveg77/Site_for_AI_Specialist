import Link from "next/link";

const links = [
  { href: "/", label: "Сайт" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Заказы" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/login", label: "Вход" }
];

export function Nav() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="container-page flex min-h-16 items-center justify-between gap-4">
        <div className="font-semibold">AI SaaS CRM</div>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="btn-secondary">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
