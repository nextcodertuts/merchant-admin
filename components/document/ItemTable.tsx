import { Product } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DocumentItem {
  id: string;
  quantity: number;
  product: Product;
}

interface ItemTableProps {
  items: DocumentItem[];
}

export function ItemTable({ items }: ItemTableProps) {
  const calculateSubtotal = (item: DocumentItem) => {
    return item.quantity * item.product.price;
  };

  const calculateTax = (item: DocumentItem) => {
    const subtotal = calculateSubtotal(item);
    return (subtotal * item.product.taxPercent) / 100;
  };

  const calculateTotal = (item: DocumentItem) => {
    return calculateSubtotal(item) + calculateTax(item);
  };

  const documentTotal = items.reduce(
    (sum, item) => sum + calculateTotal(item),
    0
  );
  const taxTotal = items.reduce((sum, item) => sum + calculateTax(item), 0);
  const subtotal = items.reduce(
    (sum, item) => sum + calculateSubtotal(item),
    0
  );

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Tax %</TableHead>
            <TableHead className="text-right">Tax Amount</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.product.name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">{item.product.unit}</TableCell>
              <TableCell className="text-right">
                ₹{item.product.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {item.product.taxPercent}%
              </TableCell>
              <TableCell className="text-right">
                ₹{calculateTax(item).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                ₹{calculateTotal(item).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-1 items-end text-sm">
        <div className="flex w-full max-w-[400px] justify-between">
          <span className="text-muted-foreground">Subtotal:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex w-full max-w-[400px] justify-between">
          <span className="text-muted-foreground">Tax Total:</span>
          <span>₹{taxTotal.toFixed(2)}</span>
        </div>
        <div className="flex w-full max-w-[400px] justify-between border-t pt-1">
          <span className="font-medium">Total:</span>
          <span className="font-medium">₹{documentTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
