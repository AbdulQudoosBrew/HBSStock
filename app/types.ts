// Define the Product interface
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  status?: string;
  createdAt: Date | string;
  userId: string;
  categoryId: string;
  supplierId: string;
  category?: string;
  supplier?: string;
}

// Define the Supplier interface
export interface Supplier {
  id: string;
  name: string;
  userId: string;
}

// Define the Category interface
export interface Category {
  id: string;
  name: string;
  userId: string;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Pick<Product, "id" | "name" | "sku" | "price">;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  customer?: Pick<Customer, "id" | "name" | "phone" | "address">;
  items: OrderItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  orders?: Order[];
}

export interface CreateOrderInput {
  customerId: string;
  status?: string;
  items: { productId: string; quantity: number; price: number }[];
}

export function getOrderTotal(order: Order): number {
  return (order.items ?? []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}
