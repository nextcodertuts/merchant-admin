/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Client, Invoice } from "@/types";
import { BulkPaymentForm } from "@/components/payments/BulkPaymentForm";

interface ClientWithInvoices extends Client {
  invoices?: (Invoice & {
    payments?: { amount: number }[];
  })[];
}

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientWithInvoices | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function fetchClient() {
      try {
        const response = await fetch(`/api/clients/${id}`);
        if (!response.ok) throw new Error("Failed to fetch client");
        const data = await response.json();
        setClient(data);
        setName(data.name);
        setEmail(data.email || "");
        setPhone(data.phone);
        setAddress(data.address || "");
      } catch (error) {
        toast.error("Failed to fetch client details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchClient();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address }),
      });

      if (!response.ok) throw new Error("Failed to update client");
      toast.success("Client updated successfully");
      router.push("/dashboard/clients");
    } catch (error) {
      toast.error("Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh client data to update dues
    if (id) {
      fetchClient();
    }
  };

  async function fetchClient() {
    try {
      const response = await fetch(`/api/clients/${id}`);
      if (!response.ok) throw new Error("Failed to fetch client");
      const data = await response.json();
      setClient(data);
    } catch (error) {
      toast.error("Failed to fetch client details");
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  // Calculate total dues by subtracting all payments from invoice totals
  const totalDues =
    client.invoices?.reduce((acc, invoice) => {
      const invoiceTotal = invoice.total;
      const paymentTotal =
        invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) ||
        0;
      return acc + (invoiceTotal - paymentTotal);
    }, 0) || 0;

  const unpaidInvoices =
    client.invoices?.filter(
      (invoice) => invoice.total - invoice.amountPaid > 0
    ) || [];

  return (
    <div className="container mx-auto px-4 pb-20">
      <Link
        href="/dashboard/clients"
        className="flex items-center text-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Clients
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edit Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div>
                <Label>Total Dues</Label>
                <p className="text-lg font-semibold">₹{totalDues.toFixed(2)}</p>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/dashboard/clients")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {unpaidInvoices.length > 0 && (
          <BulkPaymentForm
            invoices={unpaidInvoices}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
}
