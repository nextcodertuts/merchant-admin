/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, quantity, type, note } = await request.json();

    // Get current product stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate new stock level
    const newStock = product.stock + quantity;

    // Create stock log and update product stock in a transaction
    const result = await prisma.$transaction([
      prisma.stockLog.create({
        data: {
          productId,
          quantity,
          type,
          note,
          userId: user.id,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
    ]);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update stock" },
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
    const productId = searchParams.get("productId");

    const stockLogs = await prisma.stockLog.findMany({
      where: {
        userId: user.id,
        ...(productId && { productId }),
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(stockLogs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stock logs" },
      { status: 500 }
    );
  }
}
