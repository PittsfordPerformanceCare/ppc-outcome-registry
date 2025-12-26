import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBreadcrumb, BreadcrumbItem } from "./PageBreadcrumb";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  backHref,
  backLabel = "Back",
  onBack,
  actions,
  className,
  children,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      navigate(backHref);
    } else {
      navigate(-1);
    }
  };

  const showBack = backHref || onBack;

  return (
    <div className={cn("space-y-4 mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <PageBreadcrumb items={breadcrumbs} />
      )}

      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Back Button */}
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10 shrink-0 -ml-2"
              aria-label={backLabel}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Icon */}
          {Icon && !showBack && (
            <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>

      {/* Optional children content below header */}
      {children}
    </div>
  );
}
