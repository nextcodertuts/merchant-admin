/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Client } from "@/types";
import { ClientSearch } from "@/components/forms/ClientSearch";
import { DocumentForm } from "@/components/forms/DocumentForm";

export default function CreateInvoicePage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const router = useRouter();

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  const handleSubmit = async (data: any) => {
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          clientId: selectedClient.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to create invoice");
      const invoice = await response.json();
      toast.success("Invoice created successfully");
      router.push(`/dashboard/invoices/${invoice.id}`);
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <Link
        href="/dashboard/invoices"
        className="flex items-center text-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Invoices
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedClient ? (
            <div className="space-y-2">
              <div>
                <span className="font-medium">Selected Client:</span>{" "}
                {selectedClient.name}
              </div>
              <div>
                <span className="font-medium">Phone:</span>{" "}
                {selectedClient.phone}
              </div>
              {selectedClient.totalCredit && (
                <div>
                  <span className="font-medium">Total Credit:</span>{" "}
                  {Math.floor(selectedClient.totalCredit)}
                </div>
              )}
              <Button variant="outline" onClick={() => setSelectedClient(null)}>
                Change Client
              </Button>
            </div>
          ) : (
            <ClientSearch onClientSelect={handleClientSelect} />
          )}
        </CardContent>
      </Card>

      {selectedClient && (
        <DocumentForm type="invoice" onSubmit={handleSubmit} />
      )}
    </div>
  );
}
