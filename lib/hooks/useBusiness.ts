/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Business } from "@/types";
import { getBusinesses } from "../services/api";
import { toast } from "sonner";

export function useBusiness() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const data = await getBusinesses();
        setBusinesses(data);
      } catch (error) {
        toast.error("Failed to fetch businesses");
      } finally {
        setLoading(false);
      }
    }

    fetchBusinesses();
  }, []);

  return { businesses, loading };
}
