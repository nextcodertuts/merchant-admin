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
    // Count total clients for the user
    const totalClients = await prisma.client.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      totalClients,
      isEligible: totalClients >= 200,
    });
  } catch (error) {
    console.error("Error fetching client count:", error);
    return NextResponse.json(
      { error: "Failed to fetch client count" },
      { status: 500 }
    );
  }
}
