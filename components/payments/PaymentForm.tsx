/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Invoice } from "@/types";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
  invoice: Invoice;
  onSuccess?: () => void;
  showSkip?: boolean;
}

export function PaymentForm({
  invoice,
  onSuccess,
  showSkip,
}: PaymentFormProps) {
  const remainingBalance = invoice.total - (invoice.amountPaid || 0);
  const [amount, setAmount] = useState(remainingBalance.toString());
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Update amount if invoice changes
  useEffect(() => {
    setAmount(remainingBalance.toString());
  }, [remainingBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate payment amount
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (paymentAmount > remainingBalance) {
      toast.error(
        `Payment amount cannot exceed the remaining balance of ₹${remainingBalance.toFixed(
          2
        )}`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: paymentAmount,
          method,
          reference,
          note,
        }),
      });

      if (!response.ok) throw new Error("Failed to record payment");

      toast.success("Payment recorded successfully");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/dashboard/invoices/${invoice.id}`);
      }
    } catch (error) {
      toast.error("Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
        <CardDescription>
          Remaining balance:{" "}
          <span className="font-semibold text-primary">
            ₹{remainingBalance.toFixed(2)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              max={remainingBalance}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Maximum: ₹{remainingBalance.toFixed(2)}
            </p>
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
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
            {showSkip && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSkip}
              >
                Skip Payment
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
