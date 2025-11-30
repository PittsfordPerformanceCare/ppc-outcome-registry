import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  REFERRAL_REASONS_PRIMARY,
  REFERRAL_REASONS_SECONDARY,
  COMMUNICATION_CHANNELS,
  calculateReturnWindow,
  PROCEDURE_RETURN_WINDOWS,
} from "@/lib/orthoReferralUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  destinationOrthoId: z.string().min(1, "Please select an ortho partner"),
  referralDate: z.date(),
  referralReasonPrimary: z.string().min(1, "Please select a primary reason"),
  referralReasonSecondary: z.array(z.string()).optional(),
  suspectedProcedureType: z.string().optional(),
  procedureClass: z.string().optional(),
  priorityFlag: z.boolean().default(false),
  communicationChannel: z.string().optional(),
  notesToOrtho: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface OrthoReferralFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  patientName: string;
  onSuccess?: () => void;
}

export function OrthoReferralForm({
  open,
  onOpenChange,
  episodeId,
  patientName,
  onSuccess,
}: OrthoReferralFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orthoPartners, setOrthoPartners] = useState<any[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [selectedProcedure, setSelectedProcedure] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referralDate: new Date(),
      priorityFlag: false,
      referralReasonSecondary: [],
    },
  });

  // Load ortho partners
  useState(() => {
    const loadOrthoPartners = async () => {
      try {
        const { data, error } = await supabase
          .from("ortho_partners")
          .select("*")
          .order("name");

        if (error) throw error;
        setOrthoPartners(data || []);
      } catch (error: any) {
        console.error("Error loading ortho partners:", error);
        toast({
          title: "Error",
          description: "Failed to load ortho partners",
          variant: "destructive",
        });
      } finally {
        setLoadingPartners(false);
      }
    };

    if (open) {
      loadOrthoPartners();
    }
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      // Calculate return window if procedure class is selected
      let returnWindow = null;
      if (values.procedureClass) {
        returnWindow = calculateReturnWindow(values.procedureClass);
      }

      // Create the referral
      const { data: referral, error: referralError } = await supabase
        .from("ortho_referrals")
        .insert({
          user_id: user.id,
          clinic_id: profile?.clinic_id,
          episode_id: episodeId,
          destination_ortho_id: values.destinationOrthoId,
          referral_date: format(values.referralDate, "yyyy-MM-dd"),
          referral_reason_primary: values.referralReasonPrimary,
          referral_reason_secondary: values.referralReasonSecondary || [],
          suspected_procedure_type: values.suspectedProcedureType,
          procedure_class: values.procedureClass,
          priority_flag: values.priorityFlag,
          communication_channel: values.communicationChannel,
          notes_to_ortho: values.notesToOrtho,
          expected_return_window_start: returnWindow ? format(returnWindow.startDate, "yyyy-MM-dd") : null,
          expected_return_window_end: returnWindow ? format(returnWindow.endDate, "yyyy-MM-dd") : null,
        })
        .select()
        .single();

      if (referralError) throw referralError;

      // Update episode status and link referral
      const { error: episodeError } = await supabase
        .from("episodes")
        .update({
          current_status: "REFERRED_TO_ORTHO",
          has_ortho_referral: true,
          referral_id: referral.id,
          return_to_registry_required: true,
        })
        .eq("id", episodeId);

      if (episodeError) throw episodeError;

      toast({
        title: "Referral Created",
        description: `Ortho referral for ${patientName} has been created successfully.`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating referral:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create referral",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const returnWindowInfo = selectedProcedure ? PROCEDURE_RETURN_WINDOWS[selectedProcedure] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Ortho Referral</DialogTitle>
          <DialogDescription>
            Create an orthopedic referral for {patientName}. This will update the episode status and track the patient's journey.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="destinationOrthoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ortho Partner *</FormLabel>
                  <Select
                    disabled={loadingPartners}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ortho partner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orthoPartners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name} {partner.subspecialty && `(${partner.subspecialty})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referralDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Referral Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referralReasonPrimary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Reason for Referral *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REFERRAL_REASONS_PRIMARY.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referralReasonSecondary"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Secondary Reasons (Optional)</FormLabel>
                    <FormDescription>
                      Select all that apply
                    </FormDescription>
                  </div>
                  <div className="space-y-2">
                    {REFERRAL_REASONS_SECONDARY.map((reason) => (
                      <FormField
                        key={reason}
                        control={form.control}
                        name="referralReasonSecondary"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={reason}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(reason)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), reason])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== reason)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {reason}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suspectedProcedureType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suspected Procedure Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ACL reconstruction, RTC repair" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="procedureClass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procedure Class (for return window calculation)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedProcedure(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select procedure class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(PROCEDURE_RETURN_WINDOWS).map((proc) => (
                        <SelectItem key={proc} value={proc}>
                          {proc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {returnWindowInfo && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {returnWindowInfo.description}
                      </AlertDescription>
                    </Alert>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="communicationChannel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Communication Channel</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select communication method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMMUNICATION_CHANNELS.map((channel) => (
                        <SelectItem key={channel} value={channel}>
                          {channel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priorityFlag"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Priority Referral
                    </FormLabel>
                    <FormDescription>
                      Mark this as a priority/urgent referral
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notesToOrtho"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes to Ortho</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or clinical information for the orthopedic partner"
                      className="min-h-[100px]"
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
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Referral"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}