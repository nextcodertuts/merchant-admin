"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusiness } from "@/lib/hooks/useBusiness";

interface DashboardHeaderProps {
  period: string;
  setPeriod: (value: string) => void;
  businessId: string;
  setBusinessId: (value: string) => void;
}

export default function DashboardHeader({
  period,
  setPeriod,
  businessId,
  setBusinessId,
}: DashboardHeaderProps) {
  const { businesses } = useBusiness();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      <div className="flex gap-4">
        <Select
          value={businessId || "all"}
          onValueChange={(value) => setBusinessId(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Businesses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Businesses</SelectItem>
            {businesses.map((business) => (
              <SelectItem key={business.id} value={business.id}>
                {business.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
