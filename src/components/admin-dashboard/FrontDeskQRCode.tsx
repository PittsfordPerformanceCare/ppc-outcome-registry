import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Printer, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// Always use the production URL for patient-facing links
const APP_URL = 'https://muse-meadow-app.lovable.app';
const INTAKE_URL = `${APP_URL}/patient-intake`;

export function FrontDeskQRCode() {
  const [open, setOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Intake QR Code - Pittsford Performance Care</title>
          <style>
            @page { 
              size: letter;
              margin: 0.5in;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 2rem;
              background: white;
            }
            .card {
              border: 3px solid #0a1628;
              border-radius: 16px;
              padding: 3rem;
              text-align: center;
              max-width: 500px;
              background: white;
            }
            .logo-placeholder {
              font-size: 1.5rem;
              font-weight: 700;
              color: #0a1628;
              margin-bottom: 1.5rem;
              letter-spacing: -0.02em;
            }
            h1 {
              font-size: 1.75rem;
              font-weight: 600;
              color: #0a1628;
              margin-bottom: 0.75rem;
            }
            .subtitle {
              color: #64748b;
              font-size: 1.1rem;
              margin-bottom: 2rem;
              line-height: 1.5;
            }
            .qr-container {
              background: white;
              padding: 1.5rem;
              border-radius: 12px;
              display: inline-block;
              margin-bottom: 2rem;
              border: 1px solid #e2e8f0;
            }
            .instructions {
              background: #f8fafc;
              padding: 1.25rem;
              border-radius: 8px;
              margin-bottom: 1.5rem;
            }
            .instructions h3 {
              font-size: 1rem;
              font-weight: 600;
              color: #0a1628;
              margin-bottom: 0.75rem;
            }
            .instructions ol {
              text-align: left;
              padding-left: 1.25rem;
              color: #475569;
              font-size: 0.95rem;
              line-height: 1.8;
            }
            .footer {
              color: #94a3b8;
              font-size: 0.875rem;
            }
            .footer a {
              color: #0a1628;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo-placeholder">Pittsford Performance Care</div>
            <h1>Complete Your Intake Forms</h1>
            <p class="subtitle">Scan this code with your phone's camera to begin</p>
            <div class="qr-container">
              ${document.getElementById('qr-code-svg')?.outerHTML || ''}
            </div>
            <div class="instructions">
              <h3>How to scan:</h3>
              <ol>
                <li>Open your phone's camera app</li>
                <li>Point it at the QR code</li>
                <li>Tap the link that appears</li>
                <li>Complete the intake form</li>
              </ol>
            </div>
            <p class="footer">
              Need help? Ask our front desk team<br/>
              <a href="tel:+15852031050">(585) 203-1050</a>
            </p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx?.drawImage(img, 0, 0, 400, 400);
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'ppc-intake-qr-code.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success("QR code downloaded!");
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePreview = () => {
    window.open(`${window.location.origin}/patient-intake`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          Front Desk QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Front Desk QR Code</DialogTitle>
          <DialogDescription>
            Print this QR code for patients to scan with their phones. When they submit the form, you'll get an instant alert.
          </DialogDescription>
        </DialogHeader>

        <div ref={printRef} className="space-y-4">
          <Card className="border-2">
            <CardContent className="pt-6 text-center space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Complete Your Intake Forms</h3>
                <p className="text-sm text-muted-foreground">
                  Scan with your phone's camera
                </p>
              </div>

              <div className="flex justify-center py-4">
                <div className="bg-white p-4 rounded-lg border">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={INTAKE_URL}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#0a1628"
                  />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="font-medium mb-1">How to scan:</p>
                <ol className="text-left text-muted-foreground space-y-0.5 list-decimal list-inside">
                  <li>Open your phone's camera</li>
                  <li>Point it at the QR code</li>
                  <li>Tap the link that appears</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-lg">✓</span>
              </div>
              <div>
                <p className="font-medium text-sm">Real-time alerts enabled</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive an instant notification when a patient submits their form
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handlePreview} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Preview Form
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
          <Button onClick={handlePrint} className="gap-2 ml-auto">
            <Printer className="h-4 w-4" />
            Print for Front Desk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
