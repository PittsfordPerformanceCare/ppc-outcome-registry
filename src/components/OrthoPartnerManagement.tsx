import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Building2, MapPin, Mail, Phone } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  groupName: z.string().optional(),
  location: z.string().optional(),
  subspecialty: z.string().optional(),
  directSecureAddress: z.string().email().optional().or(z.literal("")),
  faxOrEmailBackup: z.string().optional(),
  preferredReturnMethod: z.string().optional(),
  prioritySchedulingInstructions: z.string().optional(),
  returnInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function OrthoPartnerManagement() {
  const { toast } = useToast();
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      groupName: "",
      location: "",
      subspecialty: "",
      directSecureAddress: "",
      faxOrEmailBackup: "",
      preferredReturnMethod: "",
      prioritySchedulingInstructions: "",
      returnInstructions: "",
    },
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("ortho_partners")
        .select("*")
        .order("name");

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      console.error("Error loading partners:", error);
      toast({
        title: "Error",
        description: "Failed to load ortho partners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("ortho_partners").insert({
        user_id: user.id,
        clinic_id: profile?.clinic_id,
        name: values.name,
        group_name: values.groupName,
        location: values.location,
        subspecialty: values.subspecialty,
        direct_secure_address: values.directSecureAddress,
        fax_or_email_backup: values.faxOrEmailBackup,
        preferred_return_method: values.preferredReturnMethod,
        priority_scheduling_instructions: values.prioritySchedulingInstructions,
        return_instructions: values.returnInstructions,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ortho partner added successfully",
      });

      form.reset();
      setOpen(false);
      loadPartners();
    } catch (error: any) {
      console.error("Error adding partner:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add ortho partner",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ortho Partners</h2>
          <p className="text-muted-foreground">Manage your orthopedic referral partners</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Ortho Partner</DialogTitle>
              <DialogDescription>
                Add a new orthopedic partner for referrals
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="groupName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group/Practice Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Orthopedic Associates" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subspecialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subspecialty</FormLabel>
                        <FormControl>
                          <Input placeholder="Shoulder, Spine, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="directSecureAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direct Secure Messaging</FormLabel>
                        <FormControl>
                          <Input placeholder="direct@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="faxOrEmailBackup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fax/Email Backup</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567 or email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="preferredReturnMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Return Method</FormLabel>
                      <FormControl>
                        <Input placeholder="Direct message, phone call, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prioritySchedulingInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Scheduling Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Instructions for urgent/priority cases"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="returnInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return to PPC Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Instructions for what the partner's staff should do when returning patient"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Partner"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading partners...</p>
          </CardContent>
        </Card>
      ) : partners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No ortho partners added yet</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Partner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {partners.map((partner) => (
            <Card key={partner.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {partner.name}
                    </CardTitle>
                    {partner.group_name && (
                      <CardDescription>{partner.group_name}</CardDescription>
                    )}
                  </div>
                  {partner.subspecialty && (
                    <Badge variant="outline">{partner.subspecialty}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {partner.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {partner.location}
                  </div>
                )}
                {partner.direct_secure_address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {partner.direct_secure_address}
                  </div>
                )}
                {partner.fax_or_email_backup && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {partner.fax_or_email_backup}
                  </div>
                )}
                {partner.preferred_return_method && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs font-medium mb-1">Return Method:</p>
                    <p className="text-muted-foreground">{partner.preferred_return_method}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}