"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { toast } from "sonner";

export default function LoanPage() {
  const [clientCount, setClientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientCount() {
      try {
        const response = await fetch("/api/loan/client-count");
        if (!response.ok) throw new Error("Failed to fetch client count");
        const data = await response.json();
        setClientCount(data.totalClients);
      } catch (error) {
        console.error("Error fetching client count:", error);
        toast.error("Failed to fetch client count");
      } finally {
        setLoading(false);
      }
    }

    fetchClientCount();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (clientCount >= 200) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Business Loan Available! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Congratulations! Your business has qualified for our exclusive
                business loan program.
              </p>
              <p className="text-lg font-medium mb-8">
                Contact our loan specialists to discuss your options.
              </p>
              <Button size="lg" className="gap-2" asChild>
                <a href="tel:+911169313594">
                  <Phone className="h-5 w-5" />
                  Call Us Now: +91 116-931-3594
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Business Loan Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">
                Almost There! Keep Growing Your Business
              </h3>
              <p className="text-lg text-muted-foreground mb-4">
                You currently have {clientCount} customers. Reach 200 customers
                to unlock our exclusive business loan program.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div
                  className="bg-primary h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((clientCount / 200) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {200 - clientCount} more customers needed to qualify
              </p>
            </div>
            <div className="bg-muted p-6 rounded-lg">
              <h4 className="font-semibold mb-4">
                Benefits of Our Business Loan Program:
              </h4>
              <ul className="text-left space-y-2">
                <li>✓ Competitive interest rates</li>
                <li>✓ Flexible repayment terms</li>
                <li>✓ Quick approval process</li>
                <li>✓ No hidden charges</li>
                <li>✓ Dedicated relationship manager</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
