/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Business } from "@/types";
import { getBusiness } from "../services/api";
import { toast } from "sonner";

export function useBusinessDetails(id: string) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const data = await getBusiness(id);
        setBusiness(data);
      } catch (error) {
        toast.error("Failed to fetch business details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBusiness();
    }
  }, [id]);

  return { business, loading };
}
