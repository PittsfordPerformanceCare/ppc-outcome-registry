import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Activity, ArrowLeft, Mail } from "lucide-react";
import { z } from "zod";
import { PatientPWAInstallPrompt } from "@/components/PatientPWAInstallPrompt";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { usePasswordValidation, usePasswordMatch } from "@/hooks/usePasswordValidation";

const emailSchema = z.string().email("Invalid email address");
// Login uses simpler validation (don't block existing users)
const loginPasswordSchema = z.string().min(1, "Password is required");

type AuthView = 'signin' | 'signup' | 'forgot-password';

export default function PatientAuth() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<AuthView>('signin');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  // Password validation for signup
  const passwordValidation = usePasswordValidation(password);
  const passwordMatch = usePasswordMatch(password, confirmPassword);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    try {
      emailSchema.parse(email);
      
      // Use enhanced password validation for signup
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0] || "Please meet all password requirements");
      }
      
      if (!passwordMatch.matches) {
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
        const { data: accountData, error: accountError } = await supabase
          .from("patient_accounts")
          .upsert({
            id: authData.user.id,
            email,
            full_name: fullName,
          }, {
            onConflict: "email"
          })
          .select()
          .single();

        if (accountError) {
          console.error("Error creating patient account:", accountError);
          toast({
            title: "Account Setup Issue",
            description: "Your account was created but there was an issue linking it. Please contact support.",
            variant: "destructive",
          });
        }

        // Auto-link episodes based on email
        if (accountData && authData.session) {
          await supabase.rpc('auto_link_patient_episodes', {
            p_patient_account_id: accountData.id,
            p_email: email
          });
        }

        if (authData.session) {
          toast({
            title: "Account Created!",
            description: "Welcome to your Patient Hub!",
          });
          navigate("/patient-dashboard");
        } else {
          toast({
            title: "Account Created!",
            description: "You can now sign in to access your records.",
          });
          setCurrentView('signin');
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

    // Login uses simpler validation - don't block existing users with old passwords
    try {
      emailSchema.parse(email);
      loginPasswordSchema.parse(password);
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

      // Get user's session to get email
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get patient account and auto-link episodes
      if (user?.email) {
        const { data: accountData } = await supabase
          .from("patient_accounts")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();

        if (accountData) {
          await supabase.rpc('auto_link_patient_episodes', {
            p_patient_account_id: accountData.id,
            p_email: user.email
          });
        }
      }

      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
      });

      navigate("/patient-dashboard");
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
    } catch (error: any) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/patient-reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password View
  if (currentView === 'forgot-password') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 gap-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              {resetEmailSent ? (
                <Mail className="h-8 w-8 text-primary" />
              ) : (
                <Activity className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {resetEmailSent ? "Check Your Email" : "Reset Password"}
            </CardTitle>
            <CardDescription>
              {resetEmailSent 
                ? "We've sent you a password reset link" 
                : "Enter your email to receive a reset link"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetEmailSent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  We've sent an email to <span className="font-medium text-foreground">{email}</span> with 
                  a link to reset your password. The link will expire in 1 hour.
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  Don't see the email? Check your spam folder.
                </p>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setResetEmailSent(false);
                      setEmail("");
                    }}
                  >
                    Send to a different email
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => {
                      setCurrentView('signin');
                      setResetEmailSent(false);
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setCurrentView('signin')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <Tabs value={currentView === 'signup' ? 'signup' : 'signin'} onValueChange={(v) => setCurrentView(v as AuthView)}>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setCurrentView('forgot-password')}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
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
                    placeholder="Create a strong password"
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
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                {/* Password Strength Meter */}
                <PasswordStrengthMeter 
                  password={password} 
                  confirmPassword={confirmPassword}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !passwordValidation.isValid || !passwordMatch.matches}
                >
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
        </CardContent>
      </Card>
    </div>
  );
}