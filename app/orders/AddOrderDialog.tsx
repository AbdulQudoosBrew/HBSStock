"use client";

import { CreateOrderInput } from "@/app/types";
import { useCustomersStore } from "@/app/useCustomers";
import { useProductStore } from "@/app/useProductStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type LineItem = {
  productId: string;
  quantity: number;
  price: number;
};

const emptyLine = (): LineItem => ({
  productId: "",
  quantity: 1,
  price: 0,
});

export default function AddOrderDialog() {
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("pending");
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const { toast } = useToast();
  const { allCustomers, loadCustomers, addOrder } = useCustomersStore();
  const { allProducts, loadProducts } = useProductStore();

  useEffect(() => {
    if (open) {
      loadCustomers();
      loadProducts();
    }
  }, [open, loadCustomers, loadProducts]);

  const updateLine = (index: number, patch: Partial<LineItem>) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line))
    );
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = allProducts.find((p) => p.id === productId);
    updateLine(index, {
      productId,
      price: product?.price ?? 0,
    });
  };

  const handleSubmit = async () => {
    if (!customerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer for this order.",
        variant: "destructive",
      });
      return;
    }

    const validLines = lines.filter(
      (line) => line.productId && line.quantity > 0
    );

    if (validLines.length === 0) {
      toast({
        title: "Products required",
        description: "Add at least one product to the order.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateOrderInput = {
        customerId,
        status,
        items: validLines.map(({ productId, quantity, price }) => ({
          productId,
          quantity,
          price,
        })),
      };

      const result = await addOrder(payload);
      if (result.success) {
        toast({
          title: "Order created",
          description: "The order was saved with all selected products.",
        });
        setOpen(false);
        setCustomerId("");
        setStatus("pending");
        setLines([emptyLine()]);
      } else {
        throw new Error("Failed to create order");
      }
    } catch {
      toast({
        title: "Could not create order",
        description: "Please check your selections and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>
            Select a customer and add one or more products to the order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {allCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} — {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Products</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLines((prev) => [...prev, emptyLine()])}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add product
              </Button>
            </div>

            {lines.map((line, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px_auto] gap-2 items-end border rounded-md p-3"
              >
                <div className="grid gap-1">
                  <Label className="text-xs">Product</Label>
                  <Select
                    value={line.productId}
                    onValueChange={(value) => handleProductChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(index, {
                        quantity: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Unit price</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.price}
                    onChange={(e) =>
                      updateLine(index, { price: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={lines.length === 1}
                  onClick={() =>
                    setLines((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
