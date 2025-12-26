import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href?: string;
  label?: string;
  onClick?: () => void;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function BackButton({
  href,
  label = "Back",
  onClick,
  variant = "ghost",
  size = "default",
  showLabel = true,
  className,
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    } else {
      navigate(-1);
    }
  };

  if (size === "icon" || !showLabel) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        className={cn("shrink-0", className)}
        aria-label={label}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn("gap-2", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}
