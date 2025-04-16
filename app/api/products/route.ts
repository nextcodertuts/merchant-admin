/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
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
    const businessId = searchParams.get("businessId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Get all invoices for the user to check which products are used in which business
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        ...(businessId && { businessId }),
      },
      include: {
        items: true,
      },
    });

    // Get unique product IDs from the invoices
    const productIds = [
      ...new Set(
        invoices.flatMap((invoice) =>
          invoice.items.map((item) => item.productId)
        )
      ),
    ];

    const where = {
      userId: user.id,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
      ...(businessId && { id: { in: productIds } }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
      name,
      description,
      category,
      buyPrice,
      price,
      unit,
      taxPercent,
      stock,
      minStock,
      images,
    } = await request.json();
    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price,
        buyPrice,
        unit,
        taxPercent,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        images: images || [],
        userId: user.id,
      },
    });

    // Create initial stock log if stock is greater than 0
    if (parseInt(stock) > 0) {
      await prisma.stockLog.create({
        data: {
          productId: product.id,
          quantity: parseInt(stock),
          type: "INITIAL",
          note: "Initial stock entry",
          userId: user.id,
        },
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
