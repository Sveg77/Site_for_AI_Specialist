/** Допустимые статусы заказа в CRM */
export const ORDER_STATUS_VALUES = [
  "new",
  "processing",
  "ready",
  "paid",
  "cancelled"
] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_VALUES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  new: "Новый",
  processing: "В работе",
  ready: "Готов к выдаче",
  paid: "Оплачен",
  cancelled: "Отменён"
};

export function isOrderStatus(s: string): s is OrderStatusValue {
  return (ORDER_STATUS_VALUES as readonly string[]).includes(s);
}

export function normalizeOrderStatus(s: string | undefined | null): OrderStatusValue {
  const t = String(s ?? "").trim();
  if (isOrderStatus(t)) return t;
  return "new";
}
