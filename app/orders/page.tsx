"use client";

import { AnalyticsCard } from "@/components/ui/analytics-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useAuth } from "../authContext";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { useCustomersStore } from "../useCustomers";
import { useProductStore } from "../useProductStore";
import { getOrderTotal } from "../types";
import AddCustomerDialog from "./AddCustomerDialog";
import AddOrderDialog from "./AddOrderDialog";
import { CustomerOrdersView } from "./CustomerOrdersView";
import { buildProductOrderSummaries } from "./orderUtils";
import { OrdersListView } from "./OrdersListView";
import { ProductOrdersView } from "./ProductOrdersView";

export default function OrdersPage() {
  const { allOrders, allCustomers, loadCustomers, loadOrders, isLoading } =
    useCustomersStore();   
  const { allProducts, loadProducts } = useProductStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCustomers();
      loadOrders();
      loadProducts();
    }
  }, [user, loadCustomers, loadOrders, loadProducts]);

  const analyticsData = useMemo(() => {
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0
    );
    const pendingOrders = allOrders.filter(
      (order) => order.status === "pending" || order.status === "processing"
    ).length;
    const completedOrders = allOrders.filter(
      (order) => order.status === "completed"
    ).length;

    return { totalOrders, totalRevenue, pendingOrders, completedOrders };
  }, [allOrders]);

  const productSummaries = useMemo(
    () => buildProductOrderSummaries(allProducts, allOrders),
    [allProducts, allOrders]
  );

  if (!user) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Please log in to view orders.
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary">Orders</h1>
            <p className="text-lg text-muted-foreground">
              Manage customers, orders, and product sales
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AddCustomerDialog />
            <AddOrderDialog />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Total Orders"
            value={analyticsData.totalOrders.toString()}
            icon={Package}
            iconColor="text-blue-600"
            description="All orders placed"
          />
          <AnalyticsCard
            title="Total Revenue"
            value={`£${analyticsData.totalRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={DollarSign}
            iconColor="text-green-600"
            description="Sum of all order totals"
          />
          <AnalyticsCard
            title="Pending / Processing"
            value={analyticsData.pendingOrders.toString()}
            icon={ShoppingCart}
            iconColor="text-orange-600"
            description="Orders not yet completed"
          />
          <AnalyticsCard
            title="Customers"
            value={allCustomers.length.toString()}
            icon={Users}
            iconColor="text-purple-600"
            description="Registered customers"
          />
        </div>

        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customers">Customers & Orders</TabsTrigger>
            <TabsTrigger value="orders">All Orders</TabsTrigger>
            <TabsTrigger value="products">Products & Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">
                Loading customers...
              </p>
            ) : (
              <CustomerOrdersView customers={allCustomers} />
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">
                Loading orders...
              </p>
            ) : (
              <OrdersListView orders={allOrders} />
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <ProductOrdersView summaries={productSummaries} />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
