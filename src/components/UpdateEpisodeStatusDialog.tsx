import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EPISODE_STATUS_LABELS } from "@/lib/orthoReferralUtils";

const statusTransitions: Record<string, string[]> = {
  "REFERRED_TO_ORTHO": ["ORTHO_CONSULT_COMPLETED"],
  "ORTHO_CONSULT_COMPLETED": ["SURGERY_COMPLETED", "ORTHO_REHAB_IN_PROGRESS"],
  "SURGERY_COMPLETED": ["ORTHO_REHAB_IN_PROGRESS"],
  "ORTHO_REHAB_IN_PROGRESS": ["ORTHO_REHAB_COMPLETED"],
  "ORTHO_REHAB_COMPLETED": ["PENDING_RETURN_TO_PPC"],
  "PENDING_RETURN_TO_PPC": ["FINAL_PPC_ASSESSMENT_COMPLETED"],
  "FINAL_PPC_ASSESSMENT_COMPLETED": ["EPISODE_CLOSED"],
};

const formSchema = z.object({
  newStatus: z.string().min(1, "Please select a new status"),
  surgeryDate: z.date().optional(),
  procedurePerformed: z.string().optional(),
  rehabFacility: z.string().optional(),
  rehabDischargeDate: z.date().optional(),
  complications: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateEpisodeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  currentStatus: string;
  onSuccess?: () => void;
}

export function UpdateEpisodeStatusDialog({
  open,
  onOpenChange,
  episodeId,
  currentStatus,
  onSuccess,
}: UpdateEpisodeStatusDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const availableTransitions = statusTransitions[currentStatus] || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newStatus: "",
      procedurePerformed: "",
      rehabFacility: "",
      complications: "",
      notes: "",
    },
  });

  const selectedStatus = form.watch("newStatus");

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

      // Update episode status
      const episodeUpdate: any = {
        current_status: values.newStatus,
      };

      // If marking surgery completed, update surgery fields
      if (values.newStatus === "SURGERY_COMPLETED" && values.surgeryDate) {
        episodeUpdate.surgery_performed = true;
        episodeUpdate.surgery_date = format(values.surgeryDate, "yyyy-MM-dd");
      }

      const { error: episodeError } = await supabase
        .from("episodes")
        .update(episodeUpdate)
        .eq("id", episodeId);

      if (episodeError) throw episodeError;

      // If marking rehab completed, create a return packet record
      if (values.newStatus === "ORTHO_REHAB_COMPLETED" || values.newStatus === "PENDING_RETURN_TO_PPC") {
        // Get referral info
        const { data: referralData } = await supabase
          .from("ortho_referrals")
          .select("id, destination_ortho_id")
          .eq("episode_id", episodeId)
          .single();

        if (referralData) {
          const { error: packetError } = await supabase
            .from("post_ortho_return_packets")
            .insert({
              user_id: user.id,
              clinic_id: profile?.clinic_id,
              episode_id: episodeId,
              ortho_partner_id: referralData.destination_ortho_id,
              procedure_performed: values.procedurePerformed,
              surgery_date: values.surgeryDate ? format(values.surgeryDate, "yyyy-MM-dd") : null,
              rehab_facility: values.rehabFacility,
              rehab_discharge_date: values.rehabDischargeDate
                ? format(values.rehabDischargeDate, "yyyy-MM-dd")
                : null,
              complications: values.complications,
              submitted_by: "PPC Staff",
              submitted_via: "Manual Entry",
            });

          if (packetError) throw packetError;

          // Create a task for scheduling return visit
          const returnWindowEnd = new Date();
          returnWindowEnd.setDate(returnWindowEnd.getDate() + 14); // Due in 2 weeks

          await supabase.from("ortho_tasks").insert({
            user_id: user.id,
            clinic_id: profile?.clinic_id,
            task_type: "ReturnFollowUp",
            episode_id: episodeId,
            due_date: format(returnWindowEnd, "yyyy-MM-dd"),
            status: "Open",
            description: `Schedule final outcome assessment for episode ${episodeId}`,
          });
        }
      }

      toast({
        title: "Status Updated",
        description: `Episode status updated to ${EPISODE_STATUS_LABELS[values.newStatus]}`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update episode status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Episode Status</DialogTitle>
          <DialogDescription>
            Update the episode status and record relevant information
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTransitions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {EPISODE_STATUS_LABELS[status] || status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Current status: {EPISODE_STATUS_LABELS[currentStatus] || currentStatus}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show surgery fields if marking surgery completed */}
            {selectedStatus === "SURGERY_COMPLETED" && (
              <>
                <FormField
                  control={form.control}
                  name="surgeryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Surgery Date</FormLabel>
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
                  name="procedurePerformed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Procedure Performed</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ACL reconstruction, RTC repair" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Show rehab fields if marking rehab completed */}
            {(selectedStatus === "ORTHO_REHAB_COMPLETED" || selectedStatus === "PENDING_RETURN_TO_PPC") && (
              <>
                <FormField
                  control={form.control}
                  name="rehabFacility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rehab Facility</FormLabel>
                      <FormControl>
                        <Input placeholder="Facility name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rehabDischargeDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Rehab Discharge Date</FormLabel>
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
                  name="complications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complications (if any)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any complications or concerns" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes about this status change" {...field} />
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
              <Button type="submit" disabled={loading || !selectedStatus}>
                {loading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}