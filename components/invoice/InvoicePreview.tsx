import { useState } from "react";
import { InvoiceA4 } from "./InvoiceA4";
import { InvoiceThermal } from "./InvoiceThermal";
import type { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const [previewType, setPreviewType] = useState<"a4" | "thermal">("a4");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 space-x-2 print:hidden">
        <Button
          onClick={() => setPreviewType("a4")}
          variant={previewType === "a4" ? "default" : "outline"}
        >
          A4 Preview
        </Button>
        <Button
          onClick={() => setPreviewType("thermal")}
          variant={previewType === "thermal" ? "default" : "outline"}
        >
          Thermal Printer Preview
        </Button>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>
      <div className="print:hidden">
        {previewType === "a4" ? (
          <InvoiceA4 invoice={invoice} />
        ) : (
          <InvoiceThermal invoice={invoice} />
        )}
      </div>
      <div className="hidden print:block">
        {previewType === "a4" ? (
          <InvoiceA4 invoice={invoice} />
        ) : (
          <InvoiceThermal invoice={invoice} />
        )}
      </div>
    </div>
  );
}
