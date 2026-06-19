import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSessionServer } from "@/utils/auth";

const prisma = new PrismaClient();

const orderInclude = {
  items: {
    include: {
      product: {
        select: { id: true, name: true, sku: true, price: true },
      },
    },
  },
};

function serializeCustomer(customer: {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  orders?: Array<{
    id: string;
    orderNumber: string;
    customerId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      orderId: string;
      productId: string;
      quantity: number;
      price: number;
      product: { id: string; name: string; sku: string; price: number };
    }>;
  }>;
}) {
  return {
    ...customer,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    orders: customer.orders?.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        ...item,
        product: item.product,
      })),
    })),
  };
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
        const customers = await prisma.customer.findMany({
          where: { userId },
          include: {
            orders: {
              include: orderInclude,
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        res.status(200).json(customers.map(serializeCustomer));
      } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ error: "Failed to fetch customers" });
      }
      break;

    case "POST":
      try {
        const { name, phone, address } = req.body;
        const now = new Date();
        const customer = await prisma.customer.create({
          data: {
            name,
            phone: String(phone),
            address,
            userId,
            createdAt: now,
            updatedAt: now,
          },
          include: { orders: { include: orderInclude } },
        });
        res.status(201).json(serializeCustomer(customer));
      } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ error: "Failed to create customer" });
      }
      break;

    case "PUT":
      try {
        const { id, name, phone, address } = req.body;
        const existing = await prisma.customer.findFirst({
          where: { id, userId },
        });
        if (!existing) {
          return res.status(404).json({ error: "Customer not found" });
        }

        const customer = await prisma.customer.update({
          where: { id },
          data: {
            name,
            phone: phone !== undefined ? String(phone) : undefined,
            address,
            updatedAt: new Date(),
          },
          include: {
            orders: {
              include: orderInclude,
              orderBy: { createdAt: "desc" },
            },
          },
        });
        res.status(200).json(serializeCustomer(customer));
      } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ error: "Failed to update customer" });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.body;
        const existing = await prisma.customer.findFirst({
          where: { id, userId },
        });
        if (!existing) {
          return res.status(404).json({ error: "Customer not found" });
        }

        const orderIds = (
          await prisma.order.findMany({
            where: { customerId: id, userId },
            select: { id: true },
          })
        ).map((o) => o.id);

        if (orderIds.length > 0) {
          await prisma.orderItem.deleteMany({
            where: { orderId: { in: orderIds } },
          });
          await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
        }

        await prisma.customer.delete({ where: { id } });
        res.status(204).end();
      } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ error: "Failed to delete customer" });
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
