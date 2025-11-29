import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

interface SignatureFieldProps {
  value: string;
  onChange: (value: string) => void;
  typedName: string;
  onTypedNameChange: (name: string) => void;
  isMobile?: boolean;
}

export function SignatureField({
  value,
  onChange,
  typedName,
  onTypedNameChange,
  isMobile = false,
}: SignatureFieldProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [useTypedSignature, setUseTypedSignature] = useState(false);

  const handleToggleSignatureMode = () => {
    setUseTypedSignature(!useTypedSignature);
    if (!useTypedSignature) {
      // Switching to typed - generate signature from typed name
      if (typedName) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.font = '30px "Dancing Script", cursive';
          ctx.fillStyle = '#000';
          ctx.fillText(typedName, 20, 60);
          onChange(canvas.toDataURL());
        }
      }
    } else {
      // Switching to drawn - clear the field
      onChange("");
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
    }
  };

  const handleTypedNameChange = (name: string) => {
    onTypedNameChange(name);
    
    // Generate signature image from typed name
    if (name) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '30px "Dancing Script", cursive';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, 20, 50);
        onChange(canvas.toDataURL());
      }
    } else {
      onChange("");
    }
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      onChange("");
      toast.success("Signature cleared");
    }
  };

  return (
    <FormItem>
      <div className="flex items-center justify-between">
        <FormLabel>Signature *</FormLabel>
        {isMobile && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleSignatureMode}
            className="text-xs"
          >
            {useTypedSignature ? "Draw Instead" : "Type Instead"}
          </Button>
        )}
      </div>
      
      {useTypedSignature || (isMobile && !value) ? (
        <>
          <FormDescription>
            Your typed name will serve as your digital signature
          </FormDescription>
          <FormControl>
            <div className="space-y-2">
              <Input
                placeholder="Type your full legal name"
                value={typedName}
                onChange={(e) => handleTypedNameChange(e.target.value)}
                className="text-lg"
                autoComplete="name"
                enterKeyHint="next"
              />
              {value && (
                <div className="border-2 border-input rounded-md p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <img 
                    src={value} 
                    alt="Signature preview" 
                    className="h-16 mx-auto"
                  />
                </div>
              )}
            </div>
          </FormControl>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              By typing your name, you agree this serves as your legal electronic signature
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <>
          <FormDescription>
            Please sign in the box below using your mouse or finger
          </FormDescription>
          <FormControl>
            <div className="border-2 border-input rounded-md">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: "w-full h-40 rounded-md",
                }}
                onEnd={() => {
                  if (signatureRef.current) {
                    const dataUrl = signatureRef.current.toDataURL();
                    onChange(dataUrl);
                  }
                }}
              />
            </div>
          </FormControl>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearSignature}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Signature
            </Button>
          </div>
        </>
      )}
      <FormMessage />
    </FormItem>
  );
}
