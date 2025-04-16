/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Expense } from "@/types";
import { toast } from "sonner";

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface UseExpensesReturn {
  expenses: Expense[];
  loading: boolean;
  pagination: PaginationData;
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number) => void;
  category: string;
  setCategory: (category: string) => void;
  mutate: () => Promise<void>;
}

export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(category && { category }),
      });

      const response = await fetch(`/api/expenses?${params}`);
      if (!response.ok) throw new Error("Failed to fetch expenses");

      const data = await response.json();
      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [search, page, category]);

  return {
    expenses,
    loading,
    pagination,
    search,
    setSearch,
    page,
    setPage,
    category,
    setCategory,
    mutate: fetchExpenses,
  };
}
