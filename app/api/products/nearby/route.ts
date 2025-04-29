/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const METERS_PER_KM = 1000;
const DEFAULT_RADIUS_KM = 5;
const DEFAULT_LIMIT = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number.parseFloat(searchParams.get("lat") || "0");
    const lng = Number.parseFloat(searchParams.get("lng") || "0");
    const radiusKm = Number.parseFloat(
      searchParams.get("radius") || String(DEFAULT_RADIUS_KM)
    );
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(
      searchParams.get("limit") || String(DEFAULT_LIMIT)
    );
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // First, find businesses within the radius
    const nearbyBusinesses = await prisma.$queryRaw`
      SELECT 
        b.id, 
        b.name,
        b."userId",
        ST_Distance(
          ST_MakePoint(b.longitude, b.latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography
        ) as distance
      FROM "Business" b
      WHERE b.longitude IS NOT NULL 
        AND b.latitude IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint(b.longitude, b.latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radiusKm * METERS_PER_KM}
        )
      ORDER BY distance
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

    // Get user IDs who own these businesses
    const userIds = [...new Set(nearbyBusinesses.map((b: any) => b.userId))];

    // Create a map of businesses for quick lookup
    const businessMap = nearbyBusinesses.reduce((map: any, business: any) => {
      map[business.userId] = business;
      return map;
    }, {});

    // Get products from these users with filtering
    const whereClause: any = {
      userId: { in: userIds },
    };

    if (search) {
      whereClause.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category) {
      whereClause.category = {
        contains: category,
        mode: "insensitive",
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get total count
    const total = await prisma.product.count({
      where: whereClause,
    });

    // Add merchant name and distance to each product
    const productsWithMerchantAndDistance = products.map((product) => {
      const business = businessMap[product.userId];
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        merchantName: business?.name || "Unknown Merchant",
        distance: Number.parseFloat(business?.distance) / METERS_PER_KM, // Convert to km
        images: product.images,
        category: product.category,
        description: product.description,
      };
    });

    return NextResponse.json({
      products: productsWithMerchantAndDistance,
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
