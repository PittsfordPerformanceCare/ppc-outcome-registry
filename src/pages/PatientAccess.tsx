import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientAccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your access...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No access token provided. Please use the link from your email.");
      return;
    }

    handleMagicLink();
  }, [token]);

  const handleMagicLink = async () => {
    try {
      setStatus("loading");
      setMessage("Verifying your secure access link...");

      // Find the episode access by magic token
      const { data: accessRecord, error: findError } = await supabase
        .from("patient_episode_access")
        .select(`
          *,
          patient_accounts!inner(id, email, full_name),
          episodes!inner(patient_name, region)
        `)
        .eq("magic_token", token)
        .maybeSingle();

      if (findError) throw findError;

      if (!accessRecord) {
        throw new Error("Invalid or expired access link. Please request a new invitation from your clinician.");
      }

      // Check if token is expired
      if (accessRecord.token_expires_at) {
        const expiryDate = new Date(accessRecord.token_expires_at);
        if (expiryDate < new Date()) {
          throw new Error("This access link has expired. Please request a new invitation from your clinician.");
        }
      }

      setMessage("Creating your secure account...");

      const patientEmail = accessRecord.patient_accounts.email;
      const patientName = accessRecord.patient_accounts.full_name;
      
      // Generate a secure random password
      const randomPassword = crypto.randomUUID();

      // Check if auth user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: patientEmail,
        password: randomPassword,
      });

      let authUserId: string;

      if (existingUser.user) {
        authUserId = existingUser.user.id;
        setMessage("Welcome back! Signing you in...");
      } else {
        // Create new auth user
        setMessage("Setting up your account...");
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: patientEmail,
          password: randomPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/patient-dashboard`,
            data: {
              full_name: patientName,
            }
          }
        });

        if (signUpError) {
          // If user already exists but password was wrong, they need to sign in manually
          if (signUpError.message.includes("already registered")) {
            throw new Error("An account with this email already exists. Please use the sign-in page.");
          }
          throw signUpError;
        }

        if (!signUpData.user) {
          throw new Error("Failed to create account.");
        }

        authUserId = signUpData.user.id;
      }

      setMessage("Granting episode access...");

      // Update patient_episode_access to link to auth user and mark token as used
      const { error: updateError } = await supabase
        .from("patient_episode_access")
        .update({
          patient_id: authUserId,
          code_used_at: new Date().toISOString(),
          magic_token: null, // Invalidate the token after use
        })
        .eq("id", accessRecord.id);

      if (updateError) throw updateError;

      // Update patient_accounts to link to auth user
      const { error: accountUpdateError } = await supabase
        .from("patient_accounts")
        .update({
          id: authUserId,
        })
        .eq("id", accessRecord.patient_accounts.id);

      if (accountUpdateError) {
        console.error("Warning: Could not update patient account:", accountUpdateError);
        // Non-fatal, continue
      }

      setStatus("success");
      setMessage("Success! Redirecting to your dashboard...");

      // Wait a moment for the success message to be visible
      setTimeout(() => {
        navigate("/patient-dashboard");
      }, 1500);

    } catch (error: any) {
      console.error("Magic link error:", error);
      setStatus("error");
      setMessage(error.message || "Failed to process access link. Please try again or contact your clinician.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          {status === "loading" && (
            <>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Magic Link</h2>
                <p className="text-muted-foreground">{message}</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-600">Welcome!</h2>
                <p className="text-muted-foreground">{message}</p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-destructive">Access Error</h2>
                <p className="text-muted-foreground">{message}</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => navigate("/patient-auth")} 
                    className="w-full"
                  >
                    Go to Sign In Page
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}