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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";


import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {

} from "@/components/ui/popover";


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
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const { toast } = useToast();
  const { allCustomers, loadCustomers, addOrder } = useCustomersStore();
  const { allProducts, loadProducts } = useProductStore();

  useEffect(() => {
    if (open) {
      loadCustomers();
      loadProducts();
    }
  }, [open, loadCustomers, loadProducts]);

  const filteredCustomers = allCustomers.filter((customer) => {
    const search = customerSearch.toLowerCase();

    return (
      customer.name.toLowerCase().includes(search) ||
      customer.phone.toLowerCase().includes(search)
    );
  });
  const filteredProducts = allProducts.filter((product) => {
    const search = productSearch.toLowerCase();

    return (

      product.name.toLowerCase().includes(search) ||
      product.sku?.toLowerCase().includes(search)
    );
  });

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
      <DialogContent
        className="
    w-[95vw]
    max-w-2xl
    max-h-[90vh]
    overflow-y-auto
    p-4
    sm:p-6
    rounded-lg
  "
      >
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>
            Select a customer and add one or more products to the order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label>Customer</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  {
                    allCustomers.find(
                      (customer) => customer.id === customerId
                    )?.name || "Select customer"
                  }
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="
    w-[90vw]
    h-[50vh]
    sm:w-[300px]
    p-0 overflow-auto
  "
              >
                <Command>
                  <CommandInput
                    placeholder="Search customer name or phone..."
                    value={customerSearch}
                    onValueChange={setCustomerSearch}
                  />

                  <CommandEmpty>
                    No customer found.
                  </CommandEmpty>

                  <CommandGroup className=" overflow-auto">
                    {filteredCustomers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        onSelect={() => {
                          setCustomerId(customer.id);
                          setCustomerSearch("");
                        }}
                      >
                        {customer.name} — {customer.phone}
                      </CommandItem>
                    ))}
                  </CommandGroup>

                </Command>
              </PopoverContent>
            </Popover>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {
                          allProducts.find(
                            (product) => product.id === line.productId
                          )
                            ? `${allProducts.find(
                              (product) => product.id === line.productId
                            )?.name}`
                            : "Select product"
                        }
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className=" w-[90vw] h-[90vh] sm:w-[350px] sm:h-[50vh] p-0 overflow-auto " >
                      <Command>
                        <CommandInput
                          placeholder="Search product name or SKU..."
                          value={productSearch}
                          onValueChange={setProductSearch}
                        />

                        <CommandEmpty>
                          No product found.
                        </CommandEmpty>

                        <CommandList className="max-h-[300px] overflow-y-auto">
                          <CommandGroup className="">
                            {filteredProducts.map((product) => (
                              product.quantity > 0 &&
                              <CommandItem
                                key={product.id}
                                onSelect={() => {
                                  handleProductChange(
                                    index,
                                    product.id
                                  );

                                  setProductSearch("");
                                }}
                              >

                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {product.name}
                                  </span>

                                  <span className="text-sm text-muted-foreground">
                                    SKU: {product.sku}
                                  </span>

                                  <span className="text-sm text-green-600">
                                    Stock: {product.quantity}
                                  </span>
                                </div>

                              </CommandItem>

                            ))}

                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    min={1}
                    max={e.target.value}
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
