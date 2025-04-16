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
    const businessId = searchParams.get("businessId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where = {
      userId: user.id,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
      ...(businessId && {
        invoices: {
          some: {
            businessId,
          },
        },
      }),
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          invoices: {
            include: {
              payments: true,
              business: true,
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

      // Group invoices by business
      const businessInvoices = client.invoices.reduce((acc, invoice) => {
        const businessId = invoice.business.id;
        if (!acc[businessId]) {
          acc[businessId] = {
            businessName: invoice.business.name,
            total: 0,
            paid: 0,
            credit: 0,
          };
        }
        acc[businessId].total += invoice.total;
        acc[businessId].paid += invoice.payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        acc[businessId].credit = acc[businessId].total - acc[businessId].paid;
        return acc;
      }, {});

      return {
        ...client,
        totalCredit: totalInvoiceAmount - totalPayments,
        businessInvoices,
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
