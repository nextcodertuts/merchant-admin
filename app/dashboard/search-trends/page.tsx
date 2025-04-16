/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";
import { useBusiness } from "@/lib/hooks/useBusiness";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface TrendingSearch {
  query: string;
  count: number;
  lastSearchedAt: string;
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function SearchTrendsPage() {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [timeRange, setTimeRange] = useState("7");
  const [trending, setTrending] = useState<TrendingSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });
  const { businesses } = useBusiness();
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [trendSearch, setTrendSearch] = useState("");

  // Get unique cities from businesses
  const cities = Array.from(
    new Set(businesses.map((b) => b.city?.toLowerCase()).filter(Boolean))
  );

  const fetchTrending = async () => {
    if (!selectedCity) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        city: selectedCity,
        days: timeRange,
        page: page.toString(),
        limit: "10",
        ...(trendSearch && { search: trendSearch }),
      });

      const response = await fetch(`/api/search/trending?${params}`);
      if (!response.ok) throw new Error("Failed to fetch trending searches");
      const data = await response.json();
      setTrending(data.trending);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch trending searches");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (!query || !selectedCity) return;

    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(
          query
        )}&city=${encodeURIComponent(selectedCity)}`
      );
      if (!response.ok) throw new Error("Failed to fetch suggestions");
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      setPage(1); // Reset page when city or time range changes
      fetchTrending();
    }
  }, [selectedCity, timeRange, trendSearch]);

  useEffect(() => {
    if (selectedCity) {
      fetchTrending();
    }
  }, [page]);

  useEffect(() => {
    if (debouncedSearch) {
      fetchSuggestions(debouncedSearch);
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearch, selectedCity]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-[2]">
              <Input
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!selectedCity}
              />
            </div>
          </div>
          {suggestions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Suggestions:</h3>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 bg-muted rounded-md text-sm cursor-pointer hover:bg-accent"
                    onClick={() => setSearchQuery(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="w-48">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search trends..."
                value={trendSearch}
                onChange={(e) => setTrendSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading trending searches...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Search Query</TableHead>
                    <TableHead className="text-right">Search Count</TableHead>
                    <TableHead>Last Searched</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trending.map((search) => (
                    <TableRow key={search.query}>
                      <TableCell className="font-medium">
                        {search.query}
                      </TableCell>
                      <TableCell className="text-right">
                        {search.count}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(search.lastSearchedAt),
                          "MMM d, yyyy HH:mm"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {trending.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        No trending searches found for this city and time range
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
