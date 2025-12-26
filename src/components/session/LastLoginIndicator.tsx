import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, Monitor, Smartphone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LastLoginInfo {
  lastLoginAt: string | null;
  deviceType: string;
  browser: string;
  ipAddress: string | null;
}

interface LastLoginIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function LastLoginIndicator({ className, showDetails = false }: LastLoginIndicatorProps) {
  const [lastLogin, setLastLogin] = useState<LastLoginInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastLogin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get last sign in from user metadata
          const lastSignIn = user.last_sign_in_at;
          
          // Try to get more details from user sessions if available
          const { data: sessions } = await supabase
            .from("user_sessions")
            .select("*")
            .eq("user_id", user.id)
            .order("last_active", { ascending: false })
            .limit(1);
          
          const latestSession = sessions?.[0];
          const deviceInfo = latestSession?.device_info as Record<string, string> | null;
          
          setLastLogin({
            lastLoginAt: lastSignIn || null,
            deviceType: deviceInfo?.device || "desktop",
            browser: deviceInfo?.browser || "Unknown",
            ipAddress: latestSession?.ip_address ? String(latestSession.ip_address) : null,
          });
        }
      } catch (error) {
        console.error("Error fetching last login:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastLogin();
  }, []);

  if (loading) {
    return <Skeleton className="h-4 w-32" />;
  }

  if (!lastLogin?.lastLoginAt) {
    return null;
  }

  const timeAgo = formatDistanceToNow(new Date(lastLogin.lastLoginAt), { addSuffix: true });
  const exactTime = format(new Date(lastLogin.lastLoginAt), "PPpp");
  
  const DeviceIcon = lastLogin.deviceType === "mobile" ? Smartphone : Monitor;

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-1.5 text-xs text-muted-foreground",
              className
            )}>
              <Clock className="h-3 w-3" />
              <span>Last login {timeAgo}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1.5">
              <p className="font-medium">{exactTime}</p>
              <div className="flex items-center gap-1.5 text-xs">
                <DeviceIcon className="h-3 w-3" />
                <span>{lastLogin.browser}</span>
              </div>
              {lastLogin.ipAddress && (
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3 w-3" />
                  <span>{lastLogin.ipAddress}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50",
      className
    )}>
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
        <DeviceIcon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Last login {timeAgo}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {exactTime} • {lastLogin.browser}
        </p>
      </div>
    </div>
  );
}
