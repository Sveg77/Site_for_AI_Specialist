import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isOrderStatus, normalizeOrderStatus } from "@/lib/orderStatus";

/** Не кэшировать ответ: иначе при сборке/первом запросе можно «застрять» на пустом списке. */
export const dynamic = "force-dynamic";

function parseOptionalNumber(v: string | null): number | undefined {
  if (v == null || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawSearch = searchParams.get("search") || "";
  const search = rawSearch.trim();
  const statusParam = (searchParams.get("status") || "").trim();
  const minTotal = parseOptionalNumber(searchParams.get("minTotal"));
  const maxTotal = parseOptionalNumber(searchParams.get("maxTotal"));

  const and: Prisma.OrderWhereInput[] = [];

  if (search.length > 0) {
    and.push({
      OR: [{ clientName: { contains: search } }, { phone: { contains: search } }]
    });
  }
  if (statusParam.length > 0 && isOrderStatus(statusParam)) {
    and.push({ status: statusParam });
  }
  if (minTotal !== undefined) {
    and.push({ totalPrice: { gte: minTotal } });
  }
  if (maxTotal !== undefined) {
    and.push({ totalPrice: { lte: maxTotal } });
  }

  const where: Prisma.OrderWhereInput | undefined =
    and.length > 0 ? { AND: and } : undefined;

  try {
    const orders = await prisma.order.findMany({
      ...(where ? { where } : {}),
      orderBy: {
        createdAt: "desc"
      }
    });
    return NextResponse.json(orders, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка базы";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      clientName?: string;
      phone?: string;
      totalPrice?: number;
      status?: string;
    };

    const clientName = String(body.clientName ?? "").trim() || "Без имени";
    const phone = String(body.phone ?? "").trim() || "—";
    const totalPrice = Number(body.totalPrice);
    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
      return NextResponse.json({ error: "Некорректная сумма" }, { status: 400 });
    }

    const created = await prisma.order.create({
      data: {
        clientName,
        phone,
        totalPrice,
        status: normalizeOrderStatus(body.status)
      }
    });
    return NextResponse.json(created);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка базы";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as {
      id?: string;
      clientName?: string;
      phone?: string;
      totalPrice?: number;
      status?: string;
    };
    const id = String(body.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Не указан id заказа" }, { status: 400 });
    }

    const data: Prisma.OrderUpdateInput = {};
    if (body.clientName !== undefined) {
      data.clientName = String(body.clientName).trim() || "Без имени";
    }
    if (body.phone !== undefined) {
      data.phone = String(body.phone).trim() || "—";
    }
    if (body.totalPrice !== undefined) {
      const totalPrice = Number(body.totalPrice);
      if (!Number.isFinite(totalPrice) || totalPrice < 0) {
        return NextResponse.json({ error: "Некорректная сумма" }, { status: 400 });
      }
      data.totalPrice = totalPrice;
    }
    if (body.status !== undefined) {
      data.status = normalizeOrderStatus(body.status);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data
    });
    return NextResponse.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка базы";
    const status = message.includes("Record to update not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Не указан id" }, { status: 400 });
    }
    const deleted = await prisma.order.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка базы";
    const status = message.includes("Record to delete does not exist") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
