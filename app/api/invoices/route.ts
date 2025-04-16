/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-nocheck
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = {
      userId: user.id,
      OR: [
        { number: { contains: search, mode: "insensitive" } },
        { client: { name: { contains: search, mode: "insensitive" } } },
        { client: { phone: { contains: search, mode: "insensitive" } } },
      ],
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: true,
          business: true,
          items: { include: { product: true } },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      clientId,
      date,
      dueDate,
      items,
      businessId,
      status = "NOT-PAID",
      payment = null,
    } = await request.json();

    // Get the business and increment lastInvoiceNumber
    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        lastInvoiceNumber: {
          increment: 1,
        },
      },
    });

    // Generate invoice number with prefix and padded number
    const invoiceNumber = `${business.invoicePrefix}${business.lastInvoiceNumber
      .toString()
      .padStart(6, "0")}`;

    // Calculate total with custom prices
    let total = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      const price = item.price ?? product.price;
      const subtotal = price * item.quantity;
      const tax = (subtotal * product.taxPercent) / 100;
      total += subtotal + tax;
    }

    // Create invoice with items including custom prices
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        clientId,
        date: new Date(date),
        dueDate: new Date(dueDate),
        status,
        total,
        userId: user.id,
        businessId,
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            productId: item.productId,
            price: item.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        business: true,
        client: true,
      },
    });

    // Create payment if provided
    if (payment) {
      const { amount, method, reference, note } = payment;
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount,
          method,
          reference,
          note,
          userId: user.id,
        },
      });

      // Update invoice status and amount paid
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: amount,
          status: amount >= total ? "PAID" : "PARTIALLY_PAID",
        },
      });
    }

    // Update client's total credit
    await prisma.client.update({
      where: { id: clientId },
      data: {
        totalCredit: {
          increment: total,
        },
      },
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      // Create stock log
      await prisma.stockLog.create({
        data: {
          productId: item.productId,
          quantity: -item.quantity,
          type: "SALE",
          note: `Invoice #${invoiceNumber}`,
          userId: user.id,
        },
      });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
