import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Phone, UserPlus, Activity } from "lucide-react";
import { InboxCounts } from "@/hooks/useDashboardData";

interface InboxCardsProps {
  inboxCounts: InboxCounts;
}

export function InboxCards({ inboxCounts }: InboxCardsProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Clinician Inbox Card */}
      <Card 
        className="relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-primary/5 to-background"
        onClick={() => navigate("/clinician-inbox")}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/30 to-transparent rounded-bl-full" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Clinician Inbox</CardTitle>
                <CardDescription>Patient messages and callback requests</CardDescription>
              </div>
            </div>
            <Button 
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/clinician-inbox");
              }}
            >
              View Inbox
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {inboxCounts.unreadMessages}
                </p>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Phone className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {inboxCounts.pendingCallbacks}
                </p>
                <p className="text-sm text-muted-foreground">Pending Callbacks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Inquiry Inbox Card */}
      <Card 
        className="relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-green-500/20 hover:border-green-500/40 bg-gradient-to-br from-green-500/5 to-background"
        onClick={() => navigate("/referral-inbox")}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-2xl">Lead Generation Inbox</CardTitle>
                <CardDescription>Prospective patients from QR code & Pillar app leads</CardDescription>
              </div>
            </div>
            <Button 
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-green-500 hover:bg-green-600"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/referral-inbox");
              }}
            >
              Review Inquiries
              <UserPlus className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {inboxCounts.pendingReferralInquiries}
                </p>
                <p className="text-sm text-muted-foreground">QR Screening Inquiries</p>
              </div>
            </div>
            <Link 
              to="/neurologic-leads" 
              className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-accent/50 hover:border-purple-500/50 transition-colors cursor-pointer"
            >
              <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {inboxCounts.pendingNeurologicLeads}
                </p>
                <p className="text-sm text-muted-foreground">Pillar App Leads →</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}