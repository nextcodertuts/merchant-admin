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

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Find businesses within the radius
    const nearbyBusinesses = await prisma.$queryRaw`
      SELECT 
        b.id, 
        b.name,
        b."logoUrl",
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
        ${
          search
            ? prisma.$raw`AND b.name ILIKE ${`%${search}%`}`
            : prisma.$raw``
        }
      ORDER BY distance
      LIMIT ${limit}
      OFFSET ${skip}
    `;

    // Get total count for pagination
    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*)
      FROM "Business" b
      WHERE b.longitude IS NOT NULL 
        AND b.latitude IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint(b.longitude, b.latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radiusKm * METERS_PER_KM}
        )
        ${
          search
            ? prisma.$raw`AND b.name ILIKE ${`%${search}%`}`
            : prisma.$raw``
        }
    `;

    const total = parseInt(totalCount[0].count);

    // Format the response
    const merchants = nearbyBusinesses.map((business: any) => ({
      id: business.id,
      name: business.name,
      image: business.logoUrl || null,
      distance: Number.parseFloat(business.distance) / METERS_PER_KM, // Convert to km
    }));

    return NextResponse.json({
      merchants,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching nearby merchants:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby merchants" },
      { status: 500 }
    );
  }
}
