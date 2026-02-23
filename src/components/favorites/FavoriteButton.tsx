import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FavoriteButtonProps {
  label?: string;
  className?: string;
}

export function FavoriteButton({ label, className }: FavoriteButtonProps) {
  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const path = location.pathname;
  const pageLabel = label || path.split("/").filter(Boolean).pop() || "Page";
  const favorited = isFavorite(path);

  const handleClick = () => {
    toggleFavorite(path, pageLabel);
    toast.success(favorited ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn("h-8 w-8", className)}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={cn(
          "h-4 w-4 transition-colors",
          favorited ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
        )}
      />
    </Button>
  );
}
