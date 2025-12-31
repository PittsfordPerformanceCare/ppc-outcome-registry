import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// Always use the production Lovable app URL for consistency
const APP_URL = 'https://ppc-unified-platform.lovable.app';

export function CreateIntakeLinkDialog() {
  const [open, setOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [copied, setCopied] = useState(false);
  
  // The legal intake form URL - patients fill this out and it appears in Jennifer's dashboard
  // Using /patient-intake which is the full legal intake form (not the lead intake shell)
  const intakeUrl = `${APP_URL}/patient-intake`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(intakeUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!", {
        description: "You can now paste this link in your email to the patient."
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleCopyEmailTemplate = async () => {
    const emailBody = `Hi ${patientName || 'there'},

Please complete your intake forms before your visit by clicking the link below:

${intakeUrl}

This helps us prepare for your appointment so we can focus on your care.

If you have any questions, please call us at (585) 203-1050.

Thank you,
Pittsford Performance Care`;

    try {
      await navigator.clipboard.writeText(emailBody);
      setCopied(true);
      toast.success("Email template copied!", {
        description: "Paste this into your email. The link will be clickable when sent."
      });
      
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  // Create a mailto link that opens the email client with pre-filled content
  const handleOpenEmailClient = () => {
    const subject = encodeURIComponent("Complete Your Intake Forms - Pittsford Performance Care");
    const body = encodeURIComponent(`Hi ${patientName || 'there'},

Please complete your intake forms before your visit by clicking the link below:

${intakeUrl}

This helps us prepare for your appointment so we can focus on your care.

If you have any questions, please call us at (585) 203-1050.

Thank you,
Pittsford Performance Care`);
    
    const mailtoLink = `mailto:${patientEmail || ''}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  };

  const handleOpenInNewTab = () => {
    // Use current origin for preview so it works in sandbox and production
    const previewUrl = `${window.location.origin}/patient-intake`;
    window.open(previewUrl, '_blank');
  };

  const resetForm = () => {
    setPatientName("");
    setPatientEmail("");
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Link2 className="h-4 w-4" />
          Create Intake Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Manual Intake Link</DialogTitle>
          <DialogDescription>
            Generate a link to send to patients via your own email. When they complete the form, it will appear in your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Optional patient info for email template */}
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name (optional)</Label>
            <Input
              id="patientName"
              placeholder="e.g., John Smith"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used to personalize the email template
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientEmail">Patient Email (for your reference)</Label>
            <Input
              id="patientEmail"
              type="email"
              placeholder="patient@example.com"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This is just for your reference when composing the email
            </p>
          </div>

          {/* The link */}
          <div className="space-y-2">
            <Label>Intake Form Link</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm break-all">
                {intakeUrl}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Preview link */}
          <Button
            variant="link"
            size="sm"
            onClick={handleOpenInNewTab}
            className="gap-1 p-0 h-auto text-primary"
          >
            <ExternalLink className="h-3 w-3" />
            Preview intake form
          </Button>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyEmailTemplate}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Template
          </Button>
          <Button
            onClick={handleOpenEmailClient}
            className="gap-2"
            disabled={!patientEmail}
          >
            <ExternalLink className="h-4 w-4" />
            Open in Email App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
