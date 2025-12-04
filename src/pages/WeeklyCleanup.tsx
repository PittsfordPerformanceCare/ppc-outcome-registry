import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useWeeklyCleanup } from "@/hooks/useWeeklyCleanup";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  ClipboardList,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

const sectionIcons: Record<string, React.ElementType> = {
  "Incomplete Intakes": Clock,
  "Unassigned Leads (No Episode Created)": Users,
  "PCP Summaries Pending": FileText,
  "Episodes Ready to Close": Activity,
  "Episode Type Mismatches": AlertCircle,
  "Episode Lifecycle Issues": AlertTriangle,
};

const sectionColors: Record<string, string> = {
  "Incomplete Intakes": "text-amber-500",
  "Unassigned Leads (No Episode Created)": "text-blue-500",
  "PCP Summaries Pending": "text-purple-500",
  "Episodes Ready to Close": "text-orange-500",
  "Episode Type Mismatches": "text-red-500",
  "Episode Lifecycle Issues": "text-rose-500",
};

export default function WeeklyCleanup() {
  const { data, isLoading, error, refetch } = useWeeklyCleanup();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("send-weekly-cleanup");
      
      if (error) throw error;
      
      if (result.emailSent) {
        toast({
          title: "Email Sent",
          description: "Weekly cleanup checklist has been emailed to administrators.",
        });
      } else {
        toast({
          title: "Checklist Generated",
          description: "Checklist generated but no email was sent (check admin emails or Resend configuration).",
          variant: "default",
        });
      }
      refetch();
    } catch (err) {
      console.error("Error sending cleanup email:", err);
      toast({
        title: "Error",
        description: "Failed to send cleanup email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load cleanup data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Weekly Clean-Up Checklist
          </h1>
          <p className="text-muted-foreground">
            End-of-week items needing attention before the weekend
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleSendEmail} disabled={sending || isLoading}>
            <Mail className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send Email Now"}
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : data?.totalItems === 0 ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                All Clear!
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500" />
                {data?.totalItems} Items Need Attention
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              `Generated ${data?.generatedAt ? format(new Date(data.generatedAt), "EEEE, MMMM d, yyyy 'at' h:mm a") : "just now"}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.totalItems === 0 ? (
            <p className="text-green-600">
              No cleanup items found. The registry is in good shape!
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data?.sections.map((section) => {
                const Icon = sectionIcons[section.title] || AlertCircle;
                const colorClass = sectionColors[section.title] || "text-muted-foreground";
                return (
                  <div
                    key={section.title}
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                  >
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                    <span className="text-sm font-medium truncate">{section.title}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {section.count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sections */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        data?.sections.map((section) => {
          const Icon = sectionIcons[section.title] || AlertCircle;
          const colorClass = sectionColors[section.title] || "text-muted-foreground";
          const isOpen = openSections[section.title] ?? true;

          return (
            <Card key={section.title}>
              <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.title)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className={`h-5 w-5 ${colorClass}`} />
                      {section.title}
                      <Badge variant="outline" className="ml-2">
                        {section.count}
                      </Badge>
                      <span className="ml-auto">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <Link
                          key={item.id}
                          to={item.link}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {item.details}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                        </Link>
                      ))}
                      {section.count > section.items.length && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          + {section.count - section.items.length} more items
                        </p>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })
      )}
    </div>
  );
}
