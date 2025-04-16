"use client";

import { useEffect, useState } from "react";
import type { DashboardStats } from "@/types";
import { toast } from "sonner";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import RecentInvoicesCard from "@/components/dashboard/recent-invoices-card";
import RecentExpensesCard from "@/components/dashboard/recent-expenses-card";
import LowStockAlertsCard from "@/components/dashboard/low-stock-alerts-card";

export default function DashboardPage() {
  const [period, setPeriod] = useState("7days");
  const [businessId, setBusinessId] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalCredit: 0,
    totalProducts: 0,
    pendingInvoices: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    recentInvoices: [],
    recentExpenses: [],
    lowStockProducts: [],
    salesTrend: 0,
    creditTrend: 0,
    expenseTrend: 0,
    grossProfitTrend: 0,
    netProfitTrend: 0,
    profitMetrics: {
      totalCost: 0,
      grossMarginPercent: 0,
      netMarginPercent: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const params = new URLSearchParams({
          period,
          ...(businessId && { businessId }),
        });
        const response = await fetch(`/api/dashboard?${params}`);
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [period, businessId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        period={period}
        setPeriod={setPeriod}
        businessId={businessId}
        setBusinessId={setBusinessId}
      />

      <MetricsCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentInvoicesCard invoices={stats.recentInvoices} />
        <RecentExpensesCard expenses={stats.recentExpenses} />
        <LowStockAlertsCard products={stats.lowStockProducts} />
      </div>
    </div>
  );
}
