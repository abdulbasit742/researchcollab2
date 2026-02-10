import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Data Analysis",
  "Writing",
  "Programming",
  "Design",
  "Research",
  "Translation",
  "Marketing",
  "Tutoring",
  "Video Editing",
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat}
            variant={selected === cat ? "default" : "outline"}
            className={cn(
              "cursor-pointer whitespace-nowrap px-3 py-1.5 text-sm transition-colors hover:bg-primary/10",
              selected === cat && "hover:bg-primary/90"
            )}
            onClick={() => onSelect(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
