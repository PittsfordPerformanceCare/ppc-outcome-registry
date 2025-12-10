import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Database,
  FileText,
  Users,
  CheckSquare,
  Stethoscope,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Settings,
  ChevronRight,
  Bell,
  Brain,
  Menu,
  BarChart3,
  Flag,
  Link2,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Navigation items organized by section
const mainNavItems = [
  { 
    href: "/admin/dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard,
    description: "Overview & daily prep"
  },
];

const coreNavItems = [
  { 
    href: "/admin/registry", 
    label: "Registry", 
    icon: Database,
    description: "Outcome registry & intake review"
  },
  { 
    href: "/admin/episodes", 
    label: "Episodes", 
    icon: FileText,
    description: "Episode management"
  },
  { 
    href: "/admin/patients", 
    label: "Patients", 
    icon: Users,
    description: "Patient directory"
  },
  { 
    href: "/admin/tasks", 
    label: "Tasks", 
    icon: CheckSquare,
    description: "Worklists & follow-ups"
  },
];

const toolsNavItems = [
  { 
    href: "/admin/provider-tools", 
    label: "Provider Tools", 
    icon: Stethoscope,
    description: "Neurologic assessment tools"
  },
  { 
    href: "/admin/communications", 
    label: "Communications", 
    icon: MessageSquare,
    description: "Messaging & PCP summaries"
  },
];

const analyticsNavItems = [
  { 
    href: "/admin/analytics", 
    label: "Analytics", 
    icon: BarChart3,
    description: "Performance metrics"
  },
  { 
    href: "/admin/leads", 
    label: "Lead Management", 
    icon: Flag,
    description: "Lead tracking & funnel"
  },
  { 
    href: "/admin/utm-health", 
    label: "UTM Health", 
    icon: Link2,
    description: "Attribution monitoring"
  },
  { 
    href: "/admin/episode-integrity", 
    label: "Data Integrity", 
    icon: AlertTriangle,
    description: "Episode lifecycle checks"
  },
];

const adminNavItems = [
  { 
    href: "/admin/weekly-cleanup", 
    label: "Weekly Cleanup", 
    icon: ClipboardList,
    description: "Maintenance tasks"
  },
  { 
    href: "/admin/special-situations", 
    label: "Special Situations", 
    icon: Flag,
    description: "Exception handling"
  },
  { 
    href: "/admin/settings", 
    label: "Settings", 
    icon: Settings,
    description: "Clinic configuration"
  },
];

function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin" || location.pathname === "/admin/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const renderNavSection = (items: typeof mainNavItems, label: string) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)}>
                <Link 
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3",
                    isActive(item.href) && "bg-primary text-primary-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/admin" className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          {!collapsed && (
            <span className="font-bold text-lg">PPC Admin</span>
          )}
        </Link>
      </div>
      
      <SidebarContent className="py-2">
        {renderNavSection(mainNavItems, "Overview")}
        {renderNavSection(coreNavItems, "Clinical")}
        {renderNavSection(toolsNavItems, "Tools")}
        {renderNavSection(analyticsNavItems, "Analytics")}
        {renderNavSection(adminNavItems, "Administration")}
      </SidebarContent>
    </Sidebar>
  );
}

function AdminHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/staff-login");
  };

  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U";

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        <SidebarTrigger className="hidden md:flex" />
        
        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/tasks">
              <CheckSquare className="h-4 w-4 mr-1" />
              Tasks
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/registry">
              <Database className="h-4 w-4 mr-1" />
              Registry
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <ChevronRight className="h-4 w-4 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">Account</span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email || "Not signed in"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/site/hub">
                <Brain className="mr-2 h-4 w-4" />
                View Public Site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

const ShellAdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ShellAdminLayout;
