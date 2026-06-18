"use client";

import { AnalyticsCard } from "@/components/ui/analytics-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard } from "@/components/ui/chart-card";
import { QRCodeComponent } from "@/components/ui/qr-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Download,
  Eye,
  Package,
  PieChart as PieChartIcon,
  QrCode,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../authContext";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { useCustomersStore } from "../useCustomers";
import { Customer, Order, Product } from "../types";
import { CustomersTable } from "../Customers/CustomersTable";
import { ProductTable } from "../Products/ProductTable";
import { columns } from "../Customers/columns";
import { ColumnDef } from "@tanstack/react-table";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function BusinessInsightsPage() {
  const { allOrders, allCustomers } = useCustomersStore();
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate analytics data with corrected calculations
  const analyticsData = useMemo(() => {
    if (!allOrders || allOrders.length === 0) {
      return {
        totalProducts: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        averagePrice: 0,
        totalQuantity: 0,
        categoryDistribution: [],
        statusDistribution: [],
        priceRangeDistribution: [],
        monthlyTrend: [],
        topProducts: [],
        lowStockProducts: [],
        stockUtilization: 0,
        valueDensity: 0,
        stockCoverage: 0,
      };
    }

    const totalOrders = allOrders.length;

    // CORRECTED: Total value calculation - sum of (price * quantity) for each product
    const totalValue = allOrders.reduce((sum, order) => {
        return sum + order.price * Number(order.quantity);
    }, 0);

    // CORRECTED: Low stock items - products with quantity > 0 AND quantity <= 20 (matching product table logic)
    const lowStockItems = allOrders.filter(
      (order) =>
        Number(order.quantity) > 0 && Number(order.quantity) <= 20
    ).length;

    // CORRECTED: Out of stock items - products with quantity = 0
    const outOfStockItems = allOrders.filter(
      (order) => Number(order.quantity) === 0
    ).length;

    // CORRECTED: Total quantity - sum of all quantities
    const totalQuantity = allOrders.reduce((sum, order) => {
      return sum + Number(order.quantity);
    }, 0);

    // CORRECTED: Average price calculation - total value divided by total quantity
    const averagePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

    // CORRECTED: Stock utilization - percentage of products that are not out of stock
    const stockUtilization =
      totalOrders > 0
        ? ((totalOrders - outOfStockItems) / totalOrders) * 100
        : 0;

    // CORRECTED: Value density - total value divided by total products
    const valueDensity = totalOrders > 0 ? totalValue / totalOrders : 0;

    // CORRECTED: Stock coverage - average quantity per product
    const stockCoverage = totalOrders > 0 ? totalQuantity / totalOrders : 0;

    // Category distribution based on quantity (not just count)
    const customerMap = new Map<
      string,
      { count: number; quantity: number; value: number }
    >();
      allOrders.forEach((order) => {
      const customerId = order.customerId || "Unknown";
      const current = customerMap.get(customerId) || {
        count: 0,
        quantity: 0,
        value: 0,
      };
      customerMap.set(customerId, {
          count: current.count + 1,
        quantity: current.quantity + Number(order.quantity),
        value: current.value + order.price * Number(order.quantity),
      });
    });


    // Status distribution
    const statusMap = new Map<string, number>();
    allOrders.forEach((order) => {
      const status = order.status || "Unknown";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    const statusDistribution = Array.from(statusMap.entries()).map(
      ([name, value]) => ({ name, value })
    );

    // Price range distribution
    const priceRanges = [
      { name: "$0-$100", min: 0, max: 100 },
      { name: "$100-$500", min: 100, max: 500 },
      { name: "$500-$1000", min: 500, max: 1000 },
      { name: "$1000-$2000", min: 1000, max: 2000 },
      { name: "$2000+", min: 2000, max: Infinity },
    ];

    const priceRangeDistribution = priceRanges.map((range, index) => ({
      name: range.name,
      value: allOrders.filter((order) => {
        if (range.name === "$2000+") {
          // For $2000+ range, include products > $2000 (not including $2000)
          return order.price > 2000;
        } else if (range.name === "$1000-$2000") {
          // For $1000-$2000 range, include products >= $1000 and <= $2000
          return order.price >= range.min && order.price <= range.max;
        } else {
          // For other ranges, include products >= min and < max (exclusive upper bound)
          return order.price >= range.min && order.price < range.max;
        }
      }).length,
    }));

    // CORRECTED: Monthly trend based on actual product creation dates
    const monthlyTrend: Array<{
      month: string;
      products: number;
      monthlyAdded: number;
    }> = [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Group products by creation month using UTC to avoid timezone issues
    const productsByMonth = new Map<string, number>();
    allOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      // Use UTC methods to ensure consistent month extraction
      const monthKey = `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
      ).padStart(2, "0")}`;
      productsByMonth.set(monthKey, (productsByMonth.get(monthKey) || 0) + 1);
    });

    // Create trend data for the whole year
    // Use the year from the first product's creation date to ensure correct year mapping
    const dataYear =
          allOrders.length > 0
        ? new Date(allOrders[0].createdAt).getUTCFullYear()
        : new Date().getUTCFullYear();
    let cumulativeProducts = 0;

    months.forEach((month, index) => {
      const monthKey = `${dataYear}-${String(index + 1).padStart(2, "0")}`;
      const productsThisMonth = productsByMonth.get(monthKey) || 0;
      cumulativeProducts += productsThisMonth;

      monthlyTrend.push({
        month,
        products: cumulativeProducts,
        monthlyAdded: productsThisMonth,
      });
    });

    // Top products by value
    const topOrders = allOrders
      .sort(
        (a, b) => b.price * Number(b.quantity) - a.price * Number(a.quantity)
      )
      .slice(0, 5)
      .map((order) => ({
        name: order.productId,
        value: order.price * Number(order.quantity),
        quantity: Number(order.quantity),
      }));

    // Low stock products (matching product table logic: quantity > 0 AND quantity <= 20)
    const lowStockOrders = allOrders
      .filter(
        (order) =>
          Number(order.quantity) > 0 && Number(order.quantity) <= 20
      )
      .sort((a, b) => Number(a.quantity) - Number(b.quantity))
      .slice(0, 5);

    return {
      totalOrders,
      totalValue,
      lowStockItems,
      outOfStockItems,
      averagePrice,
      totalQuantity,
      stockUtilization,
      valueDensity,
      stockCoverage,
      statusDistribution,
      priceRangeDistribution,
      monthlyTrend,
      topOrders,
          lowStockOrders,
    };
  }, [allOrders]);

  const handleExportAnalytics = () => {
    toast({
      title: "Analytics Export",
      description: "Analytics export feature coming soon!",
    });
  };

  if (!user) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Please log in to view business insights.
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6 space-y-6">        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary">
              Orders
            </h1>
            <p className="text-lg text-muted-foreground">
              View and manage your orders
            </p>
          </div>
         
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Total Orders"
            value={analyticsData.totalOrders?.toString() || "0"}
            icon={Package}
            iconColor="text-blue-600"
            description="Total orders placed"
          />
          <AnalyticsCard
            title="Total Revenue"
            value={`$${analyticsData.totalValue?.toLocaleString() || "0"}`}
            icon={DollarSign}
            iconColor="text-green-600"
            description="Total revenue generated from orders"
          />
          <AnalyticsCard
            title="Pending Orders"
            value={analyticsData.lowStockItems?.toString() || "0"}
            icon={AlertTriangle}
            iconColor="text-orange-600"
            description="Orders that are pending payment or processing"
          />
          <AnalyticsCard
            title="Completed Orders"
            value={analyticsData.outOfStockItems?.toString() || "0"}
            icon={ShoppingCart}
            iconColor="text-red-600"
            description="Orders that have been completed and shipped"
          />
        </div>

        {/* Charts and Insights */}
        <Tabs defaultValue="Customers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Customers">Customers</TabsTrigger>
            <TabsTrigger value="Orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="Customers" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
             <CustomersTable data={allCustomers?.map((customer) => ({
              id: customer.name,
              name: customer.name,
              phone: customer.name,
              address: customer.name,
              createdAt: new Date(),
              updatedAt: new Date(),
            })) || [] as Customer[]} columns={columns as ColumnDef<Customer, unknown>[]} isLoading={false} searchTerm="" pagination={{ pageIndex: 0, pageSize: 10 }} setPagination={() => {}} />
            </div>
          </TabsContent>

          <TabsContent value="Orders" className="space-y-4">
          {/* <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
             <OrdersTable data={allOrders?.map((order) => ({
              id: order.id,
              customerId: order.customerId,
              productId: order.productId,
              quantity: order.quantity,
              price: order.price,
              status: order.status,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
            })) || [] as Order[]} columns={columns as ColumnDef<Order, unknown>[]} isLoading={false} searchTerm="" pagination={{ pageIndex: 0, pageSize: 10 }} setPagination={() => {}} />
            </div> */}
          </TabsContent>

        </Tabs>

                      
      </div>
    </AuthenticatedLayout>
  );
}

