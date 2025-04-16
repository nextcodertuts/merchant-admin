import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageListProps {
  images: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
}

export function ImageList({
  images,
  onAdd,
  onRemove,
  onUpdate,
}: ImageListProps) {
  return (
    <div className="space-y-2">
      {images.map((image, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={image}
            onChange={(e) => onUpdate(index, e.target.value)}
            placeholder="Enter image URL"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="w-full"
      >
        Add Image URL
      </Button>
    </div>
  );
}
