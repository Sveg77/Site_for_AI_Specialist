import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany();
  const total = orders.length;
  const revenue = orders.reduce((sum, item) => sum + item.totalPrice, 0);

  return Response.json({
    total,
    revenue,
    avg: total ? revenue / total : 0
  });
}
