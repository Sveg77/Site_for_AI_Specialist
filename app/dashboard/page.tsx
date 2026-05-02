import { StatsCards } from "@/components/StatsCards";
import { AnalyticsChart } from "@/components/AnalyticsChart";

async function getAnalytics() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/analytics`, {
      cache: "no-store"
    });
    if (!res.ok) throw new Error("analytics fetch failed");
    return (await res.json()) as { total: number; revenue: number; avg: number };
  } catch {
    return { total: 0, revenue: 0, avg: 0 };
  }
}

export default async function DashboardPage() {
  const data = await getAnalytics();

  return (
    <main className="container-page py-10">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <StatsCards data={data} />
      <AnalyticsChart />
    </main>
  );
}
