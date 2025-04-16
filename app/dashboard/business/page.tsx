"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBusiness } from "@/lib/hooks/useBusiness";

export default function BusinessPage() {
  const { businesses, loading } = useBusiness();

  if (loading) {
    return <div>Loading businesses...</div>;
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <h1 className="text-2xl font-bold my-4">Businesses</h1>
      <Button asChild className="mb-4">
        <Link href="/dashboard/business/create">Add New Business</Link>
      </Button>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell>{business.name}</TableCell>
                <TableCell>{business.email}</TableCell>
                <TableCell>{business.phone}</TableCell>
                <TableCell>{business.website}</TableCell>
                <TableCell>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/business/${business.id}`}>
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
