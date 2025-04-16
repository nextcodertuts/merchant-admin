import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Find all clients with the given phone number across all users
    const clients = await prisma.client.findMany({
      where: {
        phone: {
          contains: phone,
          mode: "insensitive",
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        invoices: {
          include: {
            payments: true,
            business: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Calculate total credit and other metrics for each client
    const clientsWithMetrics = clients.map((client) => {
      const totalInvoiceAmount = client.invoices.reduce(
        (sum, invoice) => sum + invoice.total,
        0
      );
      const totalPayments = client.invoices.reduce(
        (sum, invoice) =>
          sum +
          invoice.payments.reduce((pSum, payment) => pSum + payment.amount, 0),
        0
      );
      const totalCredit = totalInvoiceAmount - totalPayments;

      // Group invoices by business
      const businessCredits = client.invoices.reduce((acc, invoice) => {
        const businessName = invoice.business.name;
        if (!acc[businessName]) {
          acc[businessName] = {
            total: 0,
            paid: 0,
            credit: 0,
          };
        }
        acc[businessName].total += invoice.total;
        acc[businessName].paid += invoice.payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        acc[businessName].credit =
          acc[businessName].total - acc[businessName].paid;
        return acc;
      }, {} as Record<string, { total: number; paid: number; credit: number }>);

      return {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        businessOwner: client.user.name || client.user.email,
        totalCredit,
        businessCredits: Object.entries(businessCredits).map(
          ([business, metrics]) => ({
            business,
            ...metrics,
          })
        ),
        lastInvoiceDate: client.invoices.length
          ? new Date(
              Math.max(
                ...client.invoices.map((inv) => new Date(inv.date).getTime())
              )
            )
          : null,
      };
    });

    return NextResponse.json(clientsWithMetrics);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search clients" },
      { status: 500 }
    );
  }
}
