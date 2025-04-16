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
    const businesses = await prisma.business.findMany({
      where: { userId: user.id },
    });
    return NextResponse.json(businesses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
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
    // Get user's subscription
    const userWithSubscription = await prisma.user.findUnique({
      where: { id: user.id },
      include: { subscription: true },
    });

    if (!userWithSubscription?.subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    // Count user's existing businesses
    const businessCount = await prisma.business.count({
      where: { userId: user.id },
    });

    // Check if user has reached their business limit
    if (businessCount >= userWithSubscription.subscription.maxBusinesses) {
      return NextResponse.json(
        {
          error: "Business limit reached for your subscription plan",
          currentPlan: userWithSubscription.subscription.name,
          maxBusinesses: userWithSubscription.subscription.maxBusinesses,
        },
        { status: 403 }
      );
    }

    const {
      name,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      website,
      logoUrl,
      bankName,
      ifscCode,
      accountNo,
      upiId,
    } = await request.json();

    const business = await prisma.business.create({
      data: {
        name,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        website,
        logoUrl,
        bankName,
        ifscCode,
        accountNo,
        upiId,
        userId: user.id,
      },
    });
    return NextResponse.json(business);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}
