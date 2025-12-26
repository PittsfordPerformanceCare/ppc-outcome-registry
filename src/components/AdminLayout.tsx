import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, BarChart3, Settings, FileText, Activity, AlertTriangle, ClipboardList, Link2, Flag, Home, TrendingUp, Calendar, Sun, ExternalLink, LogOut, Stethoscope, Route, ChevronRight } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { TeamChatPanel } from "@/components/TeamChatPanel";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/my-day", label: "My Day", icon: Sun },
  { href: "/admin/clinical", label: "Clinical Dashboard", icon: Stethoscope },
  { href: "/admin/prospect-journey", label: "Prospect Journey", icon: Route },
  { href: "/admin/clinician", label: "My Schedule", icon: Calendar },
  { href: "/admin/director", label: "Director View", icon: TrendingUp },
  { href: "/admin/clinician-queues", label: "Clinician Queues", icon: ClipboardList },
  { href: "/admin/weekly-cleanup", label: "Weekly Cleanup", icon: ClipboardList },
  { href: "/admin/special-situations", label: "Special Situations", icon: Flag },
  { href: "/admin/utm-health", label: "UTM Health", icon: Link2 },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/lead-analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/episode-integrity", label: "Data Integrity", icon: AlertTriangle },
  { href: "/admin-shell/patients", label: "Patients", icon: FileText },
  { href: "/admin-shell/episodes", label: "Episodes", icon: Activity },
  { href: "/clinic-settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/auth");
  };

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/dashboard";
    }
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30 p-4 hidden md:flex md:flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <p className="text-sm text-muted-foreground">Manage leads & analytics</p>
            </div>
            <div className="flex items-center gap-1">
              <TeamChatPanel />
              <NotificationBell />
            </div>
          </div>
          
          {/* Quick link to public site */}
          <Link
            to="/site"
            className="mb-4 flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View Public Site
          </Link>
          
          <nav className="space-y-0.5 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Tooltip key={item.href} delayDuration={500}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground/30 rounded-r-full" />
                      )}
                      
                      <Icon className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        isActive && "scale-110",
                        !isActive && "group-hover:scale-105"
                      )} />
                      
                      <span className="truncate">{item.label}</span>
                      
                      {/* Hover chevron indicator */}
                      <ChevronRight className={cn(
                        "h-3.5 w-3.5 ml-auto opacity-0 -translate-x-2 transition-all duration-200",
                        "group-hover:opacity-100 group-hover:translate-x-0",
                        isActive && "opacity-60 translate-x-0"
                      )} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
          
          {/* Logout button at bottom */}
          <div className="mt-auto pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}
