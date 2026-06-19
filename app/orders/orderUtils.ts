import { Order, Product } from "@/app/types";

export function formatOrderItems(order: Order): string {
  return (order.items ?? [])
    .map(
      (item) =>
        `${item.product?.name ?? item.productId} x${item.quantity}`
    )
    .join(", ");
}

export interface ProductOrderSummary {
  product: Product;
  orders: Array<{
    orderId: string;
    orderNumber: string;
    customerName: string;
    quantity: number;
    lineTotal: number;
    status: string;
    createdAt: Date | string;
  }>;
}

export function buildProductOrderSummaries(
  products: Product[],
  orders: Order[]
): ProductOrderSummary[] {
  const map = new Map<string, ProductOrderSummary>();

  for (const product of products) {
    map.set(product.id, { product, orders: [] });
  }

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const entry = map.get(item.productId);
      if (!entry) continue;

      entry.orders.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.name ?? "Unknown",
        quantity: item.quantity,
        lineTotal: item.price * item.quantity,
        status: order.status,
        createdAt: order.createdAt,
      });
    }
  }

  return Array.from(map.values());
}
