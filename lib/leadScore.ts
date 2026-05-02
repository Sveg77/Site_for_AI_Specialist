export function leadScore(order: { totalPrice: number }) {
  if (order.totalPrice > 70000) return "VIP";
  if (order.totalPrice > 30000) return "HOT";
  return "COLD";
}
