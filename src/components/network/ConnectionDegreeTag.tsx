import { Badge } from "@/components/ui/badge";
import { useConnectionDegree } from "@/hooks/useNetwork";

interface ConnectionDegreeTagProps {
  userId: string;
  showZero?: boolean;
}

export function ConnectionDegreeTag({ userId, showZero = false }: ConnectionDegreeTagProps) {
  const { data: degree, isLoading } = useConnectionDegree(userId);
  
  if (isLoading) return null;
  if (!degree && !showZero) return null;
  
  const getLabel = () => {
    switch (degree) {
      case 1: return "1st";
      case 2: return "2nd";
      case 3: return "3rd";
      default: return null;
    }
  };
  
  const label = getLabel();
  if (!label) return null;
  
  return (
    <Badge variant="outline" className="text-xs font-medium">
      {label}
    </Badge>
  );
}
