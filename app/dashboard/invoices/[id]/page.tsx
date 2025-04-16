/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Invoice, Payment } from "@/types";
import { InvoicePDF } from "@/components/invoice-pdf";
import { InvoiceWeb } from "@/components/invoice-web";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { PaymentList } from "@/components/payments/PaymentList";

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");
      const data = await response.json();
      setInvoice(data);
    } catch (error) {
      toast.error("Failed to fetch invoice details");
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/payments?invoiceId=${id}`);
      if (!response.ok) throw new Error("Failed to fetch payments");
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoice();
      fetchPayments();
    }
  }, [id]);

  const handleStatusChange = async (status: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      const updatedInvoice = await response.json();
      setInvoice(updatedInvoice);
      toast.success("Invoice status updated successfully");
    } catch (error) {
      toast.error("Failed to update invoice status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await fetchInvoice();
    await fetchPayments();
    toast.success("Payment recorded successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex justify-center items-center h-screen">
        Invoice not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/invoices" className="flex items-center text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Invoices
        </Link>
        <div className="flex gap-4">
          <Select
            value={invoice.status}
            onValueChange={handleStatusChange}
            disabled={updating}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() =>
              window.open(`/view/invoices/${invoice.id}`, "_blank")
            }
          >
            View Public Link
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InvoiceWeb invoice={invoice} />
        </div>
        <div className="space-y-6">
          <PaymentForm invoice={invoice} onSuccess={handlePaymentSuccess} />
          <PaymentList payments={payments} />
        </div>
      </div>
    </div>
  );
}
