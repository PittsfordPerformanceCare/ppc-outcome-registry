import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClinicSettings } from "@/hooks/useClinicSettings";
import { Upload, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClinicBrandingSettings() {
  const { settings, loading, updateSettings, uploadLogo } = useClinicSettings();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo must be under 2MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Logo must be PNG, JPEG, or WEBP",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      await uploadLogo(file);
    } catch (error) {
      console.error("Error uploading logo:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      clinic_name: formData.get("clinic_name") as string,
      tagline: formData.get("tagline") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      website: formData.get("website") as string,
    };

    try {
      setSaving(true);
      await updateSettings(updates);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Clinic Branding
        </CardTitle>
        <CardDescription>
          Customize your clinic's branding, logo, and contact information for reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Clinic Logo</Label>
            <div className="flex items-start gap-4">
              {settings.logo_url && (
                <div className="relative h-20 w-20 rounded-lg border bg-muted overflow-hidden">
                  <img
                    src={settings.logo_url}
                    alt="Clinic logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById("logo")?.click()}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  PNG, JPEG, or WEBP (max 2MB). Recommended: 200x200px
                </p>
              </div>
            </div>
          </div>

          {/* Clinic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic_name">Clinic Name *</Label>
              <Input
                id="clinic_name"
                name="clinic_name"
                defaultValue={settings.clinic_name}
                required
                placeholder="Your Clinic Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                defaultValue={settings.tagline || ""}
                placeholder="Your tagline or slogan"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={settings.phone || ""}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={settings.email || ""}
                placeholder="contact@clinic.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={settings.website || ""}
              placeholder="https://www.yourclinic.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={settings.address || ""}
              placeholder="123 Main Street&#10;Suite 100&#10;City, State 12345"
              rows={3}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
