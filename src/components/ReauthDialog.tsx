import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

interface ReauthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ReauthDialog({ open, onOpenChange, onSuccess }: ReauthDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Session refreshed successfully");
      setEmail("");
      setPassword("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error("Authentication failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Session Expired
          </DialogTitle>
          <DialogDescription>
            Your session has expired. Please sign in again to continue. 
            Your form data will be preserved.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleReauth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reauth-email">Email</Label>
            <Input
              id="reauth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reauth-password">Password</Label>
            <Input
              id="reauth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
