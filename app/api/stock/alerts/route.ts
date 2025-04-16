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
    const lowStockProducts = await prisma.product.findMany({
      where: {
        userId: user.id,
        stock: {
          lte: prisma.product.fields.minStock,
        },
      },
    });

    return NextResponse.json(lowStockProducts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stock alerts" },
      { status: 500 }
    );
  }
}
