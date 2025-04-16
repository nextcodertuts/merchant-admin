import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";

interface LowStockAlertsCardProps {
  products: Product[];
}

export default function LowStockAlertsCard({
  products,
}: LowStockAlertsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Min Stock</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="hover:underline"
                  >
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.minStock}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <AlertTriangle
                      className={`h-4 w-4 mr-1 ${
                        product.stock === 0
                          ? "text-destructive"
                          : "text-yellow-500"
                      }`}
                    />
                    <span
                      className={
                        product.stock === 0
                          ? "text-destructive"
                          : "text-yellow-500"
                      }
                    >
                      {product.stock === 0 ? "Out of Stock" : "Low Stock"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No low stock products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
