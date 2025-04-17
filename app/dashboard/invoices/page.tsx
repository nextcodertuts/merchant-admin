/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-nocheck
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useInvoices } from "@/lib/hooks/useInvoices";
import { useBusiness } from "@/lib/hooks/useBusiness";
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  View,
  FilePenLine,
  Printer,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { VoiceSearch } from "@/components/forms/VoiceSearch";

const statusColors = {
  PENDING: "default",
  PAID: "success",
  PARTIALLY_PAID: "warning",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
} as const;

export default function InvoicesPage() {
  const {
    invoices,
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
  } = useInvoices();
  const { businesses } = useBusiness();

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setSearch(transcript);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading invoices...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button asChild>
          <Link href="/dashboard/invoices/create">Create New Invoice</Link>
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <VoiceSearch onResult={handleVoiceResult} />
        <Select value={businessId} onValueChange={setBusinessId}>
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
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("number")}
                  className="flex items-center gap-1"
                >
                  Invoice #
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("client.name")}
                  className="flex items-center gap-1"
                >
                  Client
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1"
                >
                  Date
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("dueDate")}
                  className="flex items-center gap-1"
                >
                  Due Date
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("total")}
                  className="flex items-center gap-1"
                >
                  Amount
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1"
                >
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>

              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">#{invoice.number}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{invoice.client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.client.phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(invoice.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div>
                    <p>₹{invoice.total.toFixed(2)}</p>
                    {invoice.amountPaid > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Paid: ₹{invoice.amountPaid.toFixed(2)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[invoice.status]}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center">
                  <Link href={`/dashboard/invoices/${invoice.id}`}>
                    <FilePenLine className="h-4 w-4 mr-2" />
                  </Link>
                  <Link href={`/view/invoices/${invoice.id}`}>
                    <Printer className="h-4 w-4 mr-2" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
}
