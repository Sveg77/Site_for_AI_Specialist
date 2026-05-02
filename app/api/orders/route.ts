import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { clientName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } }
      ]
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return Response.json(orders);
}

export async function POST(req: Request) {
  const data = await req.json();
  const created = await prisma.order.create({ data });
  return Response.json(created);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const deleted = await prisma.order.delete({ where: { id } });
  return Response.json(deleted);
}
