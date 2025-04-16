import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types";
import { ProductSearch } from "./ProductSearch";

interface ItemListProps {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    product?: Product;
  }>;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: string, value: string | number) => void;
}

export function ItemList({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: ItemListProps) {
  const calculateItemTotal = (item: {
    productId: string;
    quantity: number;
    price: number;
    product?: Product;
  }) => {
    if (!item.product) return 0;
    const subtotal = item.price * item.quantity;
    const tax = (subtotal * item.product.taxPercent) / 100;
    return subtotal + tax;
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="space-y-2 border rounded-lg p-2">
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <ProductSearch
                onSelect={(product) =>
                  onUpdateItem(index, "productId", product.id)
                }
              />
              {item.product && (
                <div className="mt-2 space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">{item.product.name}</span>
                    <span className="mx-2">•</span>
                    <span>Base Price: ₹{item.product.price.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span>Tax: {item.product.taxPercent}%</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateItem(index, "quantity", parseInt(e.target.value))
                  }
                  min="1"
                  className="w-20"
                  placeholder="Qty"
                  required
                />
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    onUpdateItem(index, "price", parseFloat(e.target.value))
                  }
                  min="0"
                  step="0.01"
                  className="w-20"
                  placeholder="Price"
                  required
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => onRemoveItem(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {item.product && (
            <div className="text-sm text-right text-muted-foreground">
              Total (inc. tax): ₹{calculateItemTotal(item).toFixed(2)}
            </div>
          )}
        </div>
      ))}
      <Button type="button" onClick={onAddItem} className="w-full">
        Add Item
      </Button>
    </div>
  );
}
