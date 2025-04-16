/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Invoice } from "@/types";

interface BulkPaymentFormProps {
  invoices: Invoice[];
  onSuccess?: () => void;
}

export function BulkPaymentForm({ invoices, onSuccess }: BulkPaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [applyDiscount, setApplyDiscount] = useState(false);

  const totalDue = invoices.reduce((sum, invoice) => {
    const remaining = invoice.total - invoice.amountPaid;
    return sum + remaining;
  }, 0);

  const selectedDue = selectedInvoices.reduce((sum, id) => {
    const invoice = invoices.find((inv) => inv.id === id);
    if (invoice) {
      return sum + (invoice.total - invoice.amountPaid);
    }
    return sum;
  }, 0);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(invoices.map((inv) => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedInvoices.length === 0) {
      toast.error("Please select at least one invoice");
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setLoading(true);

    try {
      // Calculate payment distribution based on due amounts
      const selectedInvoiceDetails = invoices
        .filter((inv) => selectedInvoices.includes(inv.id))
        .map((inv) => ({
          id: inv.id,
          due: inv.total - inv.amountPaid,
        }));

      const totalSelectedDue = selectedInvoiceDetails.reduce(
        (sum, inv) => sum + inv.due,
        0
      );

      // If applying discount, calculate the discount ratio
      const discountRatio = applyDiscount
        ? paymentAmount / totalSelectedDue
        : 1;

      // Create payments for each selected invoice
      const payments = selectedInvoiceDetails.map((inv) => {
        const proportion = inv.due / totalSelectedDue;
        let invoicePayment = paymentAmount * proportion;

        // If applying discount, adjust the payment amount
        if (applyDiscount) {
          invoicePayment = inv.due * discountRatio;
        }

        return {
          invoiceId: inv.id,
          amount: invoicePayment,
          method,
          reference,
          note: `${note} ${
            applyDiscount ? "(Discount applied)" : ""
          } (Bulk payment)`,
          applyAsFullPayment: applyDiscount, // New flag to indicate discount
        };
      });

      // Make API calls for each payment
      await Promise.all(
        payments.map((payment) =>
          fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payment),
          })
        )
      );

      toast.success("Bulk payment recorded successfully");
      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setAmount("");
      setReference("");
      setNote("");
      setSelectedInvoices([]);
      setApplyDiscount(false);
    } catch (error) {
      toast.error("Failed to process bulk payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Bulk Payment</CardTitle>
        <CardDescription>
          Total selected dues:{" "}
          <span className="font-semibold text-primary">
            ₹{selectedDue.toFixed(2)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedInvoices.length === invoices.length}
                onCheckedChange={handleSelectAll}
              />
              <Label>Select All Invoices</Label>
            </div>
            <Label>Select Invoices</Label>
            {invoices.map(
              (invoice) =>
                invoice.total - invoice.amountPaid > 0 && (
                  <div
                    key={invoice.id}
                    className="flex items-center space-x-2 border p-2 rounded"
                  >
                    <Checkbox
                      checked={selectedInvoices.includes(invoice.id)}
                      onCheckedChange={() => handleInvoiceSelect(invoice.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">Invoice #{invoice.number}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: ₹{(invoice.total - invoice.amountPaid).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
            )}
          </div>

          <div>
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Total Selected Due Amount: ₹{selectedDue.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={applyDiscount}
              onCheckedChange={(checked) =>
                setApplyDiscount(checked as boolean)
              }
            />
            <Label>Mark as full payment (Apply discount)</Label>
          </div>

          <div>
            <Label htmlFor="method">Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction ID or reference number"
            />
          </div>

          <div>
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this payment"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Record Bulk Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
