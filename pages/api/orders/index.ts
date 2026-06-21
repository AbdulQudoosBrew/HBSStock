import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSessionServer } from "@/utils/auth";

const prisma = new PrismaClient();

const orderInclude = {
  customer: {
    select: { id: true, name: true, phone: true, address: true },
  },
  items: {
    include: {
      product: {
        select: { id: true, name: true, sku: true, price: true },
      },
    },
  },
};

function serializeOrder(order: {
  id: string;
  orderNumber: string;
  customerId: string;
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  customer: { id: string; name: string; phone: string; address: string };
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    product: { id: string; name: string; sku: string; price: number };
  }>;
}) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: order.customer,
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      product: item.product,
    })),
  };
}

function generateOrderNumber() {
  return `ORD-${Date.now()}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSessionServer(req, res); 
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { method } = req;
  const userId = session.id;

  switch (method) {
    case "GET":
      try {
        const orders = await prisma.order.findMany({
          where: { userId },
          include: orderInclude,
          orderBy: { createdAt: "desc" },
        });
        res.status(200).json(orders.map(serializeOrder));
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
      }
      break;

    case "POST":
      try {
        const { customerId, status = "pending", items } = req.body;

        if (!customerId || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({
            error: "customerId and at least one order item are required",
          });
        }

        const customer = await prisma.customer.findFirst({
          where: { id: customerId, userId },
        });
        if (!customer) {
          return res.status(404).json({ error: "Customer not found" });
        }

        for (const item of items) {
          const product = await prisma.product.findFirst({
            where: { id: item.productId, userId },
          });
          if (!product) {
            return res
              .status(400)
              .json({ error: `Product not found: ${item.productId}` });
          }
        }

        const now = new Date();
        const order = await prisma.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            customerId,
            userId,
            status,
            createdAt: now,
            updatedAt: now,
            items: {
              create: items.map(
                (item: { productId: string; quantity: number; price: number }) => ({
                  productId: item.productId,
                  quantity: Number(item.quantity),
                  price: Number(item.price),
                })
              ),
            },
          },
          include: orderInclude,
        });

        res.status(201).json(serializeOrder(order));
      } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
      }
      break;

    case "PUT":
      try {
        const { id, status, items } = req.body;
        const existing = await prisma.order.findFirst({
          where: { id, userId },
        });
        if (!existing) {
          return res.status(404).json({ error: "Order not found" });
        }

        if (items && Array.isArray(items)) {
          await prisma.orderItem.deleteMany({ where: { orderId: id } });
          await prisma.orderItem.createMany({
            data: items.map(
              (item: { productId: string; quantity: number; price: number }) => ({
                orderId: id,
                productId: item.productId,
                quantity: Number(item.quantity),
                price: Number(item.price),
              })
            ),
          });
        }

        const order = await prisma.order.update({
          where: { id },
          data: {
            status: status ?? existing.status,
            updatedAt: new Date(),
          },
          include: orderInclude,
        });

        res.status(200).json(serializeOrder(order));
      } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Failed to update order" });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.body;
        const existing = await prisma.order.findFirst({
          where: { id, userId },
        });
        if (!existing) {
          return res.status(404).json({ error: "Order not found" });
        }

        await prisma.orderItem.deleteMany({ where: { orderId: id } });
        await prisma.order.delete({ where: { id } });
        res.status(204).end();
      } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ error: "Failed to delete order" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
