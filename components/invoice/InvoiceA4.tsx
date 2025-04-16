/* eslint-disable @next/next/no-img-element */

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from "@/types";

const DEFAULT_LOGO =
  "https://gist.github.com/user-attachments/assets/a6925d83-68ab-4150-a95f-fae671d61c99";

export function InvoiceA4({ invoice }: { invoice: Invoice }) {
  return (
    <div className="w-[210mm] h-[297mm] mx-auto my-4 p-8 bg-white shadow-lg print:shadow-none">
      <div className="flex flex-row justify-between items-start pb-3">
        <div className="flex flex-col">
          <img
            src={invoice.business?.logoUrl || DEFAULT_LOGO}
            alt="Business Logo"
            className="w-28 h-28 object-contain mb-4"
          />
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {invoice.business?.name}
            </p>
            <p>{invoice.business?.address}</p>
            <p>{invoice.business?.email}</p>
            <p>{invoice.business?.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-primary mb-2">Invoice</h1>
          <p className="text-xl font-medium text-muted-foreground mb-1">
            #{invoice.number}
          </p>
          <div className="space-y-1 text-sm">
            <p>
              Date:{" "}
              {new Date(invoice.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
            <p>Status: {invoice.status}</p>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Bill To</h3>
        <div className="space-y-1 text-sm">
          <p className="font-medium">{invoice.client?.name}</p>
          <p>{invoice.client?.email}</p>
          {invoice.client?.address && <p>{invoice.client?.address}</p>}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold">Item</TableHead>
            <TableHead className="font-semibold text-right">Quantity</TableHead>
            <TableHead className="font-semibold text-right">Price</TableHead>
            <TableHead className="font-semibold text-right">D.Price</TableHead>
            <TableHead className="font-semibold text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.items?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.product.name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                ₹{item.product.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                ₹{item.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                ₹{(item.quantity * item.price).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 flex justify-end">
        <div className="w-1/2 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>₹{invoice.total.toFixed(2)}</span>
          </div>

          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>₹{invoice.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Amount Paid:</span>
            <span>- ₹{invoice.amountPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span className="font-medium">Balance Due:</span>
            <span>₹{(invoice.total - invoice.amountPaid).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {invoice.business?.bankName && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-1">Payment Details</h3>
          <Card className="bg-muted max-w-fit">
            <CardContent className="p-4 space-y-2 text-sm">
              <p>
                <span className="font-medium">Bank Name:</span>{" "}
                {invoice.business.bankName}
              </p>
              <p>
                <span className="font-medium">Account No:</span>{" "}
                {invoice.business.accountNo}
              </p>
              <p>
                <span className="font-medium">IFSC Code:</span>{" "}
                {invoice.business.ifscCode}
              </p>
              {invoice.business.upiId && (
                <p>
                  <span className="font-medium">UPI ID:</span>{" "}
                  {invoice.business.upiId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-12 text-right">
        <div className="inline-block border-t border-muted-foreground pt-2">
          <p className="text-sm font-medium">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
}
