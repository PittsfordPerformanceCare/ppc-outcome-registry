import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FlaskConical, 
  X, 
  UserCircle, 
  Stethoscope, 
  UserPlus, 
  LayoutDashboard,
  ClipboardList,
  Users,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export const DevToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const testScenarios = [
    {
      category: "Patient Flows",
      items: [
        { label: "Referral Landing (DEMO2025)", path: "/referral/DEMO2025", icon: UserPlus },
        { label: "Patient Login", path: "/patient-auth", icon: UserCircle },
        { label: "Patient Dashboard", path: "/patient-dashboard", icon: LayoutDashboard },
        { label: "Patient Intake Form", path: "/patient-intake", icon: ClipboardList },
        { label: "Intake Start", path: "/intake-start", icon: ClipboardList },
      ]
    },
    {
      category: "Clinician Flows",
      items: [
        { label: "Clinician Login", path: "/auth", icon: Stethoscope },
        { label: "Clinician Dashboard", path: "/", icon: LayoutDashboard },
        { label: "New Episode", path: "/new-episode", icon: ClipboardList },
        { label: "Clinician Inbox", path: "/clinician-inbox", icon: ClipboardList },
      ]
    },
    {
      category: "Admin Flows",
      items: [
        { label: "Admin Management", path: "/admin", icon: Users },
        { label: "Clinic Settings", path: "/settings", icon: LayoutDashboard },
        { label: "Analytics Dashboard", path: "/analytics-dashboard", icon: LayoutDashboard },
      ]
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg transition-all",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isOpen && "rotate-180"
        )}
        aria-label="Toggle dev toolbar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <FlaskConical className="h-5 w-5" />}
      </Button>

      {/* Toolbar Panel */}
      {isOpen && (
        <Card className={cn(
          "fixed bottom-20 right-4 z-50 w-80 shadow-xl",
          "bg-card border-border"
        )}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Dev Testing Toolbar</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Quick navigation for testing
            </p>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-4">
              {testScenarios.map((category) => (
                <div key={category.category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    {category.category}
                  </h4>
                  <div className="space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <Button
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-2 h-auto py-2",
                            isActive && "bg-secondary"
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm flex-1 text-left">{item.label}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Test Credentials:</strong><br />
                  Patient: patient@example.com<br />
                  Referral Code: DEMO2025
                </p>
              </div>
            </div>
          </ScrollArea>
        </Card>
      )}
    </>
  );
};
