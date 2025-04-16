/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface ProductSearchProps {
  onSelect: (product: Product) => void;
}

export function ProductSearch({ onSelect }: ProductSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}&limit=10`
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      toast.error("Failed to search products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(debouncedSearch);
  }, [debouncedSearch, fetchProducts]);

  const handleProductSelect = (product: Product) => {
    onSelect(product);
    setOpen(false);
    setSearch(""); // Clear search after selection
    setProducts([]); // Clear products list
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className="w-full justify-start text-left font-normal"
        >
          <Search className="h-4 w-4 mr-2" />
          Search products...
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-[90vw] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Search Products</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <div
            className="flex items-center border-b px-3"
            cmdk-input-wrapper=""
          >
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search products..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto">
            {loading && (
              <div className="p-4 text-sm text-center text-muted-foreground">
                Searching...
              </div>
            )}
            {!loading && products.length === 0 && search && (
              <Command.Empty className="p-4 text-sm text-center text-muted-foreground">
                No products found.
              </Command.Empty>
            )}
            {!loading && !search && (
              <div className="p-4 text-sm text-center text-muted-foreground">
                Start typing to search products...
              </div>
            )}
            {products.map((product) => (
              <Command.Item
                key={product.id}
                onSelect={() => handleProductSelect(product)}
                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm">₹{product.price.toFixed(2)}</span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                    <div>
                      <span>Unit: {product.unit}</span>
                      <span className="mx-2">•</span>
                      <span>Tax: {product.taxPercent}%</span>
                    </div>
                    <span
                      className={
                        product.stock <= product.minStock
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
