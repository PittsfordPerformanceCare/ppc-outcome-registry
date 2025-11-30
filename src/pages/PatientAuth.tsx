import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Activity } from "lucide-react";
import { z } from "zod";
import { PatientPWAInstallPrompt } from "@/components/PatientPWAInstallPrompt";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const codeSchema = z.string().length(8, "Access code must be 8 characters");

export default function PatientAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code");
  
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessCode, setAccessCode] = useState(codeFromUrl || "");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/patient-dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (fullName.trim().length < 2) {
        throw new Error("Please enter your full name");
      }
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/patient-dashboard`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create or update patient account
        const { error: accountError } = await supabase
          .from("patient_accounts")
          .upsert({
            id: authData.user.id,
            email,
            full_name: fullName,
          }, {
            onConflict: "email"
          });

        if (accountError) {
          console.error("Error creating patient account:", accountError);
          toast({
            title: "Account Setup Issue",
            description: "Your account was created but there was an issue linking it. Please contact support.",
            variant: "destructive",
          });
        }

        // If access code is present and user is immediately authenticated, auto-claim it
        if (accessCode && accessCode.length === 8 && authData.session) {
          await claimAccessWithCode(accessCode);
        } else if (authData.session) {
          // User is immediately signed in, redirect to patient dashboard
          toast({
            title: "Account Created!",
            description: "Welcome to your Patient Hub!",
          });
          navigate("/patient-dashboard");
        } else {
          toast({
            title: "Account Created!",
            description: accessCode ? "Please sign in to claim your episode access." : "You can now sign in to access your records.",
          });

          setIsSignUp(false);
        }
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // If access code is present, auto-claim it
      if (accessCode && accessCode.length === 8) {
        await claimAccessWithCode(accessCode);
      } else {
        toast({
          title: "Welcome back!",
          description: "Redirecting to your dashboard...",
        });

        // Check if first time user
        const hasSeenWelcome = localStorage.getItem("ppc_patient_welcome_seen");
        if (!hasSeenWelcome) {
          navigate("/patient-welcome");
        } else {
          navigate("/patient-dashboard");
        }
      }
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const claimAccessWithCode = async (code: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Find the access record with this invitation code
      const { data: accessRecord, error: findError } = await supabase
        .from("patient_episode_access")
        .select("*, patient_accounts!inner(email)")
        .eq("invitation_code", code.toUpperCase())
        .maybeSingle();

      if (findError) throw findError;

      if (!accessRecord) {
        throw new Error("Invalid access code. Please check and try again.");
      }

      if (accessRecord.code_used_at) {
        throw new Error("This access code has already been used.");
      }

      // Verify the patient account email matches the logged-in user
      const patientEmail = accessRecord.patient_accounts.email;
      if (patientEmail !== session.user.email) {
        throw new Error(`This code was issued for ${patientEmail}. Please sign in with that email.`);
      }

      // Update patient_id to current auth user and mark code as used
      const { error: updateError } = await supabase
        .from("patient_episode_access")
        .update({
          patient_id: session.user.id,
          code_used_at: new Date().toISOString(),
        })
        .eq("id", accessRecord.id);

      if (updateError) throw updateError;

      toast({
        title: "Access Granted!",
        description: "Welcome! Redirecting to your dashboard...",
      });

      navigate("/patient-dashboard");
    } catch (error: any) {
      toast({
        title: "Failed to Claim Access",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleClaimAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      codeSchema.parse(accessCode);
    } catch (error: any) {
      toast({
        title: "Invalid Code",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Please Sign In First",
          description: "You need to sign in before claiming access to episodes.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await claimAccessWithCode(accessCode);
    } catch (error: any) {
      // Error already handled in claimAccessWithCode
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 gap-4">
      <div className="w-full max-w-md">
        <PatientPWAInstallPrompt />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Patient Portal</CardTitle>
          <CardDescription>
            Access your rehabilitative care records and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(v) => setIsSignUp(v === "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Access Code Section */}
          {!codeFromUrl && (
            <div className="mt-6 pt-6 border-t">
              <form onSubmit={handleClaimAccess} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Have an Access Code?</Label>
                  <Input
                    id="accessCode"
                    type="text"
                    placeholder="Enter 8-character code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    disabled={loading}
                    className="font-mono text-center tracking-wider"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sign in first, then enter your access code to claim episode access
                  </p>
                </div>

                <Button 
                  type="submit" 
                  variant="outline" 
                  className="w-full" 
                  disabled={loading || !accessCode}
                >
                  Claim Access
                </Button>
              </form>
            </div>
          )}
          
          {codeFromUrl && (
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                  <Heart className="h-4 w-4" />
                  <span className="font-medium">Access code ready</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sign in or create an account to access your episode
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
