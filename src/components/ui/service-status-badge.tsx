import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Pause } from "lucide-react";

interface ServiceStatusBadgeProps {
  active: boolean;
  className?: string;
}

export function ServiceStatusBadge({ active, className }: ServiceStatusBadgeProps) {
  return (
    <Badge
      variant={active ? "default" : "secondary"}
      className={`flex items-center gap-1 whitespace-nowrap shrink-0 text-xs ${className}`}
    >
      {active ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          Aktiv
        </>
      ) : (
        <>
          <Pause className="h-3 w-3" />
          Inaktiv
        </>
      )}
    </Badge>
  );
}