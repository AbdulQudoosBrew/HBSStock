//import { ReactNode } from "react";

// Define the Product interface
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  status?: string;
  createdAt: Date;
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

// Define the Customer interface
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Order interface
export interface Order {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
