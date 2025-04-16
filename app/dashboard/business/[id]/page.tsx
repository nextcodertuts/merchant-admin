// app/dashboard/business/[id]/page.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateBusiness } from "@/lib/services/api";
import { useBusinessDetails } from "@/lib/hooks/useBusinessDetails";
import { toast } from "sonner";

export default function EditBusiness() {
  const { id } = useParams();
  const router = useRouter();
  const { business, loading } = useBusinessDetails(id as string);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [upiId, setUpiId] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name);
      setEmail(business.email || "");
      setPhone(business.phone || "");
      setAddress(business.address || "");
      setCity(business.city || "");
      setState(business.state || "");
      setPincode(business.pincode || "");
      setWebsite(business.website || "");
      setLogoUrl(business.logoUrl || "");
      setBankName(business.bankName || "");
      setIfscCode(business.ifscCode || "");
      setAccountNo(business.accountNo || "");
      setUpiId(business.upiId || "");
      setInvoicePrefix(business.invoicePrefix || "INV");
    }
  }, [business]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateBusiness(id as string, {
        name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        website,
        logoUrl,
        bankName,
        ifscCode,
        accountNo,
        upiId,
        invoicePrefix,
      });
      toast.success("Business updated successfully");
      router.push("/dashboard/business");
    } catch (error) {
      toast.error("Failed to update business");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div>Loading business details...</div>;
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <h1 className="text-2xl font-bold my-4">Edit Business</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Business Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div>
          <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
          <Input
            id="invoicePrefix"
            value={invoicePrefix}
            onChange={(e) => setInvoicePrefix(e.target.value)}
            placeholder="INV"
            required
            maxLength={5}
          />
          <p className="text-sm text-muted-foreground mt-1">
            This prefix will be used for all invoices generated for this
            business (e.g., INV001)
          </p>
        </div>
        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="accountNo">Account Number</Label>
              <Input
                id="accountNo"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard/business")}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Business"}
          </Button>
        </div>
      </form>
    </div>
  );
}
