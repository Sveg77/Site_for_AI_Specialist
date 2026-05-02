import { StatsCards } from "@/components/StatsCards";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { prisma } from "@/lib/prisma";

async function getAnalytics() {
  const orders = await prisma.order.findMany();
  const total = orders.length;
  const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  return { total, revenue, avg: total ? revenue / total : 0 };
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
