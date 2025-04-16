/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useClients } from "@/lib/hooks/useClients";
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";
import { Client } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

export default function ClientsPage() {
  const { clients, loading, pagination, search, setSearch, page, setPage } =
    useClients();
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading customers...
      </div>
    );
  }

  const generateWhatsAppMessage = (client: Client) => {
    return `প্রিয় ${client.name},

*Ramdhanu Garments* থেকে বলছি। আপনার বকেয়া পরিমাণ ${client.totalCredit.toFixed(
      2
    )} টাকা এখনো পরিশোধ করা হয়নি। *অনুগ্রহ করে আপনার বকেয়া পরিশোধ করুন যাতে আমাদের পরিষেবা অব্যাহত রাখা যায়।*

আপনি সহজেই এই লিঙ্কের মাধ্যমে পেমেন্ট করতে পারেন:
 Pay Now: https://upi.me/pay?pa=q673666273@ybl&pn=&mc=0000&tid=123456789&tr=TXN12345678&tn=Payment&am=${client.totalCredit.toFixed(
   2
 )}&cu=INR

যদি ইতিমধ্যে পেমেন্ট করে থাকেন, দয়া করে আমাদের জানাবেন। ধন্যবাদ।

*Ramdhanu Garments*`;
  };

  const generateWhatsAppLink = (client: Client) => {
    const phoneNumber = client.phone.startsWith("+")
      ? client.phone.substring(1)
      : client.phone;

    return `https://wa.me/+91${phoneNumber}?text=`;
  };

  const copyMessageToClipboard = async (client: Client) => {
    const message = generateWhatsAppMessage(client);

    try {
      await navigator.clipboard.writeText(message);
      setCopiedClientId(client.id);
      toast.success("Message copied to clipboard");

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedClientId(null);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy message");
    }
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button asChild>
          <Link href="/dashboard/clients/create">Add New Customers</Link>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Total Dues</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.email || "-"}</TableCell>
                <TableCell>{client.address || "-"}</TableCell>
                <TableCell>₹{client.totalCredit.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/clients/${client.id}`}>
                        <FileText className="h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-500 hover:bg-green-600 text-white"
                      asChild
                    >
                      <a
                        href={generateWhatsAppLink(client)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyMessageToClipboard(client)}
                    >
                      {copiedClientId === client.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Message
                        </>
                      )}
                    </Button>
                  </div>
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
