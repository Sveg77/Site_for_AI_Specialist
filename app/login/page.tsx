"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.ok) {
      setInfo("Успешный вход. Откройте /dashboard.");
      return;
    }

    setInfo("Ошибка входа.");
  }

  return (
    <main className="container-page py-10">
      <h1 className="mb-6 text-3xl font-bold">Вход</h1>
      <form onSubmit={onSubmit} className="card max-w-md space-y-4">
        <input
          type="email"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit">
          Войти
        </button>
        {info ? <p className="text-slate-300">{info}</p> : null}
      </form>
    </main>
  );
}
