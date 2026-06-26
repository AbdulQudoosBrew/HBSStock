import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const productId = typeof id === "string" ? id : null;

  if (!productId) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  switch (req.method) {
    case "GET":
      try {
        const history = await prisma.productStockHistory.findMany({
          where: { productId },
          orderBy: { date: "asc" },
        });

        const formatted = history.map((item: { quantity: number; id: any; date: { toISOString: () => any; }; }, index: number) => {
          const prev = history[index - 1]?.quantity;

          let change = "-";

          if (prev !== undefined) {
            const diff = item.quantity - prev;
            change = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "Same";
          }

          return {
            id: item.id,
            date: item.date.toISOString(),
            quantity: item.quantity,
            change,
          };
        });

        return res.status(200).json({ history: formatted });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch history" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}