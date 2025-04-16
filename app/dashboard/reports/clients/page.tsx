"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface BusinessCredit {
  business: string;
  total: number;
  paid: number;
  credit: number;
}

interface ClientReport {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  businessOwner: string;
  totalCredit: number;
  businessCredits: BusinessCredit[];
  lastInvoiceDate: string | null;
}

export default function ClientReportsPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientReport[]>([]);

  const searchClients = async () => {
    if (!phone) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/reports/clients/search?phone=${encodeURIComponent(phone)}`
      );
      if (!response.ok) throw new Error("Failed to fetch client data");
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to fetch client data");
    } finally {
      setLoading(false);
    }
  };

  const totalOutstanding = clients.reduce(
    (sum, client) => sum + client.totalCredit,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Enter phone number to search..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={searchClients} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {clients.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Total Outstanding Across All Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalOutstanding.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        )}

        {clients.map((client) => (
          <Card key={client.id} className="mb-6">
            <CardHeader>
              <CardTitle>{client.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                <p>Phone: {client.phone}</p>
                {client.email && <p>Email: {client.email}</p>}
                {client.address && <p>Address: {client.address}</p>}
                <p>Business Owner: {client.businessOwner}</p>
                {client.lastInvoiceDate && (
                  <p>
                    Last Invoice:{" "}
                    {format(new Date(client.lastInvoiceDate), "dd/MM/yyyy")}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Paid Amount</TableHead>
                    <TableHead className="text-right">Credit Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.businessCredits.map((credit, index) => (
                    <TableRow key={index}>
                      <TableCell>{credit.business}</TableCell>
                      <TableCell className="text-right">
                        ₹{credit.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{credit.paid.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{credit.credit.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      ₹
                      {client.businessCredits
                        .reduce((sum, credit) => sum + credit.total, 0)
                        .toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹
                      {client.businessCredits
                        .reduce((sum, credit) => sum + credit.paid, 0)
                        .toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{client.totalCredit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {clients.length === 0 && phone && !loading && (
          <div className="text-center text-muted-foreground">
            No clients found with this phone number
          </div>
        )}
      </div>
    </div>
  );
}
