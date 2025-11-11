import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Shield, ShieldOff, Trash2, UserPlus } from "lucide-react";
import { PatientInvitationDialog } from "./PatientInvitationDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";

interface PatientAccess {
  id: string;
  patient_id: string;
  invitation_code: string | null;
  is_active: boolean;
  granted_at: string;
  patient_accounts: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface PatientAccessManagerProps {
  episodeId: string;
  patientName: string;
  patientEmail?: string;
}

export function PatientAccessManager({ episodeId, patientName, patientEmail }: PatientAccessManagerProps) {
  const [accessList, setAccessList] = useState<PatientAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<PatientAccess | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPatientAccess();
  }, [episodeId]);

  const loadPatientAccess = async () => {
    try {
      const { data, error } = await supabase
        .from("patient_episode_access")
        .select(`
          *,
          patient_accounts (
            full_name,
            email,
            phone
          )
        `)
        .eq("episode_id", episodeId)
        .order("granted_at", { ascending: false });

      if (error) throw error;
      setAccessList(data || []);
    } catch (error: any) {
      console.error("Error loading patient access:", error);
      toast({
        title: "Failed to Load Access List",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!selectedAccess) return;

    try {
      const { error } = await supabase
        .from("patient_episode_access")
        .update({ is_active: false })
        .eq("id", selectedAccess.id);

      if (error) throw error;

      toast({
        title: "Access Revoked",
        description: `${selectedAccess.patient_accounts.full_name}'s access has been revoked.`,
      });

      loadPatientAccess();
    } catch (error: any) {
      console.error("Error revoking access:", error);
      toast({
        title: "Failed to Revoke Access",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRevokeDialogOpen(false);
      setSelectedAccess(null);
    }
  };

  const handleRestoreAccess = async (access: PatientAccess) => {
    try {
      const { error } = await supabase
        .from("patient_episode_access")
        .update({ is_active: true })
        .eq("id", access.id);

      if (error) throw error;

      toast({
        title: "Access Restored",
        description: `${access.patient_accounts.full_name}'s access has been restored.`,
      });

      loadPatientAccess();
    } catch (error: any) {
      console.error("Error restoring access:", error);
      toast({
        title: "Failed to Restore Access",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleResendInvitation = (access: PatientAccess) => {
    // Open invitation dialog with pre-filled data
    setInviteDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Portal Access</CardTitle>
              <CardDescription>
                Manage patient access to this episode through the patient portal
              </CardDescription>
            </div>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accessList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No patient access granted yet</p>
              <p className="text-sm mt-1">Send an invitation to allow the patient to view their records</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accessList.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{access.patient_accounts.full_name}</p>
                      <Badge variant={access.is_active ? "default" : "secondary"}>
                        {access.is_active ? "Active" : "Revoked"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{access.patient_accounts.email}</p>
                    {access.invitation_code && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Code: <span className="font-mono font-semibold">{access.invitation_code}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Granted {formatDistanceToNow(new Date(access.granted_at), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvitation(access)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    
                    {access.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAccess(access);
                          setRevokeDialogOpen(true);
                        }}
                      >
                        <ShieldOff className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreAccess(access)}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PatientInvitationDialog
        open={inviteDialogOpen}
        onOpenChange={(open) => {
          setInviteDialogOpen(open);
          if (!open) loadPatientAccess();
        }}
        episodeId={episodeId}
        patientName={patientName}
        patientEmail={patientEmail}
      />

      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Patient Access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent {selectedAccess?.patient_accounts.full_name} from viewing this episode
              in the patient portal. You can restore access at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAccess}>
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
