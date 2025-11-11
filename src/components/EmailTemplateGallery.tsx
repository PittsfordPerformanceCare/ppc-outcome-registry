import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Eye, Sparkles, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: "professional" | "friendly" | "modern" | "minimal";
  subject: string;
  html: string;
  preview: string;
  isCustom?: boolean;
  clinic_id?: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "professional-welcome",
    name: "Professional Welcome",
    description: "Clean, professional design with branded header and clear call-to-action",
    category: "professional",
    subject: "Your Physical Therapy Episode Has Been Created",
    preview: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background-color: #1e3a8a; padding: 40px 20px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">{{clinic_name}}</h1>
    <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 14px;">Physical Therapy Excellence</p>
  </div>
  
  <div style="padding: 40px 30px;">
    <h2 style="color: #1e3a8a; font-size: 24px; margin: 0 0 20px 0;">Welcome, {{patient_name}}!</h2>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      We are pleased to inform you that your intake form has been reviewed and your physical therapy episode has been successfully created.
    </p>
    
    <div style="background-color: #f1f5f9; border-left: 4px solid #1e3a8a; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1e3a8a; font-size: 18px; margin: 0 0 15px 0;">Episode Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Episode ID:</td>
          <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">{{episode_id}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Assigned Clinician:</td>
          <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">{{clinician_name}}</td>
        </tr>
      </table>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      Our team will contact you within 1-2 business days to schedule your first appointment.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="tel:{{clinic_phone}}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Contact Us</a>
    </div>
  </div>
  
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #64748b; font-size: 12px; margin: 0;">© 2025 {{clinic_name}}. All rights reserved.</p>
  </div>
</div>`
  },
  {
    id: "friendly-celebration",
    name: "Friendly Celebration",
    description: "Warm, welcoming design with celebratory tone and colorful accents",
    category: "friendly",
    subject: "🎉 Welcome to Your Recovery Journey!",
    preview: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop",
    html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 0 0 30px 30px;">
    <div style="background-color: rgba(255,255,255,0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 40px;">🎉</span>
    </div>
    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Great News!</h1>
    <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 16px;">Your journey to recovery begins here</p>
  </div>
  
  <div style="padding: 40px 30px;">
    <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
      Hi <strong style="color: #667eea;">{{patient_name}}</strong>! 👋
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      We are thrilled to welcome you to <strong>{{clinic_name}}</strong>! Your intake form has been carefully reviewed, and we have created your personalized treatment episode.
    </p>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 25px; margin: 25px 0;">
      <h3 style="color: #92400e; font-size: 20px; margin: 0 0 15px 0; display: flex; align-items: center;">
        <span style="margin-right: 10px;">✨</span>
        Your Episode Details
      </h3>
      <div style="background-color: #ffffff; border-radius: 12px; padding: 20px;">
        <p style="margin: 10px 0; color: #78716c; font-size: 14px;">
          <strong style="color: #292524;">Episode ID:</strong> {{episode_id}}
        </p>
        <p style="margin: 10px 0; color: #78716c; font-size: 14px;">
          <strong style="color: #292524;">Your Clinician:</strong> {{clinician_name}}
        </p>
      </div>
    </div>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h4 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">What happens next?</h4>
      <ul style="margin: 0; padding-left: 20px; color: #047857;">
        <li style="margin: 8px 0;">We will call you within 1-2 business days</li>
        <li style="margin: 8px 0;">Schedule your first appointment</li>
        <li style="margin: 8px 0;">Begin your personalized recovery plan</li>
      </ul>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 25px 0;">
      Have questions? We are here to help!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="tel:{{clinic_phone}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">📞 Call {{clinic_phone}}</a>
    </div>
  </div>
  
  <div style="background-color: #fafafa; padding: 30px 20px; text-align: center;">
    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Looking forward to helping you achieve your goals!</p>
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">{{clinic_name}} • {{clinic_phone}}</p>
  </div>
</div>`
  },
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    description: "Contemporary design with gradient accents and clean typography",
    category: "modern",
    subject: "✓ Your Episode Is Ready - {{clinic_name}}",
    preview: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2px;">
    <div style="background: linear-gradient(to right, #0f172a, #1e293b); padding: 50px 30px; text-align: center;">
      <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2px; border-radius: 12px; margin-bottom: 20px;">
        <div style="background-color: #1e293b; padding: 12px 24px; border-radius: 10px;">
          <span style="color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 2px;">EPISODE CONFIRMED</span>
        </div>
      </div>
      <h1 style="color: #ffffff; margin: 20px 0 10px 0; font-size: 36px; font-weight: 700; letter-spacing: -1px;">Welcome Aboard</h1>
      <p style="color: #94a3b8; margin: 0; font-size: 18px;">{{patient_name}}</p>
    </div>
  </div>
  
  <div style="padding: 50px 30px;">
    <div style="border-left: 4px solid; border-image: linear-gradient(to bottom, #667eea, #764ba2) 1; padding-left: 20px; margin-bottom: 30px;">
      <p style="color: #334155; font-size: 18px; line-height: 1.7; margin: 0;">
        Your intake has been processed and your personalized treatment episode is now active. Our team is ready to guide you through your recovery journey.
      </p>
    </div>
    
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 20px; padding: 30px; margin: 30px 0;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 12px; margin-right: 15px;">
          <span style="font-size: 24px;">📋</span>
        </div>
        <h3 style="color: #0f172a; font-size: 20px; margin: 0; font-weight: 600;">Episode Overview</h3>
      </div>
      
      <div style="background-color: #ffffff; border-radius: 12px; padding: 25px;">
        <div style="margin-bottom: 15px;">
          <span style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Episode ID</span>
          <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 5px 0 0 0;">{{episode_id}}</p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; margin: 15px 0;"></div>
        <div>
          <span style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Lead Clinician</span>
          <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 5px 0 0 0;">{{clinician_name}}</p>
        </div>
      </div>
    </div>
    
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
      <h4 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Next Steps</h4>
      <p style="color: #d1fae5; font-size: 15px; line-height: 1.6; margin: 0;">
        Expect a call from our scheduling team within 1-2 business days to set up your initial appointment and answer any questions.
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0 30px 0;">
      <a href="tel:{{clinic_phone}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); transition: all 0.3s;">Contact Us Now</a>
    </div>
    
    <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0;">
      Questions? Reach us at <a href="tel:{{clinic_phone}}" style="color: #667eea; text-decoration: none; font-weight: 600;">{{clinic_phone}}</a>
    </p>
  </div>
  
  <div style="background-color: #0f172a; padding: 30px; text-align: center;">
    <p style="color: #64748b; font-size: 13px; margin: 0 0 5px 0;">{{clinic_name}}</p>
    <p style="color: #475569; font-size: 12px; margin: 0;">© 2025 All rights reserved</p>
  </div>
</div>`
  },
  {
    id: "minimal-clean",
    name: "Minimal & Clean",
    description: "Simple, elegant design focusing on clarity and readability",
    category: "minimal",
    subject: "Episode Created: {{patient_name}}",
    preview: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    html: `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #000000;">
    <h1 style="color: #000000; margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 4px;">{{clinic_name}}</h1>
  </div>
  
  <div style="padding: 0 20px;">
    <p style="color: #000000; font-size: 32px; font-weight: 300; margin: 0 0 30px 0; line-height: 1.3;">
      Hello,<br/>{{patient_name}}
    </p>
    
    <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
      Your intake form has been reviewed and processed. We have created your physical therapy episode and are ready to begin your treatment.
    </p>
    
    <div style="background-color: #f9f9f9; padding: 30px; margin: 30px 0; border-left: 3px solid #000000;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; color: #666666; font-size: 14px; font-weight: 500;">EPISODE ID</td>
          <td style="padding: 12px 0; color: #000000; font-size: 14px; text-align: right;">{{episode_id}}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #666666; font-size: 14px; font-weight: 500; border-top: 1px solid #e5e5e5;">CLINICIAN</td>
          <td style="padding: 12px 0; color: #000000; font-size: 14px; text-align: right; border-top: 1px solid #e5e5e5;">{{clinician_name}}</td>
        </tr>
      </table>
    </div>
    
    <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 25px 0;">
      Our scheduling team will contact you within two business days to arrange your first appointment.
    </p>
    
    <div style="margin: 40px 0; padding: 25px 0; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5;">
      <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Contact</p>
      <p style="color: #000000; font-size: 18px; margin: 0;">
        <a href="tel:{{clinic_phone}}" style="color: #000000; text-decoration: none; border-bottom: 1px solid #000000;">{{clinic_phone}}</a>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
    <p style="color: #999999; font-size: 12px; margin: 0;">{{clinic_name}} © 2025</p>
  </div>
</div>`
  },
  {
    id: "medical-professional",
    name: "Medical Professional",
    description: "Healthcare-focused design with medical aesthetic and trust-building elements",
    category: "professional",
    subject: "Patient Episode Confirmation - {{clinic_name}}",
    preview: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background-color: #047857; padding: 30px; text-align: center;">
    <div style="background-color: #ffffff; border-radius: 50%; width: 60px; height: 60px; margin: 0 auto 15px; display: inline-flex; align-items: center; justify-content: center;">
      <span style="font-size: 30px;">⚕️</span>
    </div>
    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">{{clinic_name}}</h1>
    <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px;">Physical Therapy & Rehabilitation</p>
  </div>
  
  <div style="padding: 40px 30px;">
    <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
      <span style="color: #047857; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">✓ Episode Created Successfully</span>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Dear <strong>{{patient_name}}</strong>,
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
      This letter confirms that your patient intake has been completed and your physical therapy treatment episode has been established in our clinical system.
    </p>
    
    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 25px; margin: 25px 0;">
      <h3 style="color: #047857; font-size: 18px; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 2px solid #10b981;">Clinical Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Patient Name:</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">{{patient_name}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #d1d5db;">Episode Number:</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #d1d5db;">{{episode_id}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #d1d5db;">Assigned Provider:</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #d1d5db;">{{clinician_name}}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0;">
      <h4 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px;">Next Steps in Your Care</h4>
      <ol style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 1.8;">
        <li>Our scheduling coordinator will contact you within 24-48 hours</li>
        <li>Initial evaluation appointment will be scheduled</li>
        <li>Treatment plan will be developed based on your needs</li>
        <li>Regular progress monitoring throughout your episode</li>
      </ol>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 25px 0;">
      Should you have any questions or concerns prior to your first appointment, please do not hesitate to contact our office.
    </p>
    
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Clinical Contact</p>
      <p style="color: #047857; font-size: 22px; font-weight: 600; margin: 0;">
        <a href="tel:{{clinic_phone}}" style="color: #047857; text-decoration: none;">{{clinic_phone}}</a>
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
      Respectfully,<br/>
      <strong style="color: #1f2937;">The {{clinic_name}} Care Team</strong>
    </p>
  </div>
  
  <div style="background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0;">{{clinic_name}} | {{clinic_phone}}</p>
    <p style="color: #9ca3af; font-size: 11px; margin: 0;">This is an automated confirmation. Please do not reply to this email.</p>
  </div>
</div>`
  }
];

interface EmailTemplateGalleryProps {
  onSelectTemplate: (subject: string, html: string) => void;
}

export function EmailTemplateGallery({ onSelectTemplate }: EmailTemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [customTemplates, setCustomTemplates] = useState<EmailTemplate[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCustomTemplates();
  }, []);

  const fetchCustomTemplates = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (!profile?.clinic_id) return;

    const { data, error } = await supabase
      .from("custom_email_templates")
      .select("*")
      .eq("clinic_id", profile.clinic_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching custom templates:", error);
      return;
    }

    if (data) {
      const templates: EmailTemplate[] = data.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || "",
        category: t.category as "professional" | "friendly" | "modern" | "minimal",
        subject: t.subject,
        html: t.html,
        preview: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
        isCustom: true,
        clinic_id: t.clinic_id,
      }));
      setCustomTemplates(templates);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete?.isCustom) return;

    const { error } = await supabase
      .from("custom_email_templates")
      .delete()
      .eq("id", templateToDelete.id);

    if (error) {
      toast.error("Failed to delete template");
      console.error("Error deleting template:", error);
      return;
    }

    toast.success("Template deleted successfully");
    setCustomTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const allTemplates = [...customTemplates, ...EMAIL_TEMPLATES];
  const filteredTemplates = selectedCategory === "all" 
    ? allTemplates 
    : allTemplates.filter(t => t.category === selectedCategory);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "professional": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "friendly": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "modern": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      case "minimal": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Email Template Gallery
        </CardTitle>
        <CardDescription>
          Choose from professionally designed templates and customize them to match your brand
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All Templates
          </Button>
          <Button
            variant={selectedCategory === "professional" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("professional")}
          >
            Professional
          </Button>
          <Button
            variant={selectedCategory === "friendly" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("friendly")}
          >
            Friendly
          </Button>
          <Button
            variant={selectedCategory === "modern" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("modern")}
          >
            Modern
          </Button>
          <Button
            variant={selectedCategory === "minimal" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("minimal")}
          >
            Minimal
          </Button>
        </div>

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                <img 
                  src={template.preview} 
                  alt={template.name}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute top-2 right-2">
                  <div className="flex gap-2">
                    <Badge className={getCategoryBadgeColor(template.category)}>
                      {template.category}
                    </Badge>
                    {template.isCustom && (
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>{template.name}</DialogTitle>
                        <DialogDescription>{template.description}</DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: template.html
                              .replace(/\{\{patient_name\}\}/g, "John Doe")
                              .replace(/\{\{clinician_name\}\}/g, "Dr. Sarah Smith")
                              .replace(/\{\{episode_id\}\}/g, "EP-2025-001")
                              .replace(/\{\{clinic_name\}\}/g, "Acme Physical Therapy")
                              .replace(/\{\{clinic_phone\}\}/g, "(555) 123-4567")
                              .replace(/\{\{clinic_email\}\}/g, "info@acmept.com")
                          }}
                        />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      onSelectTemplate(template.subject, template.html);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  {template.isCustom && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setTemplateToDelete(template);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
