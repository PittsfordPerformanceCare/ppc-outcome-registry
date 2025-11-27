import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function SampleDataGenerator() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  const generateSampleData = async () => {
    if (!user) {
      toast.error("You must be logged in to generate sample data");
      return;
    }

    setGenerating(true);
    try {
      // Get user's clinic_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      const clinicId = profile?.clinic_id || null;

      // 1. Create sample episodes
      const episodes = [
        {
          id: "EP-2025-001",
          patient_name: "John Smith",
          region: "lumbar_spine",
          diagnosis: "lumbar_strain",
          date_of_service: "2025-01-15",
          date_of_birth: "1985-03-20",
          clinician: "Dr. Sarah Johnson",
          pain_pre: 8,
          pain_post: 3,
          cis_pre: 45,
          cis_post: 18,
          visits: "12",
          discharge_date: "2025-03-15",
          user_id: user.id,
          clinic_id: clinicId,
        },
        {
          id: "EP-2025-002",
          patient_name: "Maria Garcia",
          region: "cervical_spine",
          diagnosis: "neck_pain",
          date_of_service: "2025-01-20",
          date_of_birth: "1990-07-12",
          clinician: "Dr. Michael Chen",
          pain_pre: 7,
          pain_post: 2,
          cis_pre: 38,
          cis_post: 12,
          visits: "10",
          discharge_date: "2025-03-10",
          user_id: user.id,
          clinic_id: clinicId,
        },
        {
          id: "EP-2025-003",
          patient_name: "David Wilson",
          region: "shoulder",
          diagnosis: "rotator_cuff",
          date_of_service: "2025-02-01",
          date_of_birth: "1978-11-30",
          clinician: "Dr. Sarah Johnson",
          pain_pre: 9,
          pain_post: 4,
          cis_pre: 52,
          cis_post: 22,
          visits: "8",
          user_id: user.id,
          clinic_id: clinicId,
        },
        {
          id: "EP-2025-004",
          patient_name: "Emily Brown",
          region: "knee",
          diagnosis: "acl_injury",
          date_of_service: "2025-02-10",
          date_of_birth: "1995-05-18",
          clinician: "Dr. Michael Chen",
          pain_pre: 6,
          pain_post: 1,
          cis_pre: 35,
          cis_post: 8,
          visits: "15",
          user_id: user.id,
          clinic_id: clinicId,
        },
      ];

      const { error: episodesError } = await supabase
        .from('episodes')
        .insert(episodes);

      if (episodesError) throw episodesError;

      // 2. Create sample webhook configurations
      const webhooks = [
        {
          name: "Slack Notifications",
          webhook_url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX",
          trigger_type: "high_engagement",
          threshold_value: 3,
          enabled: true,
          user_id: user.id,
          clinic_id: clinicId,
        },
        {
          name: "Email Alert System",
          webhook_url: "https://api.example.com/webhooks/email",
          trigger_type: "low_engagement",
          threshold_value: 0,
          enabled: true,
          user_id: user.id,
          clinic_id: clinicId,
        },
        {
          name: "CRM Integration",
          webhook_url: "https://api.salesforce.com/webhook/endpoint",
          trigger_type: "any_engagement",
          threshold_value: null,
          enabled: false,
          user_id: user.id,
          clinic_id: clinicId,
        },
      ];

      const { data: webhookConfigs, error: webhooksError } = await supabase
        .from('zapier_webhook_config')
        .insert(webhooks)
        .select();

      if (webhooksError) throw webhooksError;

      // 3. Create sample webhook activity logs
      if (webhookConfigs && webhookConfigs.length > 0) {
        const now = new Date();
        const activityLogs = [];

        for (let i = 0; i < 50; i++) {
          const randomWebhook = webhookConfigs[Math.floor(Math.random() * webhookConfigs.length)];
          const hoursAgo = Math.floor(Math.random() * 48);
          const triggeredAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
          const isSuccess = Math.random() > 0.15; // 85% success rate

          activityLogs.push({
            webhook_config_id: randomWebhook.id,
            webhook_name: randomWebhook.name,
            webhook_url: randomWebhook.webhook_url,
            trigger_type: randomWebhook.trigger_type,
            status: isSuccess ? 'success' : 'failed',
            request_payload: { event: "sample_event", data: { sample: "data" } },
            response_status: isSuccess ? 200 : 500,
            response_body: isSuccess ? '{"status": "ok"}' : '{"error": "Internal server error"}',
            duration_ms: Math.floor(Math.random() * 3000) + 100,
            triggered_at: triggeredAt.toISOString(),
            user_id: user.id,
            clinic_id: clinicId,
            error_message: isSuccess ? null : "Connection timeout",
          });
        }

        const { error: logsError } = await supabase
          .from('webhook_activity_log')
          .insert(activityLogs);

        if (logsError) throw logsError;
      }

      // 4. Create sample notifications history
      const notifications = [
        {
          episode_id: "EP-2025-001",
          patient_name: "John Smith",
          patient_email: "john.smith@example.com",
          clinician_name: "Dr. Sarah Johnson",
          notification_type: "episode_created",
          status: "delivered",
          open_count: 2,
          click_count: 1,
          user_id: user.id,
          clinic_id: clinicId,
        },
        {
          episode_id: "EP-2025-002",
          patient_name: "Maria Garcia",
          patient_email: "maria.garcia@example.com",
          clinician_name: "Dr. Michael Chen",
          notification_type: "followup_reminder",
          status: "delivered",
          open_count: 1,
          click_count: 0,
          user_id: user.id,
          clinic_id: clinicId,
        },
        {
          episode_id: "EP-2025-003",
          patient_name: "David Wilson",
          patient_email: "david.wilson@example.com",
          clinician_name: "Dr. Sarah Johnson",
          notification_type: "appointment_reminder",
          status: "failed",
          retry_count: 3,
          user_id: user.id,
          clinic_id: clinicId,
        },
      ];

      const { error: notificationsError } = await supabase
        .from('notifications_history')
        .insert(notifications);

      if (notificationsError) throw notificationsError;

      // 5. Create sample export templates
      const templates = [
        {
          name: "Monthly Outcomes Report",
          description: "All episodes from the last month with outcome scores",
          export_type: "episodes",
          filters: { date_range: "last_30_days" },
          recipient_emails: ["admin@clinic.com"],
          is_shared: true,
          user_id: user.id,
          clinic_id: clinicId,
        },
        {
          name: "High Pain Reduction Cases",
          description: "Episodes with significant pain reduction",
          export_type: "episodes",
          filters: { min_pain_reduction: 5 },
          recipient_emails: ["quality@clinic.com"],
          is_shared: false,
          user_id: user.id,
          clinic_id: clinicId,
        },
      ];

      const { error: templatesError } = await supabase
        .from('export_templates')
        .insert(templates);

      if (templatesError) throw templatesError;

      // 6. Create sample neurologic exams
      const neuroExams = [
        {
          episode_id: "EP-2025-001",
          exam_date: "2025-01-15",
          exam_time: "09:30",
          exam_type: "baseline",
          clinical_history: "Patient presents with history of concussion 3 weeks ago. Reports persistent headaches, dizziness, and difficulty concentrating.",
          vestibular_rombergs: "Mild instability noted with eyes closed. Patient able to maintain position but with increased sway.",
          vestibular_vor: "Intact bilaterally. No nystagmus observed during head impulse testing.",
          visual_pursuits: "Smooth and accurate in all directions. No saccadic intrusions noted.",
          visual_convergence: "Near point convergence at 8cm. Within normal limits.",
          neuro_finger_to_nose_left: "Smooth and accurate. No dysmetria or intention tremor.",
          neuro_finger_to_nose_right: "Smooth and accurate. No dysmetria or intention tremor.",
          reflex_bicep_left: "2+ Normal",
          reflex_bicep_right: "2+ Normal",
          reflex_patellar_left: "2+ Normal",
          reflex_patellar_right: "2+ Normal",
          overall_notes: "Comprehensive neurologic examination reveals mild vestibular dysfunction consistent with post-concussion syndrome. Visual and coordination systems appear intact. Recommend vestibular rehabilitation therapy focusing on balance and gaze stabilization exercises. Patient should avoid activities with high risk of re-injury. Follow-up exam recommended in 4 weeks to assess progress.",
          user_id: user.id,
          clinic_id: clinicId,
        },
        {
          episode_id: "EP-2025-002",
          exam_date: "2025-01-20",
          exam_time: "14:00",
          exam_type: "baseline",
          clinical_history: "Chronic neck pain following motor vehicle accident 2 months ago. Patient reports radiating pain into left shoulder and numbness in left hand.",
          vestibular_rombergs: "Normal stability with eyes open and closed.",
          vestibular_vor: "Intact bilaterally.",
          visual_pursuits: "Normal smooth pursuits in all directions.",
          visual_convergence: "Within normal limits at 6cm.",
          neuro_finger_to_nose_left: "Accurate with no tremor.",
          neuro_finger_to_nose_right: "Accurate with no tremor.",
          reflex_bicep_left: "1+ Diminished (indicates possible C5-C6 nerve involvement)",
          reflex_bicep_right: "2+ Normal",
          reflex_patellar_left: "2+ Normal",
          reflex_patellar_right: "2+ Normal",
          neuro_2pt_localization_left: "Impaired in C6 dermatome - unable to distinguish points at 5mm",
          neuro_2pt_localization_right: "Normal discrimination",
          overall_notes: "Examination findings consistent with cervical radiculopathy affecting C6 nerve root on the left. Diminished reflex and sensory changes in appropriate distribution. No signs of myelopathy. Recommend cervical traction, nerve gliding exercises, and postural correction. Consider imaging if symptoms do not improve with conservative treatment.",
          user_id: user.id,
          clinic_id: clinicId,
        },
        {
          episode_id: "EP-2025-003",
          exam_date: "2025-03-15",
          exam_time: "10:15",
          exam_type: "followup",
          clinical_history: "Follow-up examination after 8 weeks of vestibular rehabilitation therapy for post-concussion syndrome. Patient reports significant improvement in symptoms.",
          vestibular_rombergs: "Normal stability maintained with eyes open and closed. Marked improvement from baseline.",
          vestibular_vor: "Intact bilaterally. Head impulse test shows appropriate compensatory saccades.",
          visual_pursuits: "Smooth and accurate. No complaints of visual symptoms during testing.",
          visual_convergence: "Near point at 5cm. Excellent improvement.",
          neuro_finger_to_nose_left: "Smooth and accurate.",
          neuro_finger_to_nose_right: "Smooth and accurate.",
          reflex_bicep_left: "2+ Normal",
          reflex_bicep_right: "2+ Normal",
          reflex_patellar_left: "2+ Normal",
          reflex_patellar_right: "2+ Normal",
          overall_notes: "Excellent progress noted on follow-up examination. Vestibular function has normalized with therapy. Patient reports return to most daily activities without symptoms. Balance and coordination testing shows full recovery. Patient cleared to gradually return to sports activities with protective equipment. Recommend continued home exercise program for maintenance.",
          user_id: user.id,
          clinic_id: clinicId,
        },
      ];

      const { error: neuroExamsError } = await supabase
        .from('neurologic_exams')
        .insert(neuroExams);

      if (neuroExamsError) throw neuroExamsError;

      toast.success("Sample data generated successfully including neurologic exams! Refresh your dashboard to see the data.");
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast.error("Failed to generate sample data. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Sample Data Generator
        </CardTitle>
        <CardDescription>
          Generate realistic sample data to explore the dashboard and test features. This will create sample episodes, neurologic exams, webhooks, notifications, and export templates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={generateSampleData}
          disabled={generating}
          className="w-full"
        >
          {generating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Generate Sample Data
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Note: This will add data to your account. You can delete it later from the respective pages.
        </p>
      </CardContent>
    </Card>
  );
}
