/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city")?.toLowerCase();
    const days = parseInt(searchParams.get("days") || "7");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    if (!city) {
      return NextResponse.json(
        { error: "City parameter is required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Get trending searches for the specified city and time period
    const where = {
      city: city,
      lastSearchedAt: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      },
      // Add a minimum count threshold to filter out noise
      count: {
        gte: 2, // Only show queries that have been suggested at least twice
      },
      ...(search && {
        query: {
          contains: search,
          mode: "insensitive",
        },
      }),
    };

    const [trending, total] = await Promise.all([
      prisma.searchQuery.findMany({
        where,
        orderBy: [{ count: "desc" }, { lastSearchedAt: "desc" }],
        skip,
        take: limit,
        distinct: ["query"], // Ensure unique queries only
      }),
      prisma.searchQuery.count({ where }),
    ]);

    // Format the response
    const formattedTrending = trending.map((item) => ({
      query: item.query,
      count: item.count,
      lastSearchedAt: item.lastSearchedAt,
    }));

    return NextResponse.json({
      trending: formattedTrending,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Trending search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending searches" },
      { status: 500 }
    );
  }
}
