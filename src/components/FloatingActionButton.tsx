import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardPlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FloatingActionButton() {
  const location = useLocation();
  
  // Hide FAB on the new-episode page itself
  if (location.pathname === "/new-episode") {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/new-episode" className="group">
            <Button
              size="lg"
              className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full p-0 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary/50 animate-fade-in bg-gradient-to-br from-primary via-primary to-primary/90 border-2 border-primary/30 hover:border-primary/60"
            >
              {/* Ripple effect on hover */}
              <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
              
              {/* Rotating ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin" style={{ animationDuration: '3s' }} />
              
              {/* Icon */}
              <ClipboardPlus className="h-7 w-7 text-primary-foreground relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              
              {/* Pulse indicator */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
              </span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-semibold">
          <p>Create New Episode</p>
          <p className="text-xs text-muted-foreground">Quick access from anywhere</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
