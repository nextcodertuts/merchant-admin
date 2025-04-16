/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
const cache = new Map();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const city = searchParams.get("city")?.toLowerCase();
    const finalkeyword = query + " " + "india";

    if (!query || !city) {
      return NextResponse.json(
        { error: "Query and city parameters are required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${city}-${query}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult && cachedResult.timestamp > Date.now() - CACHE_DURATION) {
      return NextResponse.json(cachedResult.data);
    }

    console.log("finalkeyword", finalkeyword);

    // Fetch suggestions from Google
    const googleResponse = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(
        finalkeyword
      )}`
    );
    const [, suggestions] = await googleResponse.json();

    console.log("suggestion", suggestions);

    // Store each suggestion in the database
    const { user } = await validateRequest();
    if (user) {
      // Store all suggestions in parallel
      await Promise.all(
        suggestions.map((suggestion: string) =>
          prisma.searchQuery.upsert({
            where: {
              query_city: {
                query: suggestion.toLowerCase(),
                city: city,
              },
            },
            update: {
              count: { increment: 1 },
              lastSearchedAt: new Date(),
            },
            create: {
              query: suggestion.toLowerCase(),
              city: city,
              count: 1,
              userId: user.id,
            },
          })
        )
      );
    }

    // Cache the result
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: suggestions,
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Search suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
