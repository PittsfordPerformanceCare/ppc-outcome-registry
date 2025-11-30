import { Activity } from "lucide-react";

interface ClinicHeaderProps {
  clinicSettings?: {
    clinic_name?: string;
    tagline?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  } | null;
}

export function ClinicHeader({ clinicSettings }: ClinicHeaderProps) {
  const clinicName = clinicSettings?.clinic_name || "PPC Outcome Registry";
  const tagline = clinicSettings?.tagline || "Clinical Excellence Platform";

  return (
    <div className="flex items-start space-x-3 pb-6 border-b-2 border-primary/20">
      <div className="rounded-lg bg-primary/10 p-2">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-primary leading-tight">
          {clinicName}
        </h1>
        {tagline && (
          <p className="text-sm text-muted-foreground mt-0.5">{tagline}</p>
        )}
        {(clinicSettings?.address || clinicSettings?.phone || clinicSettings?.email) && (
          <div className="text-sm mt-3 space-y-1 text-muted-foreground">
            {clinicSettings.address && <p>{clinicSettings.address}</p>}
            {clinicSettings.phone && <p>Phone: {clinicSettings.phone}</p>}
            {clinicSettings.email && <p>Email: {clinicSettings.email}</p>}
            {clinicSettings.website && <p>Web: {clinicSettings.website}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
