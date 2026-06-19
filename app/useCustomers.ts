import { CreateOrderInput, Customer, Order } from "@/app/types";
import axiosInstance from "@/utils/axiosInstance";
import { create } from "zustand";

// Structure of the overall state
interface CustomersState {
  allCustomers: Customer[];
  allOrders: Order[];
  isLoading: boolean;
  openCustomerDialog: boolean;
  setOpenCustomerDialog: (openCustomerDialog: boolean) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  setAllCustomers: (allCustomers: Customer[]) => void;
  loadCustomers: () => Promise<void>;
  loadOrders: () => Promise<void>;
  addCustomer: (customer: Customer) => Promise<{ success: boolean }>;
  updateCustomer: (updatedCustomer: Customer) => Promise<{ success: boolean }>;
  deleteCustomer: (customerId: string) => Promise<{ success: boolean }>;
  addOrder: (order: CreateOrderInput) => Promise<{ success: boolean }>;
  updateOrder: (updatedOrder: Order) => Promise<{ success: boolean }>;
  deleteOrder: (orderId: string) => Promise<{ success: boolean }>;
}

export const useCustomersStore = create<CustomersState>((set) => ({
  allCustomers: [],
  allOrders: [],
  isLoading: false,
  selectedCustomer: null,
  openCustomerDialog: false,

  // Set the open product dialog state
  setOpenCustomerDialog: (openCustomerDialog) => {
    set({ openCustomerDialog });
  },

  // Set the selected product for editing
  setSelectedCustomer: (customer: Customer | null) => {
    set({ selectedCustomer: customer });
  },

  // Set all products
  setAllCustomers: (allCustomers) => {
    set({ allCustomers });
  },

  // Load all products with caching
  loadCustomers: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/customers");
      const customers = response.data || [];

      // Optimize by ensuring we don't set the same data
      set((state) => {
        // Only update if the data is actually different
        if (JSON.stringify(state.allCustomers) !== JSON.stringify(customers)) {
          return { allCustomers: customers };
        }
        return state;
      });

      if (process.env.NODE_ENV === "development") {
        console.log("Updated State with Customers:", customers);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
          console.error("Error loading customers:", error);
      }
      set({ allCustomers: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new product
  addCustomer: async (customer: Customer) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.post("/customers", customer);

      const newCustomer = response.data;
      // Debug log - only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Customer added successfully:", newCustomer);
      }
      set((state) => ({
        allCustomers: [...state.allCustomers, newCustomer],
      }));
      return { success: true };
    } catch (error) {
      console.error("Error adding customer:", error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  // Update an existing product
  updateCustomer: async (updatedCustomer: Customer) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.put("/customers", updatedCustomer); // Send the `id` in the request body

        const newCustomer = response.data;

      set((state) => ({
        allCustomers: state.allCustomers.map((customer) =>
          customer.id === newCustomer.id ? newCustomer : customer
        ),
      }));

      // Debug log - only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Customer updated successfully:", newCustomer);
      }
      return { success: true };
    } catch (error) {
      console.error("Error updating customer:", error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete a product
  deleteCustomer: async (customerId: string) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.delete("/customers", {
        data: { id: customerId }, // Send the ID in the request body
      });

      if (response.status === 204) {
        set((state) => ({
          allCustomers: state.allCustomers.filter(
            (customer) => customer.id !== customerId
          ),
        }));
        return { success: true };
      } else {
        throw new Error("Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

    // Load all orders
  loadOrders: async () => {
    try {
      const response = await axiosInstance.get("/orders");
      set({ allOrders: response.data });
      // Debug log - only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Orders loaded successfully:", response.data);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  },

  // Add a new order
  addOrder: async (order: CreateOrderInput) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.post("/orders", order);

      const newOrder = response.data;
      if (process.env.NODE_ENV === "development") {
        console.log("Order added successfully:", newOrder);
      }
      set((state) => ({
        allOrders: [newOrder, ...state.allOrders],
        allCustomers: state.allCustomers.map((customer) =>
          customer.id === newOrder.customerId
            ? {
                ...customer,
                orders: [newOrder, ...(customer.orders ?? [])],
              }
            : customer
        ),
      }));
      return { success: true };
    } catch (error) {
      console.error("Error adding order:", error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  // Update an existing order
  updateOrder: async (updatedOrder: Order) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.put("/orders", updatedOrder);

      const newOrder = response.data;
      set((state) => ({
        allOrders: state.allOrders.map((order) =>
          order.id === newOrder.id ? newOrder : order
        ),
      }));

      if (process.env.NODE_ENV === "development") {
        console.log("Order updated successfully:", newOrder);
      }
      return { success: true };
    } catch (error) {
      console.error("Error updating order:", error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete an order
  deleteOrder: async (orderId: string) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.delete("/orders", {
        data: { id: orderId }, // Send the ID in the request body
      });

      if (response.status === 204) {
        set((state) => ({
          allOrders: state.allOrders.filter(
            (order) => order.id !== orderId
          ),
        }));
        return { success: true };
      } else {
        throw new Error("Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },
}));