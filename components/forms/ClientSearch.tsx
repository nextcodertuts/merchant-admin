// components/forms/ClientSearch.tsx
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Client } from "@/types";
import { toast } from "sonner";

interface ClientSearchProps {
  onClientSelect: (client: Client) => void;
}

export function ClientSearch({ onClientSelect }: ClientSearchProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [clientData, setClientData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const searchClient = async () => {
    if (!phone) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/clients/search?phone=${phone}`);
      const data = await response.json();

      if (data) {
        onClientSelect(data);
        setShowForm(false);
      } else {
        setShowForm(true);
        setClientData({ name: "", email: "", address: "", phone: "" });
      }
    } catch (error) {
      toast.error("Failed to search client");
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clientData,
          phone,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        onClientSelect(data);
        setShowForm(false);
        toast.success("Client created successfully");
      } else {
        throw new Error(data.error || "Failed to create client");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error(error.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="phone">Client Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter client phone number"
          />
        </div>
        <Button
          type="button"
          onClick={searchClient}
          disabled={!phone || loading}
          className="mt-8"
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={createClient} className="space-y-4">
          <div>
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              value={clientData.name}
              onChange={(e) =>
                setClientData({ ...clientData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="phone"
              value={phone}
              onChange={(e) =>
                setClientData({ ...clientData, phone: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={clientData.address}
              onChange={(e) =>
                setClientData({ ...clientData, address: e.target.value })
              }
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Client"}
          </Button>
        </form>
      )}
    </div>
  );
}
