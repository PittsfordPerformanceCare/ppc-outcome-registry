import { Inbox, Search, FileX, WifiOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateType = "empty" | "search" | "error" | "offline" | "no-access";

interface EmptyStateProps {
  /** Type of empty state */
  type?: EmptyStateType;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Action button text */
  actionText?: string;
  /** Action callback */
  onAction?: () => void;
  /** Secondary action text */
  secondaryActionText?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** Custom className */
  className?: string;
}

const defaultContent: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
  empty: {
    icon: <Inbox className="h-12 w-12" />,
    title: "No data yet",
    description: "Get started by adding your first item.",
  },
  search: {
    icon: <Search className="h-12 w-12" />,
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
  error: {
    icon: <FileX className="h-12 w-12" />,
    title: "Failed to load",
    description: "Something went wrong. Please try again.",
  },
  offline: {
    icon: <WifiOff className="h-12 w-12" />,
    title: "You're offline",
    description: "Check your internet connection and try again.",
  },
  "no-access": {
    icon: <AlertCircle className="h-12 w-12" />,
    title: "Access denied",
    description: "You don't have permission to view this content.",
  },
};

export function EmptyState({
  type = "empty",
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  const defaults = defaultContent[type];

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
      <div className="mb-4 text-muted-foreground/50">
        {icon || defaults.icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title || defaults.title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        {description || defaults.description}
      </p>
      {(onAction || onSecondaryAction) && (
        <div className="flex gap-3">
          {onSecondaryAction && secondaryActionText && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
          {onAction && actionText && (
            <Button onClick={onAction}>{actionText}</Button>
          )}
        </div>
      )}
    </div>
  );
}
