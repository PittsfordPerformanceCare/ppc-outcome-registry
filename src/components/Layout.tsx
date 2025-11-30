import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, ClipboardList, FileText, Home, LogOut, User, Shield, BarChart3, FileCheck, Moon, Sun, Settings, Inbox, ClipboardCheck, Bell, TrendingUp, Link2, AlertTriangle, History, Menu, MessageSquare, BookOpen, Database, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useUserRole } from "@/hooks/useUserRole";
import { SessionTimeoutWarning } from "./SessionTimeoutWarning";
import { IntakeNotificationsPanel } from "./IntakeNotificationsPanel";
import { FloatingActionButton } from "./FloatingActionButton";
import { BottomTabNavigation } from "./BottomTabNavigation";
import { PageTransition } from "./PageTransition";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { showWarning, extendSession } = useSessionTimeout();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { isAdmin } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryNav = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Create New Patient", href: "/patient-intake", icon: ClipboardList },
  ];

  const episodesNav = [
    { name: "New Episode", href: "/new-episode", icon: ClipboardList },
    { name: "Discharge", href: "/discharge", icon: LogOut },
    { name: "Follow-up", href: "/follow-up", icon: Activity },
    { name: "Ortho Partners", href: "/ortho-partners", icon: UserPlus },
    { name: "Return to PPC", href: "/ortho-return-dashboard", icon: Activity },
  ];

  const intakeNav = [
    { name: "Review Forms", href: "/intake-review", icon: Inbox },
    { name: "Validation", href: "/intake-validation", icon: ClipboardCheck },
  ];

  const analyticsNav = [
    { name: "Metrics Dashboard", href: "/analytics-dashboard", icon: BarChart3 },
    { name: "Dashboards", href: "/dashboards", icon: BarChart3 },
    { name: "Notifications", href: "/notification-history", icon: Bell },
    { name: "Analytics", href: "/notification-analytics", icon: TrendingUp },
    { name: "Referral Analytics", href: "/referral-analytics", icon: TrendingUp },
    { name: "Link Analytics", href: "/link-analytics", icon: Link2 },
    { name: "Alert History", href: "/alert-history", icon: AlertTriangle },
    { name: "Export History", href: "/export-history", icon: History },
    { name: "Automation Status", href: "/automation-status", icon: Activity },
    { name: "Clinician Inbox", href: "/clinician-inbox", icon: MessageSquare },
    { name: "Referral Inbox", href: "/referral-inbox", icon: UserPlus },
    { name: "PCP Summary", href: "/pcp-summary", icon: FileText },
  ];

  const adminNav = isAdmin ? [
    { name: "Admin", href: "/admin", icon: Shield },
    { name: "Compliance", href: "/compliance", icon: FileCheck },
    { name: "Data Governance", href: "/data-governance", icon: Database },
    { name: "Settings", href: "/clinic-settings", icon: Settings }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <SessionTimeoutWarning open={showWarning} onExtend={extendSession} />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Mobile Menu Button */}
          <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[85vh]">
              <DrawerHeader>
                <DrawerTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Navigation</span>
                </DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-8">
                {/* Primary Navigation */}
                <div className="space-y-1 mb-6">
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main</h3>
                  {primaryNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <DrawerClose key={item.name} asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </DrawerClose>
                    );
                  })}
                  <DrawerClose asChild>
                    <Link
                      to="/quick-start"
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        location.pathname === "/quick-start"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>Quick Start Guide</span>
                    </Link>
                  </DrawerClose>
                </div>

                <Separator className="my-4" />

                {/* Episodes */}
                <div className="space-y-1 mb-6">
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Episodes</h3>
                  {episodesNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <DrawerClose key={item.name} asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </DrawerClose>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                {/* Intake */}
                <div className="space-y-1 mb-6">
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Intake</h3>
                  {intakeNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <DrawerClose key={item.name} asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </DrawerClose>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                {/* Analytics */}
                <div className="space-y-1 mb-6">
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Analytics</h3>
                  {analyticsNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <DrawerClose key={item.name} asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </DrawerClose>
                    );
                  })}
                </div>

                {/* Admin */}
                {isAdmin && adminNav.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-1">
                      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Admin</h3>
                      {adminNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                          <DrawerClose key={item.name} asChild>
                            <Link
                              to={item.href}
                              className={cn(
                                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              <span>{item.name}</span>
                            </Link>
                          </DrawerClose>
                        );
                      })}
                      <DrawerClose asChild>
                        <Link
                          to="/admin-quick-start"
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            location.pathname === "/admin-quick-start"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <BookOpen className="h-5 w-5" />
                          <span>Administrator Guide</span>
                        </Link>
                      </DrawerClose>
                    </div>
                  </>
                )}
              </div>
            </DrawerContent>
          </Drawer>

          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group animate-fade-in">
            <div className="rounded-lg bg-primary/10 p-2 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 group-hover:shadow-md">
              <Activity className="h-5 w-5 text-primary transition-transform group-hover:rotate-12" />
            </div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-lg font-bold leading-none text-foreground transition-colors group-hover:text-primary">
                PPC Outcome Registry
              </h1>
              <span className="text-xs text-muted-foreground">Clinical Excellence Platform</span>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Primary Navigation */}
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium",
                    "transition-all duration-200 ease-out",
                    "hover:scale-105 active:scale-95",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Episodes Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium",
                    episodesNav.some(item => location.pathname === item.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Episodes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-background">
                {episodesNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link to={item.href} className="flex items-center space-x-2 cursor-pointer">
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Intake Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium",
                    intakeNav.some(item => location.pathname === item.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <Inbox className="h-4 w-4" />
                  <span>Intake</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-background">
                {intakeNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link to={item.href} className="flex items-center space-x-2 cursor-pointer">
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Analytics Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium",
                    analyticsNav.some(item => location.pathname === item.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-background">
                {analyticsNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link to={item.href} className="flex items-center space-x-2 cursor-pointer">
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Admin Dropdown */}
            {isAdmin && adminNav.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium",
                      adminNav.some(item => location.pathname === item.href) && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-background">
                  {adminNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link to={item.href} className="flex items-center space-x-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Intake Notifications */}
            <IntakeNotificationsPanel />
            
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full transition-all duration-300 hover:rotate-180 hover:scale-110"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="h-5 w-5 transition-transform duration-300" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-300" />
              )}
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2 rounded-full pl-2 pr-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-semibold">My Account</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/quick-start")} className="cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Quick Start Guide</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin-quick-start")} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Administrator Guide</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/30 mb-16 lg:mb-0">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground">PPC Outcome Registry</span>
                <span className="text-muted-foreground"> v1.0</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Pittsford Performance Care. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Tab Navigation - Mobile Only */}
      <BottomTabNavigation isAdmin={isAdmin} />

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
