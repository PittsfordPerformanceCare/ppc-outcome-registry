import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
}

export function PageBreadcrumb({ items, className, showHomeIcon = true }: PageBreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {showHomeIcon && items.length > 0 && items[0].href && (
          <>
            <li>
              <Link 
                to="/" 
                className="flex items-center hover:text-foreground transition-colors p-1 -ml-1 rounded-sm hover:bg-accent"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            </li>
          </>
        )}
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;
          
          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1.5 hover:text-foreground transition-colors",
                    "px-1.5 py-0.5 -mx-1.5 rounded-sm hover:bg-accent"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    "flex items-center gap-1.5",
                    isLast ? "font-medium text-foreground" : ""
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  <span className="max-w-[200px] truncate">{item.label}</span>
                </span>
              )}
              
              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
