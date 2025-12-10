import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  Activity, 
  CheckSquare, 
  Stethoscope, 
  BarChart3,
  Mail,
  Settings,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

export function QuickLinksSection() {
  const links = [
    {
      title: "All Leads",
      icon: Users,
      href: "/admin/leads",
      gradient: "from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-600"
    },
    {
      title: "Registry",
      icon: UserCheck,
      href: "/admin-shell/registry",
      gradient: "from-emerald-500/10 to-emerald-500/5",
      iconColor: "text-emerald-600"
    },
    {
      title: "Episodes",
      icon: Activity,
      href: "/admin-shell/episodes",
      gradient: "from-purple-500/10 to-purple-500/5",
      iconColor: "text-purple-600"
    },
    {
      title: "Tasks",
      icon: CheckSquare,
      href: "/admin-shell/tasks",
      gradient: "from-amber-500/10 to-amber-500/5",
      iconColor: "text-amber-600"
    },
    {
      title: "Provider Tools",
      icon: Stethoscope,
      href: "/admin-shell/provider-tools",
      gradient: "from-rose-500/10 to-rose-500/5",
      iconColor: "text-rose-600"
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/lead-analytics",
      gradient: "from-indigo-500/10 to-indigo-500/5",
      iconColor: "text-indigo-600"
    },
    {
      title: "Communications",
      icon: Mail,
      href: "/admin-shell/communications",
      gradient: "from-cyan-500/10 to-cyan-500/5",
      iconColor: "text-cyan-600"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/clinic-settings",
      gradient: "from-slate-500/10 to-slate-500/5",
      iconColor: "text-slate-600"
    }
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base font-medium">Quick Links</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.href}
                variant="outline"
                className={`relative h-auto py-4 flex flex-col items-center gap-2.5 justify-center overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300`}
                asChild
              >
                <Link to={link.href}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-50`} />
                  <div className="relative p-2 bg-background/80 rounded-xl shadow-sm">
                    <Icon className={`h-5 w-5 ${link.iconColor}`} />
                  </div>
                  <span className="relative text-xs font-medium">{link.title}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
