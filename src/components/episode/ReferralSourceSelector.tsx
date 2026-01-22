import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const REFERRAL_SOURCES = [
  { value: "referring_physician", label: "Referring physician" },
  { value: "another_provider", label: "Another provider" },
  { value: "current_patient", label: "Current patient" },
  { value: "friend_family", label: "Friend / family" },
  { value: "school_coach", label: "School / coach" },
  { value: "google_search", label: "Google / search" },
  { value: "social_media", label: "Social media" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
] as const;

interface ReferralSourceSelectorProps {
  referralSource: string;
  onReferralSourceChange: (value: string) => void;
  referringPhysician: string;
  onReferringPhysicianChange: (value: string) => void;
}

export function ReferralSourceSelector({
  referralSource,
  onReferralSourceChange,
  referringPhysician,
  onReferringPhysicianChange,
}: ReferralSourceSelectorProps) {
  const showReferringPhysician = referralSource === "referring_physician" || referralSource === "another_provider";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="referralSource">How did you find us?</Label>
        <Select value={referralSource} onValueChange={onReferralSourceChange}>
          <SelectTrigger id="referralSource">
            <SelectValue placeholder="Select how you heard about us" />
          </SelectTrigger>
          <SelectContent>
            {REFERRAL_SOURCES.map((source) => (
              <SelectItem key={source.value} value={source.value}>
                {source.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showReferringPhysician && (
        <div className="space-y-2">
          <Label htmlFor="referringPhysician">Referring Physician / Provider Name</Label>
          <Input
            id="referringPhysician"
            placeholder="Enter referring physician or provider name"
            value={referringPhysician}
            onChange={(e) => onReferringPhysicianChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
