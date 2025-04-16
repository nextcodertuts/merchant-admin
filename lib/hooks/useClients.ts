/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from "react";
import { Client } from "@/types";
import { toast } from "sonner";

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface UseClientsReturn {
  clients: Client[];
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
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
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

  useEffect(() => {
    async function fetchClients() {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(search && { search }),
          ...(businessId && { businessId }),
          sortBy,
          sortOrder,
        });

        const response = await fetch(`/api/clients?${params}`);
        if (!response.ok) throw new Error("Failed to fetch clients");

        const data = await response.json();
        setClients(data.clients);
        setPagination(data.pagination);
      } catch (error) {
        toast.error("Failed to fetch clients");
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, [search, page, businessId, sortBy, sortOrder]);

  return {
    clients,
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
  };
}
