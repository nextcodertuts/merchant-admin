import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Package2,
  Receipt,
  PiggyBank,
  Wallet,
} from "lucide-react";
import type { DashboardStats } from "@/types";
import MetricCard from "./metric-card";

interface MetricsCardsProps {
  stats: DashboardStats;
}

export default function MetricsCards({ stats }: MetricsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Sales"
        value={`₹${stats.totalSales.toLocaleString()}`}
        icon={<TrendingUp />}
        trend={stats.salesTrend}
        trendLabel="from last period"
      />

      <MetricCard
        title="Gross Profit"
        value={`₹${stats.grossProfit.toLocaleString()}`}
        icon={<PiggyBank />}
        trend={stats.grossProfitTrend}
        trendLabel="from last period"
        additionalInfo={`Margin: ${stats.profitMetrics.grossMarginPercent.toFixed(
          1
        )}%`}
      />

      <MetricCard
        title="Total Expenses"
        value={`₹${stats.totalExpenses.toLocaleString()}`}
        icon={<Receipt />}
        trend={stats.expenseTrend}
        trendLabel="from last period"
        invertTrend={true}
      />

      <MetricCard
        title="Net Profit"
        value={`₹${Math.abs(stats.netProfit).toLocaleString()}`}
        valueLabel={stats.netProfit >= 0 ? "Profit" : "Loss"}
        valueColor={stats.netProfit >= 0 ? "text-green-600" : "text-red-600"}
        icon={<Wallet />}
        trend={stats.netProfitTrend}
        trendLabel="from last period"
        additionalInfo={`Margin: ${stats.profitMetrics.netMarginPercent.toFixed(
          1
        )}%`}
      />

      <MetricCard
        title="Total Credit"
        value={`₹${stats.totalCredit.toLocaleString()}`}
        icon={<CreditCard />}
        trend={stats.creditTrend}
        trendLabel="from last period"
      />

      <MetricCard
        title="Low Stock Products"
        value={stats.totalProducts.toString()}
        icon={<Package2 />}
        description="Products below minimum stock level"
        showTrend={false}
      />

      <MetricCard
        title="Pending Invoices"
        value={stats.pendingInvoices.toString()}
        icon={<DollarSign />}
        description="Awaiting payment or overdue"
        showTrend={false}
      />
    </div>
  );
}
