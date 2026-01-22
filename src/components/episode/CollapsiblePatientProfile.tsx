import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CollapsiblePatientProfileProps {
  dob: string;
  onDobChange: (value: string) => void;
  insurance: string;
  onInsuranceChange: (value: string) => void;
  emergencyContact: string;
  onEmergencyContactChange: (value: string) => void;
  emergencyPhone: string;
  onEmergencyPhoneChange: (value: string) => void;
  isPrefilled?: boolean;
}

export function CollapsiblePatientProfile({
  dob,
  onDobChange,
  insurance,
  onInsuranceChange,
  emergencyContact,
  onEmergencyContactChange,
  emergencyPhone,
  onEmergencyPhoneChange,
  isPrefilled = false,
}: CollapsiblePatientProfileProps) {
  const [isOpen, setIsOpen] = useState(!isPrefilled);
  const [isEditing, setIsEditing] = useState(false);

  const hasData = dob || insurance || emergencyContact || emergencyPhone;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 hover:text-primary transition-colors">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <CardTitle className="text-lg">Patient Profile</CardTitle>
                {isPrefilled && hasData && !isOpen && (
                  <Badge variant="secondary" className="ml-2">Prefilled</Badge>
                )}
              </button>
            </CollapsibleTrigger>
            {isPrefilled && !isOpen && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                  setIsEditing(true);
                }}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3 w-3" />
                Update
              </Button>
            )}
          </div>
          {!isOpen && hasData && (
            <p className="text-sm text-muted-foreground ml-6">
              DOB: {dob || "Not set"} • Insurance: {insurance || "Not set"}
            </p>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => onDobChange(e.target.value)}
                  disabled={isPrefilled && !isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance Provider</Label>
                <Input
                  id="insurance"
                  placeholder="Enter insurance provider"
                  value={insurance}
                  onChange={(e) => onInsuranceChange(e.target.value)}
                  disabled={isPrefilled && !isEditing}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  placeholder="Enter emergency contact"
                  value={emergencyContact}
                  onChange={(e) => onEmergencyContactChange(e.target.value)}
                  disabled={isPrefilled && !isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  placeholder="Enter phone number"
                  value={emergencyPhone}
                  onChange={(e) => onEmergencyPhoneChange(e.target.value)}
                  disabled={isPrefilled && !isEditing}
                />
              </div>
            </div>

            {isPrefilled && !isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1"
              >
                <Pencil className="h-3 w-3" />
                Edit Profile
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
