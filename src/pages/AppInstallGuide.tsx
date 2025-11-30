import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Share, Plus, MoreVertical, Home, Download, CheckCircle, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AppInstallGuide() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const appUrl = window.location.origin;

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const android = /android/i.test(navigator.userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone;
    
    setIsIOS(iOS);
    setIsAndroid(android);
    setIsInstalled(standalone);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Install Your Patient App</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get easy access to your treatment information, appointments, and communicate with your clinician - all from an app on your phone
          </p>
        </div>

        {/* Already Installed Alert */}
        {isInstalled && (
          <Alert className="border-success/50 bg-success/5">
            <CheckCircle className="h-5 w-5 text-success" />
            <AlertDescription>
              Great! The app is already installed on this device. You can access it from your home screen.
            </AlertDescription>
          </Alert>
        )}

        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Why Install the App?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Home className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Easy Access</h3>
                  <p className="text-sm text-muted-foreground">Tap the icon on your home screen - no need to remember website addresses</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Works Offline</h3>
                  <p className="text-sm text-muted-foreground">View your information even without internet connection</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Faster Loading</h3>
                  <p className="text-sm text-muted-foreground">Opens instantly, just like apps from the App Store</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Full Screen</h3>
                  <p className="text-sm text-muted-foreground">Immersive experience without browser bars</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section - For Clinic to Print */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan to Access
            </CardTitle>
            <CardDescription>
              Point your phone's camera at this code to open the app
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="bg-white p-6 rounded-lg border-2 border-primary/20">
              <QRCodeSVG 
                value={appUrl} 
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">{appUrl.replace('https://', '')}</p>
              <Button onClick={handlePrint} variant="outline" className="print:hidden">
                <Download className="h-4 w-4 mr-2" />
                Print This Page
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator className="print:hidden" />

        {/* iPhone Instructions */}
        <Card id="iphone-instructions" className={isIOS ? "border-primary/50 bg-primary/5" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                iPhone Installation
              </CardTitle>
              {isIOS && <Badge className="bg-primary">Your Device</Badge>}
            </div>
            <CardDescription>
              Follow these steps on your iPhone or iPad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Open Safari Browser</h4>
                  <p className="text-sm text-muted-foreground">
                    Visit <span className="font-mono bg-muted px-2 py-1 rounded">{appUrl.replace('https://', '')}</span> in Safari (this must be Safari, not Chrome)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    Tap the Share Button
                    <Share className="h-4 w-4 text-primary" />
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    At the bottom of your screen (or top right on iPad), tap the square icon with an arrow pointing up
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    💡 The Share button looks like a box with an arrow coming out of the top
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    Select "Add to Home Screen"
                    <Plus className="h-4 w-4 text-primary" />
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Scroll down in the share menu and tap "Add to Home Screen"
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    💡 If you don't see this option, scroll down through the actions
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">4</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Tap "Add"</h4>
                  <p className="text-sm text-muted-foreground">
                    Confirm by tapping the blue "Add" button in the top right corner
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-success">Done!</h4>
                  <p className="text-sm text-muted-foreground">
                    The app icon will appear on your home screen. Tap it anytime to access your health information.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Android Instructions */}
        <Card id="android-instructions" className={isAndroid ? "border-primary/50 bg-primary/5" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Android Installation
              </CardTitle>
              {isAndroid && <Badge className="bg-primary">Your Device</Badge>}
            </div>
            <CardDescription>
              Follow these steps on your Android phone or tablet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Open Chrome Browser</h4>
                  <p className="text-sm text-muted-foreground">
                    Visit <span className="font-mono bg-muted px-2 py-1 rounded">{appUrl.replace('https://', '')}</span> in Chrome
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    Look for the Install Banner
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Chrome will show a banner at the bottom of the screen saying "Install app"
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    💡 If you see the banner, tap "Install" and you're done!
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    Or Use the Menu
                    <MoreVertical className="h-4 w-4 text-primary" />
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    If you don't see the banner, tap the three dots (⋮) in the top right corner
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">4</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Select "Install app" or "Add to Home screen"</h4>
                  <p className="text-sm text-muted-foreground">
                    Tap the option in the menu and confirm when prompted
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-success">Done!</h4>
                  <p className="text-sm text-muted-foreground">
                    The app icon will appear on your home screen or app drawer. Tap it anytime to access your health information.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Need Help Section */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you're having trouble installing the app, please contact our office. We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/'}>
                Use Website Instead
              </Button>
              <Button className="flex-1" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Print These Instructions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Print-only footer */}
        <div className="hidden print:block text-center text-sm text-muted-foreground space-y-2 mt-8">
          <p className="font-medium text-foreground">Questions? Contact Our Office</p>
          <p>Visit: {appUrl}</p>
        </div>
      </div>
    </div>
  );
}
