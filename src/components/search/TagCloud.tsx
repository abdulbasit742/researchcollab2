import { usePopularTags } from "@/hooks/useTagIndex";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface TagCloudProps {
  onTagClick?: (tag: string) => void;
}

export function TagCloud({ onTagClick }: TagCloudProps) {
  const { data: tags = [], isLoading } = usePopularTags(30);

  if (isLoading || tags.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Popular Tags</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <Badge
            key={t.name}
            variant="secondary"
            className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-xs"
            onClick={() => onTagClick?.(t.name)}
          >
            {t.name}
            <span className="ml-1 text-muted-foreground">{t.count}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
