"use client";

import { Customer, getOrderTotal, Order } from "@/app/types";
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
import { formatOrderItems } from "./orderUtils";

interface CustomerOrdersViewProps {
  customers: Customer[];
}

export function CustomerOrdersView({ customers }: CustomerOrdersViewProps) {
  if (customers.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No customers yet. Add customers to start creating orders.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <Card key={customer.id}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{customer.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {customer.phone} · {customer.address}
                </p>
              </div>
              <Badge variant="secondary">
                {(customer.orders ?? []).length} order
                {(customer.orders ?? []).length === 1 ? "" : "s"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {(customer.orders ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders for this customer.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(customer.orders ?? []).map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {formatOrderItems(order)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                      £{getOrderTotal(order).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
