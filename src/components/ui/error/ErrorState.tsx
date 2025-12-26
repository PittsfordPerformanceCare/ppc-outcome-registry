import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry callback */
  onRetry?: () => void;
  /** Show back button */
  showBack?: boolean;
  /** Back callback */
  onBack?: () => void;
  /** Variant style */
  variant?: "card" | "inline" | "minimal";
  /** Custom className */
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load the data. Please try again.",
  showRetry = true,
  onRetry,
  showBack = false,
  onBack,
  variant = "card",
  className,
}: ErrorStateProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2 text-destructive", className)}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{description}</span>
        {showRetry && onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-auto p-1">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {showRetry && onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("max-w-md mx-auto", className)}>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
      {(showRetry || showBack) && (
        <CardFooter className="flex gap-3 justify-center">
          {showBack && onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
          {showRetry && onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
