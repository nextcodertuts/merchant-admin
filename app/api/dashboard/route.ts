import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { subDays, startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "today";

    // Calculate date range based on period
    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case "today":
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());
        break;
      case "7days":
        startDate = startOfDay(subDays(new Date(), 7));
        endDate = endOfDay(new Date());
        break;
      case "30days":
        startDate = startOfDay(subDays(new Date(), 30));
        endDate = endOfDay(new Date());
        break;
      case "all":
        startDate = new Date(0); // Beginning of time
        endDate = new Date();
        break;
    }

    // Get invoices for the period with items
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        userId: user.id,
        stock: {
          lte: prisma.product.fields.minStock,
        },
      },
    });

    // Calculate previous period for trend comparison
    const periodDays = period === "7days" ? 7 : period === "30days" ? 30 : 1;
    const previousStartDate = startOfDay(subDays(startDate, periodDays));
    const previousEndDate = endOfDay(subDays(endDate, periodDays));

    // Get previous period data for comparison
    const previousPeriodInvoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        date: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    // Get expenses for the period
    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Get previous period expenses for trend comparison
    const previousPeriodExpenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        date: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
    });

    // Calculate total expenses
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const previousTotalExpenses = previousPeriodExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Calculate expense trend
    const expenseTrend =
      previousTotalExpenses === 0
        ? 100
        : ((totalExpenses - previousTotalExpenses) / previousTotalExpenses) *
          100;

    // Calculate sales and profit metrics
    const calculateInvoiceMetrics = (
      invoice: {
        items: ({
          product: {
            id: string;
            category: string;
            description: string | null;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            price: number;
            buyPrice: number;
            unit: string;
            taxPercent: number;
            stock: number;
            minStock: number;
            images: string[];
          };
        } & {
          id: string;
          quantity: number;
          price: number | null;
          productId: string;
          invoiceId: string;
        })[];
        payments: {
          id: string;
          date: Date;
          amount: number;
          reference: string | null;
          userId: string;
          createdAt: Date;
          invoiceId: string;
          method: string;
          note: string | null;
        }[];
      } & {
        number: string;
        id: string;
        date: Date;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        dueDate: Date;
        status: string;
        total: number;
        amountPaid: number;
        businessId: string;
      }
    ) => {
      let totalSales = 0;
      let totalCost = 0;

      invoice.items.forEach((item) => {
        const sellPrice = item.price || item.product.price;
        const costPrice = item.product.buyPrice;

        totalSales += sellPrice * item.quantity;
        totalCost += costPrice * item.quantity;
      });

      return {
        sales: totalSales,
        cost: totalCost,
        grossProfit: totalSales - totalCost,
      };
    };

    // Current period metrics
    const currentMetrics = invoices.reduce(
      (acc, invoice) => {
        const metrics = calculateInvoiceMetrics(invoice);
        return {
          totalSales: acc.totalSales + metrics.sales,
          totalCost: acc.totalCost + metrics.cost,
          grossProfit: acc.grossProfit + metrics.grossProfit,
        };
      },
      { totalSales: 0, totalCost: 0, grossProfit: 0 }
    );

    // Previous period metrics
    const previousMetrics = previousPeriodInvoices.reduce(
      (acc, invoice) => {
        const metrics = calculateInvoiceMetrics(invoice);
        return {
          totalSales: acc.totalSales + metrics.sales,
          totalCost: acc.totalCost + metrics.cost,
          grossProfit: acc.grossProfit + metrics.grossProfit,
        };
      },
      { totalSales: 0, totalCost: 0, grossProfit: 0 }
    );

    // Calculate total credit
    const totalCredit = invoices.reduce(
      (sum, invoice) => sum + (invoice.total - invoice.amountPaid),
      0
    );
    const previousTotalCredit = previousPeriodInvoices.reduce(
      (sum, invoice) => sum + (invoice.total - invoice.amountPaid),
      0
    );

    // Calculate trends
    const salesTrend =
      previousMetrics.totalSales === 0
        ? 100
        : ((currentMetrics.totalSales - previousMetrics.totalSales) /
            previousMetrics.totalSales) *
          100;

    const creditTrend =
      previousTotalCredit === 0
        ? 100
        : ((totalCredit - previousTotalCredit) / previousTotalCredit) * 100;

    // Calculate net profit (gross profit - expenses)
    const netProfit = currentMetrics.grossProfit - totalExpenses;
    const previousNetProfit =
      previousMetrics.grossProfit - previousTotalExpenses;

    // Calculate profit trends
    const grossProfitTrend =
      previousMetrics.grossProfit === 0
        ? 100
        : ((currentMetrics.grossProfit - previousMetrics.grossProfit) /
            Math.abs(previousMetrics.grossProfit)) *
          100;

    const netProfitTrend =
      previousNetProfit === 0
        ? 100
        : ((netProfit - previousNetProfit) / Math.abs(previousNetProfit)) * 100;

    return NextResponse.json({
      totalSales: currentMetrics.totalSales,
      totalCredit,
      totalProducts: lowStockProducts.length,
      pendingInvoices: invoices.filter(
        (invoice) =>
          invoice.status === "PENDING" || invoice.status === "OVERDUE"
      ).length,
      totalExpenses,
      grossProfit: currentMetrics.grossProfit,
      netProfit,
      recentInvoices: invoices,
      recentExpenses: expenses,
      lowStockProducts,
      salesTrend,
      creditTrend,
      expenseTrend,
      grossProfitTrend,
      netProfitTrend,
      profitMetrics: {
        totalCost: currentMetrics.totalCost,
        grossMarginPercent:
          (currentMetrics.grossProfit / currentMetrics.totalSales) * 100,
        netMarginPercent: (netProfit / currentMetrics.totalSales) * 100,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
