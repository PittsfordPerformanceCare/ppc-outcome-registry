import { Link, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, BarChart3, Settings, FileText, Activity } from "lucide-react";

const navItems = [
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/lead-analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/patients", label: "Patients", icon: FileText, disabled: true },
  { href: "/admin/episodes", label: "Episodes", icon: Activity, disabled: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, disabled: true },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Manage leads & analytics</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.disabled && (
                  <span className="ml-auto text-xs opacity-60">Soon</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
