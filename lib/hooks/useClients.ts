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
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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
  }, [search, page]);

  return {
    clients,
    loading,
    pagination,
    search,
    setSearch,
    page,
    setPage,
  };
}
