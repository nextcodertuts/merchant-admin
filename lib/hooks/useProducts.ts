/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { toast } from "sonner";

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  pagination: PaginationData;
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number) => void;
  businessId: string;
  setBusinessId: (businessId: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: string;
  setSortOrder: (sortOrder: string) => void;
  mutate: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [businessId, setBusinessId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(businessId && { businessId }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, page, businessId, sortBy, sortOrder]);

  return {
    products,
    loading,
    pagination,
    search,
    setSearch,
    page,
    setPage,
    businessId,
    setBusinessId,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    mutate: fetchProducts,
  };
}
