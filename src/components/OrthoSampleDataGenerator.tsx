import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export function OrthoSampleDataGenerator() {
  const [generating, setGenerating] = useState(false);

  const generateSampleData = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to generate sample data");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      const clinic_id = profile?.clinic_id;

      // Sample ortho partners
      const orthoPartners = [
        {
          name: "Dr. Sarah Chen",
          group_name: "Rochester Orthopedic Group",
          subspecialty: "Sports Medicine",
          location: "Rochester, NY",
          preferred_return_method: "Direct Secure Messaging",
          direct_secure_address: "sarah.chen@rochesterortho.com",
          return_instructions: "Please return patients 2-3 weeks post-op for initial PT assessment",
          priority_scheduling_instructions: "Priority slots available Mon/Wed/Fri mornings",
          user_id: user.id,
          clinic_id,
        },
        {
          name: "Dr. Michael Torres",
          group_name: "Finger Lakes Orthopedics",
          subspecialty: "Joint Replacement",
          location: "Geneva, NY",
          preferred_return_method: "Fax",
          fax_or_email_backup: "(585) 555-0199",
          return_instructions: "Return window 6-12 weeks post-TKR/THR",
          priority_scheduling_instructions: "Call directly for priority scheduling",
          user_id: user.id,
          clinic_id,
        },
        {
          name: "Dr. Jennifer Walsh",
          group_name: "Summit Spine & Sports",
          subspecialty: "Spine Surgery",
          location: "Victor, NY",
          preferred_return_method: "Email",
          fax_or_email_backup: "referrals@summitspine.com",
          return_instructions: "Post-fusion patients return 8-16 weeks for rehab clearance",
          priority_scheduling_instructions: "Online priority scheduling portal available",
          user_id: user.id,
          clinic_id,
        },
      ];

      const { data: insertedPartners, error: partnersError } = await supabase
        .from("ortho_partners")
        .insert(orthoPartners)
        .select();

      if (partnersError) throw partnersError;

      // Create sample episodes with referrals
      const sampleEpisodes = [
        {
          id: crypto.randomUUID(),
          patient_name: "James Rodriguez",
          region: "Knee",
          date_of_service: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_of_birth: "1978-06-15",
          diagnosis: "Meniscal Tear",
          current_status: "REFERRED_TO_ORTHO" as const,
          has_ortho_referral: true,
          user_id: user.id,
          clinic_id,
        },
        {
          id: crypto.randomUUID(),
          patient_name: "Maria Santos",
          region: "Shoulder",
          date_of_service: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_of_birth: "1985-03-22",
          diagnosis: "Rotator Cuff Tear",
          current_status: "SURGERY_COMPLETED" as const,
          surgery_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          surgery_performed: true,
          has_ortho_referral: true,
          return_to_registry_required: true,
          user_id: user.id,
          clinic_id,
        },
        {
          id: crypto.randomUUID(),
          patient_name: "Robert Chen",
          region: "Spine",
          date_of_service: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_of_birth: "1965-11-08",
          diagnosis: "Lumbar Disc Herniation",
          current_status: "ORTHO_REHAB_COMPLETED" as const,
          surgery_date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          surgery_performed: true,
          has_ortho_referral: true,
          return_to_registry_required: true,
          user_id: user.id,
          clinic_id,
        },
      ];

      const { data: insertedEpisodes, error: episodesError } = await supabase
        .from("episodes")
        .insert(sampleEpisodes)
        .select();

      if (episodesError) throw episodesError;

      // Create ortho referrals
      if (insertedPartners && insertedEpisodes) {
        const referrals = [
          {
            episode_id: insertedEpisodes[0].id,
            destination_ortho_id: insertedPartners[0].id,
            referral_reason_primary: "Arthroscopic Procedure Needed",
            procedure_class: "Knee Arthroscopy",
            suspected_procedure_type: "Meniscectomy",
            referral_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority_flag: false,
            return_to_registry_required: true,
            expected_return_window_start: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            expected_return_window_end: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            communication_channel: "Direct Secure Messaging",
            notes_to_ortho: "Conservative treatment unsuccessful. Patient ready for surgical evaluation.",
            user_id: user.id,
            clinic_id,
          },
          {
            episode_id: insertedEpisodes[1].id,
            destination_ortho_id: insertedPartners[0].id,
            referral_reason_primary: "Surgical Repair Required",
            procedure_class: "Shoulder Arthroscopy",
            suspected_procedure_type: "Rotator Cuff Repair",
            referral_date: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority_flag: true,
            return_to_registry_required: true,
            expected_return_window_start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            expected_return_window_end: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            communication_channel: "Direct Secure Messaging",
            notes_to_ortho: "Full thickness tear confirmed on MRI. Excellent PT candidate.",
            user_id: user.id,
            clinic_id,
          },
          {
            episode_id: insertedEpisodes[2].id,
            destination_ortho_id: insertedPartners[2].id,
            referral_reason_primary: "Surgical Repair Required",
            procedure_class: "Spinal Fusion",
            suspected_procedure_type: "L4-L5 Fusion",
            referral_date: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority_flag: false,
            return_to_registry_required: true,
            expected_return_window_start: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            expected_return_window_end: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            communication_channel: "Email",
            notes_to_ortho: "Surgery completed. Patient cleared for advanced rehab.",
            user_id: user.id,
            clinic_id,
          },
        ];

        const { error: referralsError } = await supabase
          .from("ortho_referrals")
          .insert(referrals);

        if (referralsError) throw referralsError;

        // Update episodes with referral IDs
        for (let i = 0; i < insertedEpisodes.length; i++) {
          await supabase
            .from("episodes")
            .update({ referral_id: referrals[i].episode_id })
            .eq("id", insertedEpisodes[i].id);
        }

        // Create ortho tasks for overdue returns
        const tasks = [
          {
            episode_id: insertedEpisodes[2].id,
            task_type: "return_to_ppc",
            description: "Patient overdue for return to PPC - rehab completed, needs final assessment",
            due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: "Open" as const,
            user_id: user.id,
            clinic_id,
          },
        ];

        await supabase.from("ortho_tasks").insert(tasks);
      }

      toast.success("Sample ortho data generated successfully!");
    } catch (error: any) {
      console.error("Error generating sample data:", error);
      toast.error(`Failed to generate sample data: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Generate Sample Ortho Data
        </CardTitle>
        <CardDescription>
          Create realistic sample ortho partners, episodes, and referrals to test the complete workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>This will create:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>3 ortho partners with different specialties</li>
            <li>3 patient episodes with referrals</li>
            <li>Episodes in different stages (referred, surgery completed, rehab completed)</li>
            <li>Return tasks for overdue patients</li>
          </ul>
        </div>
        <Button
          onClick={generateSampleData}
          disabled={generating}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Sample Data...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Sample Data
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Note: This will add data to your account. You can delete it manually later if needed.
        </p>
      </CardContent>
    </Card>
  );
}
