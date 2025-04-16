/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product || product.userId !== user.id) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Get current product to check stock change
    const currentProduct = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!currentProduct || currentProduct.userId !== user.id) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id, userId: user.id },
      data: {
        name,
        description,
        category,
        buyPrice: parseFloat(buyPrice) || 0,
        price: parseFloat(price),
        unit,
        taxPercent,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        images: images || [],
      },
    });

    // Create stock log if stock has changed
    const newStock = parseInt(stock) || 0;
    if (newStock !== currentProduct.stock) {
      const stockDifference = newStock - currentProduct.stock;
      await prisma.stockLog.create({
        data: {
          productId: id,
          quantity: stockDifference,
          type: "ADJUSTMENT",
          note: "Stock adjusted through product edit",
          userId: user.id,
        },
      });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.product.deleteMany({
      where: { id: id, userId: user.id },
    });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
