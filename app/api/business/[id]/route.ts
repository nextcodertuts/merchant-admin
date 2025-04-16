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
    const business = await prisma.business.findUnique({
      where: { id: id },
    });

    if (!business || business.userId !== user.id) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch business" },
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
    const business = await prisma.business.update({
      where: { id: id, userId: user.id },
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
      },
    });
    return NextResponse.json(business);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update business" },
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
    await prisma.business.deleteMany({
      where: { id: id, userId: user.id },
    });
    return NextResponse.json({ message: "Business deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete business" },
      { status: 500 }
    );
  }
}
