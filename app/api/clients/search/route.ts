// app/api/clients/search/route.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findFirst({
      where: {
        phone,
        userId: user.id,
      },
      include: {
        invoices: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (client) {
      // Calculate total dues
      const totalDues = client.invoices.reduce((sum, invoice) => {
        const invoiceTotal = invoice.total;
        const paymentTotal = invoice.payments.reduce(
          (pSum, payment) => pSum + payment.amount,
          0
        );
        return sum + (invoiceTotal - paymentTotal);
      }, 0);

      return NextResponse.json({
        ...client,
        totalCredit: totalDues,
        invoices: undefined,
      });
    }

    return NextResponse.json(null);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search client" },
      { status: 500 }
    );
  }
}
