import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Share, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PatientPWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone || 
      document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt if not dismissed recently (within 7 days)
      if (daysSinceDismissed > 7) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt if not installed and not dismissed recently
    if (iOS && !isInStandaloneMode && daysSinceDismissed > 7) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) return;

    if (deferredPrompt) {
      // Android/Chrome installation
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "App installed!",
          description: "You can now access the app from your home screen.",
        });
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  // Don't show if already installed
  if (isStandalone || !showPrompt) return null;

  return (
    <Card className="shadow-sm border-primary/20 bg-card">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Install App</h3>
              <p className="text-xs text-muted-foreground">
                Quick access from home screen
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              ×
            </Button>
          </div>

          {/* Instructions */}
          {isIOS ? (
            <div className="space-y-3 pl-11">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">1</span>
                </div>
                <p className="text-xs">
                  Tap <Share className="inline h-3 w-3 mx-1 align-text-bottom" /> <strong>Share</strong> button
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">2</span>
                </div>
                <p className="text-xs">
                  Tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">3</span>
                </div>
                <p className="text-xs">
                  Tap <strong>"Add"</strong>
                </p>
              </div>
              <Button
                onClick={() => navigate('/install')}
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs h-7"
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                Need detailed help?
              </Button>
            </div>
          ) : deferredPrompt ? (
            <div className="pl-11 space-y-2">
              <Button
                onClick={handleInstallClick}
                className="w-full"
                size="sm"
              >
                Install Now
              </Button>
              <Button
                onClick={() => navigate('/install')}
                variant="ghost"
                size="sm"
                className="w-full text-xs h-7"
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                View instructions
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pl-11">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">1</span>
                </div>
                <p className="text-xs">
                  Tap <strong>menu</strong> (⋮)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">2</span>
                </div>
                <p className="text-xs">
                  Select <strong>"Install app"</strong>
                </p>
              </div>
              <Button
                onClick={() => navigate('/install')}
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs h-7"
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                Need detailed help?
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
