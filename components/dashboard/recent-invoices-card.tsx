import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Invoice } from "@/types";

interface RecentInvoicesCardProps {
  invoices: Invoice[];
}

export default function RecentInvoicesCard({
  invoices,
}: RecentInvoicesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.slice(0, 5).map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="hover:underline"
                  >
                    #{invoice.number}
                  </Link>
                </TableCell>
                <TableCell>{invoice.client.name}</TableCell>
                <TableCell>₹{invoice.total.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === "PAID"
                        ? "default"
                        : invoice.status === "PENDING"
                        ? "secondary"
                        : invoice.status === "OVERDUE"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No recent invoices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
