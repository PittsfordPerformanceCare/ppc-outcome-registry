import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ReferralQRGenerator = () => {
  const { toast } = useToast();
  const [referralSource, setReferralSource] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Use production URL from environment, fallback to current origin for development
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const generateUrl = () => {
    let url = `${baseUrl}/patient/intake/referral`;
    const params = new URLSearchParams();
    
    if (referralSource) params.append('ref', referralSource);
    if (referralCode) params.append('code', referralCode);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return url;
  };

  const url = generateUrl();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy manually",
      });
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `referral-qr-${referralSource || 'generic'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast({
        title: "Downloaded!",
        description: "QR code saved to your device",
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Referral QR Code</CardTitle>
        <CardDescription>
          Create custom QR codes for different referral sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="referralSource">Referral Source (Optional)</Label>
            <Input
              id="referralSource"
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              placeholder="e.g., Social Media, Email, Poster"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
            <Input
              id="referralCode"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="e.g., SPRING2024"
            />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 p-6 bg-background border rounded-lg">
          <QRCodeSVG
            id="qr-code"
            value={url}
            size={256}
            level="H"
            includeMargin={true}
          />
          
          <div className="w-full space-y-2">
            <Label>Generated URL:</Label>
            <div className="flex gap-2">
              <Input
                value={url}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button onClick={handleDownloadQR} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download QR Code
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm font-semibold">How to use:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Enter an optional referral source to track where inquiries come from</li>
            <li>Add an optional referral code for campaigns or specific promotions</li>
            <li>Download the QR code and add it to posters, business cards, or marketing materials</li>
            <li>When scanned, prospects will complete a brief screening form</li>
            <li>Review and respond to inquiries in the Referral Inbox</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
