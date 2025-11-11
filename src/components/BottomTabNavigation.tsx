import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Inbox, BarChart3, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Activity, LogOut, Shield, FileCheck, Settings, Bell, TrendingUp, Link2, AlertTriangle, History, MessageSquare, FileText, ClipboardCheck } from "lucide-react";

interface BottomTabNavigationProps {
  isAdmin: boolean;
}

export function BottomTabNavigation({ isAdmin }: BottomTabNavigationProps) {
  const location = useLocation();

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Episodes", href: "/new-episode", icon: ClipboardList },
    { name: "Intake", href: "/intake-review", icon: Inbox },
    { name: "Analytics", href: "/dashboards", icon: BarChart3 },
  ];

  const episodesNav = [
    { name: "New Episode", href: "/new-episode", icon: ClipboardList },
    { name: "Discharge", href: "/discharge", icon: LogOut },
    { name: "Follow-up", href: "/follow-up", icon: Activity },
  ];

  const intakeNav = [
    { name: "Review Forms", href: "/intake-review", icon: Inbox },
    { name: "Validation", href: "/intake-validation", icon: ClipboardCheck },
  ];

  const analyticsNav = [
    { name: "Dashboards", href: "/dashboards", icon: BarChart3 },
    { name: "Notifications", href: "/notification-history", icon: Bell },
    { name: "Analytics", href: "/notification-analytics", icon: TrendingUp },
    { name: "Referral Analytics", href: "/referral-analytics", icon: TrendingUp },
    { name: "Link Analytics", href: "/link-analytics", icon: Link2 },
    { name: "Alert History", href: "/alert-history", icon: AlertTriangle },
    { name: "Export History", href: "/export-history", icon: History },
    { name: "Automation Status", href: "/automation-status", icon: Activity },
    { name: "Clinician Inbox", href: "/clinician-inbox", icon: MessageSquare },
    { name: "PCP Summary", href: "/pcp-summary", icon: FileText },
  ];

  const adminNav = isAdmin ? [
    { name: "Admin", href: "/admin", icon: Shield },
    { name: "Compliance", href: "/compliance", icon: FileCheck },
    { name: "Settings", href: "/clinic-settings", icon: Settings }
  ] : [];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const isInSection = (sectionPaths: string[]) => {
    return sectionPaths.some(path => location.pathname.startsWith(path));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 rounded-lg transition-colors",
                "active:scale-95 transition-transform",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", active && "fill-primary/10")} strokeWidth={active ? 2.5 : 2} />
              <span className={cn("text-xs font-medium", active && "font-semibold")}>
                {tab.name}
              </span>
            </Link>
          );
        })}

        {/* More Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 rounded-lg transition-colors",
                "active:scale-95 transition-transform text-muted-foreground hover:text-foreground"
              )}
            >
              <MoreHorizontal className="h-6 w-6" strokeWidth={2} />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>More Options</span>
              </SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Episodes Section */}
              <div className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Episodes
                </h3>
                <div className="space-y-1">
                  {episodesNav.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Intake Section */}
              <div className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Intake Management
                </h3>
                <div className="space-y-1">
                  {intakeNav.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Analytics Section */}
              <div className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reports & Analytics
                </h3>
                <div className="space-y-1">
                  {analyticsNav.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Admin Section */}
              {isAdmin && adminNav.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Administration
                    </h3>
                    <div className="space-y-1">
                      {adminNav.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                              "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground hover:bg-accent"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
