/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { getProduct, updateProduct, deleteProduct } from "@/lib/services/api";
import { toast } from "sonner";
import { ImageList } from "@/components/products/ImageList";

const units = [
  "piece",
  "kg",
  "g",
  "mg",
  "l",
  "ml",
  "m",
  "cm",
  "mm",
  "Nos",
  "Ft",
];

const categories = [
  "Electronics",
  "Clothing",
  "Food",
  "Beverages",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Sports & Fitness",
  "Books",
  "Toys & Games",
  "Automotive",
  "Health & Wellness",
  "Office Supplies",
  "Pet Supplies",
  "Tools & Home Improvement",
  "General",
];

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [buyPrice, setBuyPrice] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("piece");
  const [taxPercent, setTaxPercent] = useState("0");
  const [stock, setStock] = useState("0");
  const [minStock, setMinStock] = useState("0");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await getProduct(id as string);

        console.log("product details", product);

        setName(product.name);
        setDescription(product.description || "");
        setCategory(product.category);
        setBuyPrice(product.buyPrice.toString());
        setPrice(product.price.toString());
        setUnit(product.unit);
        setTaxPercent(product.taxPercent.toString());
        setStock(product.stock.toString());
        setMinStock(product.minStock.toString());
        setImages(product.images || []);
      } catch (error) {
        toast.error("Failed to fetch product details");
      }
    };

    fetchProduct();
  }, [id]);

  const calculateProfit = () => {
    const buyPriceNum = parseFloat(buyPrice) || 0;
    const sellPriceNum = parseFloat(price) || 0;
    if (buyPriceNum === 0) return { profit: 0, margin: 0 };

    const profit = sellPriceNum - buyPriceNum;
    const margin = (profit / buyPriceNum) * 100;
    return { profit, margin };
  };

  const { profit, margin } = calculateProfit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProduct(id as string, {
        name,
        description,
        category,
        buyPrice: parseFloat(buyPrice),
        price: parseFloat(price),
        unit,
        taxPercent: parseFloat(taxPercent),
        stock: parseInt(stock),
        minStock: parseInt(minStock),
        images: images.filter(Boolean), // Remove empty strings
      });
      toast.success("Product updated successfully");
      router.push("/dashboard/products");
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct(id as string);
      toast.success("Product deleted successfully");
      router.push("/dashboard/products");
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setIsDrawerOpen(false);
    }
  };

  const addImage = () => {
    setImages([...images, ""]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <h1 className="text-2xl font-bold my-4">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buyPrice">Buy Price</Label>
            <Input
              id="buyPrice"
              type="number"
              step="0.01"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Selling Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        </div>
        {parseFloat(buyPrice) > 0 && parseFloat(price) > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Profit Analysis</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Profit per unit:</span>
                <span className="ml-2 font-medium text-green-600">
                  ₹{profit.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Profit margin:</span>
                <span className="ml-2 font-medium text-green-600">
                  {margin.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="stock">Current Stock</Label>
          <Input
            id="stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="minStock">Minimum Stock Level</Label>
          <Input
            id="minStock"
            type="number"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="taxPercent">Tax Percentage (GST)</Label>
          <Input
            id="taxPercent"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Product Images (Optional)</Label>
          <ImageList
            images={images}
            onAdd={addImage}
            onRemove={removeImage}
            onUpdate={updateImage}
          />
        </div>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard/products")}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
      <div className="mt-8">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button type="button" variant="destructive">
              Delete Product
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                Are you sure you want to delete this product?
              </DrawerTitle>
              <DrawerDescription>
                This action cannot be undone. This will permanently delete the
                product and remove its data from our servers.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Product"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
