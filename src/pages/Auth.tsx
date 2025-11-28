import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "You can now log in with your credentials.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-blue-50/30 dark:from-background dark:via-background dark:to-blue-950/20 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 shadow-2xl rounded-2xl overflow-hidden bg-background">
        {/* Left Panel - Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/90 to-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-background rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-background rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          <div className="relative z-10">
            <div className="mb-6">
              <div className="w-12 h-12 bg-primary-foreground/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-2 text-primary-foreground">PPC Clinical Outcome Registry</h1>
              <p className="text-primary-foreground/80 text-sm">Advancing Patient Care Through Data-Driven Insights</p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary-foreground rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1 text-primary-foreground">HIPAA Compliant</h3>
                <p className="text-sm text-primary-foreground/80">Enterprise-grade security for patient data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary-foreground rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1 text-primary-foreground">Clinical Excellence</h3>
                <p className="text-sm text-primary-foreground/80">Evidence-based outcome tracking</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary-foreground rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1 text-primary-foreground">Integrated Workflow</h3>
                <p className="text-sm text-primary-foreground/80">Seamless MSK & neurology management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Forms */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-background via-background to-muted/30">
          <div className="mb-8 md:hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PPC Clinical Outcome Registry</h1>
                <p className="text-xs text-muted-foreground">Secure clinical platform</p>
              </div>
            </div>
          </div>

          <div className="mb-6 hidden md:block">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome</h2>
            <p className="text-sm text-muted-foreground">Sign in to access your clinical dashboard</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50">
              <TabsTrigger value="login" className="text-sm font-medium data-[state=active]:shadow-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm font-medium data-[state=active]:shadow-sm">Create Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-semibold text-foreground">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your.email@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-background border-border/60 focus:border-primary/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-semibold text-foreground">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-background border-border/60 focus:border-primary/60 transition-colors"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-semibold text-foreground">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-12 bg-background border-border/60 focus:border-primary/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">Professional Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-background border-border/60 focus:border-primary/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 bg-background border-border/60 focus:border-primary/60 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60"></span>
                    Must be at least 6 characters
                  </p>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
