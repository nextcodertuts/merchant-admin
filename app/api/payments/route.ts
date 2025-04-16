/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { z } from "zod";

// Schema for payment validation
const paymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().positive(),
  method: z.enum(["CASH", "BANK_TRANSFER", "UPI", "OTHER"]),
  reference: z.string().optional(),
  note: z.string().optional(),
  applyAsFullPayment: z.boolean().optional(), // New field for discount handling
});

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    // Get current invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: validatedData.invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate new payment totals
    const newAmountPaid = invoice.amountPaid + validatedData.amount;
    const newBalance = invoice.total - newAmountPaid;

    // Determine new status
    let newStatus = invoice.status;
    if (validatedData.applyAsFullPayment) {
      // If discount is applied, mark as PAID regardless of amount
      newStatus = "PAID";
    } else if (newBalance <= 0) {
      newStatus = "PAID";
    } else if (newAmountPaid > 0) {
      newStatus = "PARTIALLY_PAID";
    }

    // Create payment and update invoice in a transaction
    const result = await prisma.$transaction([
      prisma.payment.create({
        data: {
          invoiceId: validatedData.invoiceId,
          amount: validatedData.amount,
          method: validatedData.method,
          reference: validatedData.reference,
          note: validatedData.note,
          userId: user.id,
        },
      }),
      prisma.invoice.update({
        where: { id: validatedData.invoiceId },
        data: {
          amountPaid: newAmountPaid,
          status: newStatus,
        },
        include: {
          items: { include: { product: true } },
          business: true,
          client: true,
          payments: true,
        },
      }),
    ]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payment data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");

    const payments = await prisma.payment.findMany({
      where: {
        userId: user.id,
        ...(invoiceId && { invoiceId }),
      },
      include: {
        invoice: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
