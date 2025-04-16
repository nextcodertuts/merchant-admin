import { validateRequest } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  return (
    <div className="p-4 print:p-0">
      {user && (
        <Link
          href="/dashboard/invoices"
          className="flex items-center space-x-2 print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>
      )}
      {children}
    </div>
  );
}
