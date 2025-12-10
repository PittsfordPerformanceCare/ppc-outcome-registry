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
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

export function QuickLinksSection() {
  const links = [
    {
      title: "View All Leads",
      icon: Users,
      href: "/admin/leads",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "View Registry",
      icon: UserCheck,
      href: "/admin-shell/registry",
      color: "text-green-600",
      bgColor: "bg-green-500/10"
    },
    {
      title: "View Episodes",
      icon: Activity,
      href: "/admin-shell/episodes",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "View Tasks",
      icon: CheckSquare,
      href: "/admin-shell/tasks",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Provider Tools",
      icon: Stethoscope,
      href: "/admin-shell/provider-tools",
      color: "text-red-600",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/lead-analytics",
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10"
    },
    {
      title: "Communications",
      icon: Mail,
      href: "/admin-shell/communications",
      color: "text-cyan-600",
      bgColor: "bg-cyan-500/10"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/clinic-settings",
      color: "text-gray-600",
      bgColor: "bg-gray-500/10"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.href}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-2 justify-center"
                asChild
              >
                <Link to={link.href}>
                  <div className={`p-2 ${link.bgColor} rounded-lg`}>
                    <Icon className={`h-4 w-4 ${link.color}`} />
                  </div>
                  <span className="text-xs font-medium">{link.title}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
