"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductOrderSummary } from "./orderUtils";

interface ProductOrdersViewProps {
  summaries: ProductOrderSummary[];
}

export function ProductOrdersView({ summaries }: ProductOrdersViewProps) {
  const withOrders = summaries.filter((entry) => entry.orders.length > 0);
  const withoutOrders = summaries.filter((entry) => entry.orders.length === 0);

  if (summaries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No products found. Add products from the dashboard first.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {withOrders.map(({ product, orders }) => (
        <Card key={product.id}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  SKU: {product.sku} · ${product.price.toFixed(2)}
                </p>
              </div>
              <Badge variant="secondary">
                {orders.length} order{orders.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((entry) => (
                  <TableRow key={`${product.id}-${entry.orderId}`}>
                    <TableCell>{entry.orderNumber}</TableCell>
                    <TableCell>{entry.customerName}</TableCell>
                    <TableCell>
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{entry.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${entry.lineTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      
    </div>
  );
}
