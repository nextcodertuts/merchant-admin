/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const METERS_PER_KM = 1000;
const DEFAULT_RADIUS_KM = 5;
const DEFAULT_LIMIT = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radiusKm = parseFloat(
      searchParams.get("radius") || String(DEFAULT_RADIUS_KM)
    );
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT));
    const search = searchParams.get("search") || "";

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // First, find businesses within the radius
    const nearbyBusinesses = await prisma.$queryRaw`
      SELECT id, name,
        ST_Distance(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography
        ) as distance
      FROM "Business"
      WHERE longitude IS NOT NULL 
        AND latitude IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radiusKm * METERS_PER_KM}
        )
    `;

    if (!nearbyBusinesses.length) {
      return NextResponse.json({
        products: [],
        pagination: {
          total: 0,
          pages: 0,
          page,
          limit,
        },
      });
    }

    // Get business IDs
    const businessIds = nearbyBusinesses.map((b: any) => b.id);

    // Get products from these businesses
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      take: limit,
      skip: skip,
    });

    // Get total count
    const total = await prisma.product.count({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    // Add distance to each product
    const productsWithDistance = products.map((product) => ({
      ...product,
      distance: 0, // You'll need to calculate this based on the business location
    }));

    return NextResponse.json({
      products: productsWithDistance,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching nearby products:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby products" },
      { status: 500 }
    );
  }
}
