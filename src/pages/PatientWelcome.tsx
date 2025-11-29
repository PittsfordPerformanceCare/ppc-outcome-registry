import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle2, Smartphone, Share } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export default function PatientWelcome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);
  const [isIOS] = useState(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    try {
      passwordSchema.parse(password);
    } catch (error: any) {
      toast({
        title: "Invalid Password",
        description: error.errors?.[0]?.message || "Please check your password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Password Set Successfully!",
        description: "Your account is now secure",
      });

      setPasswordSet(true);
    } catch (error: any) {
      console.error("Error setting password:", error);
      toast({
        title: "Failed to Set Password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    localStorage.setItem("ppc_patient_welcome_seen", "true");
    navigate("/patient-dashboard");
  };

  if (passwordSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-primary/20">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 mb-2">
              <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold">You're All Set!</CardTitle>
            <CardDescription className="text-base">
              One more thing - install our app for the best experience
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* PWA Installation Card */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">Install PPC Patient App</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get instant access from your home screen with our mobile app. Works offline, loads faster, and provides a native app experience!
                      </p>
                      
                      <div className="grid gap-3 p-4 bg-background/60 rounded-lg border">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Benefits:
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Works offline - access your data anywhere</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Lightning fast loading times</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>One tap access from home screen</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Native app feel and experience</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Installation Instructions */}
                  {isIOS ? (
                    <div className="space-y-3 p-4 bg-background/60 rounded-lg border">
                      <div className="font-semibold text-sm">How to Install on iPhone/iPad:</div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">1</span>
                          </div>
                          <p className="text-sm">
                            Tap the <Share className="inline h-4 w-4 mx-1 align-text-bottom" /> <strong>Share</strong> button at the bottom of your browser
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">2</span>
                          </div>
                          <p className="text-sm">
                            Scroll down and tap <strong>"Add to Home Screen"</strong>
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">3</span>
                          </div>
                          <p className="text-sm">
                            Tap <strong>"Add"</strong> in the top right corner
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4 bg-background/60 rounded-lg border">
                      <div className="font-semibold text-sm">How to Install on Android:</div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">1</span>
                          </div>
                          <p className="text-sm">
                            Tap the <strong>menu</strong> (⋮) in your browser
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">2</span>
                          </div>
                          <p className="text-sm">
                            Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">3</span>
                          </div>
                          <p className="text-sm">
                            Confirm installation
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleContinue}
                size="lg"
                className="w-full text-base h-12"
              >
                Continue to Dashboard
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You can install the app anytime from your dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 mb-2">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to PPC!</CardTitle>
          <CardDescription className="text-base">
            Let's secure your account with a password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePasswordSetup} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-2">
                <div className="font-semibold mb-2">Password Requirements:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${password.length >= 8 ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${/[a-z]/.test(password) ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                    One lowercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${/[0-9]/.test(password) ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                    One number
                  </li>
                </ul>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? "Setting Password..." : "Set Password & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
