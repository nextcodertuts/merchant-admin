/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product, Invoice } from "@/types";
import { useBusiness } from "@/lib/hooks/useBusiness";
import { toast } from "sonner";
import { ItemList } from "./ItemList";
import { BusinessSelect } from "./BusinessSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { QRPopup } from "../payments/qr-popup";

interface DocumentFormProps {
  type: "invoice";
  initialData?: Invoice;
  onSubmit: (data: any) => Promise<void>;
}

export function DocumentForm({
  type,
  initialData,
  onSubmit,
}: DocumentFormProps) {
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    initialData
      ? new Date(type === "invoice" ? (initialData as Invoice).dueDate : "")
          .toISOString()
          .split("T")[0]
      : ""
  );
  const [businessId, setBusinessId] = useState(initialData?.businessId || "");
  const [items, setItems] = useState<
    Array<{
      productId: string;
      quantity: number;
      price: number;
      product?: Product;
    }>
  >(
    initialData?.items?.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.price,
      product: item.product,
    })) || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { businesses, loading: loadingBusinesses } = useBusiness();

  // Payment related state
  const [includePayment, setIncludePayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  // Calculate total amount
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      if (!item.product) return total;
      const price = item.price ?? item.product.price;
      const subtotal = price * item.quantity;
      const tax = (subtotal * item.product.taxPercent) / 100;
      return total + subtotal + tax;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      toast.error("Please select a business");
      return;
    }

    if (items.some((item) => !item.productId)) {
      toast.error("Please select products for all items");
      return;
    }

    if (includePayment && !paymentAmount) {
      toast.error("Please enter payment amount");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const invoiceData = {
        date,
        [type === "invoice" ? "dueDate" : "expiryDate"]: endDate,
        items: items.map(({ productId, quantity, price }) => ({
          productId,
          quantity,
          price,
        })),
        businessId,
        status: initialData?.status || "PENDING",
        payment: includePayment
          ? {
              amount: parseFloat(paymentAmount),
              method: paymentMethod,
              reference: paymentReference,
              note: paymentNote,
            }
          : null,
      };

      await onSubmit(invoiceData);

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} ${
          initialData ? "updated" : "created"
        } successfully`
      );
      router.push(`/dashboard/${type}s`);
    } catch (err) {
      toast.error(
        `Failed to ${
          initialData ? "update" : "create"
        } ${type}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = async (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // If the field is productId, fetch the product details
    if (field === "productId") {
      try {
        const response = await fetch(`/api/products/${value}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const product = await response.json();
        newItems[index].product = product;
        newItems[index].price = product.price; // Set initial price to product's price
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to fetch product details");
      }
    }

    setItems(newItems);
  };

  if (loadingBusinesses) {
    return <div>Loading...</div>;
  }

  const total = calculateTotal();

  return (
    <div className="container mx-auto px-4 pb-20">
      <h1 className="text-2xl font-bold my-4">
        {initialData ? "Edit" : "Create New"}{" "}
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="business">Select Business</Label>
          <BusinessSelect
            businesses={businesses}
            value={businessId}
            onChange={setBusinessId}
          />
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">
            {type === "invoice" ? "Due Date" : "Expiry Date"}
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Items</Label>
          <ItemList
            items={items}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
          />
        </div>
        <div className="text-right">
          <p>
            Total Invoice value:{" "}
            <span className="font-semibold text-lg text-green-400">
              ₹{total}
            </span>
          </p>
          <QRPopup amount={total} upiId="q673666273@ybl" />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Details</CardTitle>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={includePayment}
                  onCheckedChange={setIncludePayment}
                />
                <Label>Include Payment</Label>
              </div>
            </div>
          </CardHeader>
          {includePayment && (
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentAmount">Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={total}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Total Invoice Amount: ₹{total.toFixed(2)}
                </p>
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                <Label htmlFor="paymentReference">Reference Number</Label>
                <Input
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction ID or reference number"
                />
              </div>
              <div>
                <Label htmlFor="paymentNote">Note</Label>
                <Input
                  id="paymentNote"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Add a note for this payment"
                />
              </div>
            </CardContent>
          )}
        </Card>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
            ? "Update"
            : "Create"}
        </Button>
      </form>
    </div>
  );
}
