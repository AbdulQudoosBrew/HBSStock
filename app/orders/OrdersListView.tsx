"use client";

import { getOrderTotal, Order } from "@/app/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatOrderItems } from "./orderUtils";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface OrdersListViewProps {
  orders: Order[];
}

export function OrdersListView({ orders }: OrdersListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  if (orders.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No orders yet. Create an order to get started.
      </p>
    );
  }



  const getFilteredOrders = () => {
    return orders.filter((order) => {
      const term = searchTerm.toLowerCase();

      const searchMatch =
        !searchTerm ||
        order.customer?.name?.toLowerCase().includes(term) ||
        order.customer?.phone?.toLowerCase().includes(term) ||
        order.items.some((item) =>
          item.product?.name?.toLowerCase().includes(term)
        );

      return searchMatch;
    });
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div >
      <Input
        placeholder="Search orders by Order name , Customer name or Number..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-10 pr-10 w-[30%] m-auto "
      />
      <div className="rounded-md border shadow-sm mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.customer?.name ?? "Unknown"}</TableCell>
                <TableCell>{order.customer?.phone ?? "—"}</TableCell>
                <TableCell className="max-w-sm">{formatOrderItems(order)}</TableCell>
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
      </div>
    </div>
  );
}
