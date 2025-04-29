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

    // Raw SQL query using ST_DWithin for better performance with spatial index
    const result = await prisma.$queryRaw`
      WITH nearby_businesses AS (
        SELECT b.id, b.name as business_name,
               ST_Distance(
                 ST_MakePoint(b.longitude, b.latitude)::geography,
                 ST_MakePoint(${lng}, ${lat})::geography
               ) as distance
        FROM "Business" b
        WHERE ST_DWithin(
          ST_MakePoint(b.longitude, b.latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radiusKm * METERS_PER_KM}
        )
      )
      SELECT 
        p.*,
        nb.distance,
        nb.business_name
      FROM "Product" p
      INNER JOIN nearby_businesses nb ON p.business_id = nb.id
      WHERE p.name ILIKE ${`%${search}%`}
      ORDER BY nb.distance ASC
      LIMIT ${limit}
      OFFSET ${skip}
    `;

    // Get total count for pagination
    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*)
      FROM "Product" p
      INNER JOIN "Business" b ON p.business_id = b.id
      WHERE ST_DWithin(
        ST_MakePoint(b.longitude, b.latitude)::geography,
        ST_MakePoint(${lng}, ${lat})::geography,
        ${radiusKm * METERS_PER_KM}
      )
      AND p.name ILIKE ${`%${search}%`}
    `;

    return NextResponse.json({
      products: result,
      pagination: {
        total: parseInt(totalCount[0].count),
        pages: Math.ceil(parseInt(totalCount[0].count) / limit),
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
