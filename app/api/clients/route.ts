/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, phone, address } = await request.json();

    // Check if client already exists for this user
    let client = await prisma.client.findFirst({
      where: {
        phone,
        userId: user.id,
      },
    });

    if (client) {
      // Update existing client
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          name,
          email,
          address,
        },
      });
    } else {
      // Create new client
      client = await prisma.client.create({
        data: {
          name,
          email,
          phone,
          address,
          userId: user.id,
        },
      });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error creating/updating client:", error);
    return NextResponse.json(
      { error: "Failed to create/update client" },
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = {
      userId: user.id,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          invoices: {
            include: {
              payments: true,
            },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    // Calculate actual total dues by subtracting payments
    const clientsWithCalculatedDues = clients.map((client) => {
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

      return {
        ...client,
        totalCredit: totalInvoiceAmount - totalPayments,
        invoices: undefined, // Remove invoices from response to keep it clean
      };
    });

    return NextResponse.json({
      clients: clientsWithCalculatedDues,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
