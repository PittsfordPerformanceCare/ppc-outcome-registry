import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ClipboardCheck, Plus, X, Printer, Copy, CheckCircle2, PartyPopper, Download, Home, AlertCircle, Activity, GripVertical, Save, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { SortableComplaintItem } from "@/components/SortableComplaintItem";
import { useHaptics } from "@/hooks/useHaptics";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COMPLAINT_CATEGORIES = [
  "Neck/Cervical",
  "Upper Back/Thoracic", 
  "Lower Back/Lumbar",
  "Shoulder",
  "Elbow",
  "Wrist/Hand",
  "Hip",
  "Knee",
  "Ankle/Foot",
  "Other"
] as const;

const SEVERITY_LEVELS = [
  "Mild",
  "Moderate",
  "Severe"
] as const;

const DURATION_OPTIONS = [
  "Less than 1 week",
  "1-2 weeks",
  "2-4 weeks",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "More than 1 year"
] as const;

const REVIEW_OF_SYSTEMS = {
  "General": [
    "Fever", "Chills", "Night sweats", "Unexplained weight loss", "Unexplained weight gain", 
    "Fatigue", "Weakness", "Loss of appetite"
  ],
  "Cardiovascular": [
    "Chest pain", "Palpitations", "Irregular heartbeat", "Shortness of breath", 
    "Swelling in legs/ankles", "High blood pressure", "History of heart disease"
  ],
  "Respiratory": [
    "Chronic cough", "Wheezing", "Shortness of breath at rest", "Shortness of breath with activity",
    "Asthma", "COPD", "Sleep apnea", "Difficulty breathing when lying flat"
  ],
  "Gastrointestinal": [
    "Nausea", "Vomiting", "Diarrhea", "Constipation", "Abdominal pain", 
    "Blood in stool", "Heartburn/reflux", "Difficulty swallowing", "Change in bowel habits"
  ],
  "Genitourinary": [
    "Urinary frequency", "Urinary urgency", "Painful urination", "Blood in urine",
    "Incontinence", "Kidney stones", "Prostate problems"
  ],
  "Musculoskeletal": [
    "Joint pain", "Joint swelling", "Joint stiffness", "Muscle weakness", 
    "Muscle pain", "Back pain", "Neck pain", "Limited range of motion",
    "Arthritis", "Osteoporosis", "Previous fractures"
  ],
  "Neurological": [
    "Headaches", "Migraines", "Dizziness", "Vertigo", "Fainting", "Seizures",
    "Numbness", "Tingling", "Memory problems", "Balance problems", "Tremors",
    "Vision changes", "Hearing loss"
  ],
  "Psychiatric": [
    "Depression", "Anxiety", "Panic attacks", "Sleep problems", "Mood changes",
    "Stress", "Previous mental health treatment"
  ],
  "Endocrine": [
    "Diabetes", "Thyroid problems", "Excessive thirst", "Excessive urination",
    "Heat/cold intolerance", "Changes in skin/hair"
  ],
  "Hematologic": [
    "Easy bruising", "Easy bleeding", "Anemia", "Blood clots", "Swollen lymph nodes"
  ],
  "Skin": [
    "Rashes", "Itching", "Changes in moles", "Skin lesions", "Excessive dryness",
    "Eczema", "Psoriasis"
  ],
  "ENT (Ears, Nose, Throat)": [
    "Ear pain", "Ringing in ears", "Sinus problems", "Frequent nosebleeds",
    "Sore throat", "Hoarseness", "Difficulty swallowing"
  ]
};

const complaintSchema = z.object({
  text: z.string().min(5, "Please describe this concern (at least 5 characters)").max(1000, "Description is too long"),
  category: z.string().min(1, "Please select a body region/category"),
  severity: z.string().min(1, "Please select a severity level"),
  duration: z.string().min(1, "Please select how long you've had this issue"),
  isPrimary: z.boolean(),
  priority: z.number().min(1).optional(), // 1 = highest priority, 2 = second, etc.
});

const intakeFormSchema = z.object({
  patientName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format").min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").max(255, "Email is too long").optional().or(z.literal("")),
  address: z.string().max(500, "Address is too long").optional(),
  guardianPhone: z.string().regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format").min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  insuranceProvider: z.string().max(100, "Insurance provider name is too long").optional(),
  insuranceId: z.string().max(50, "Insurance ID is too long").optional(),
  billResponsibleParty: z.string().max(100, "Name is too long").optional(),
  emergencyContactName: z.string().max(100, "Name is too long").optional(),
  emergencyContactPhone: z.string().regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format").min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  emergencyContactRelationship: z.string().max(50, "Relationship is too long").optional(),
  referralSource: z.string().max(200, "Referral source is too long").optional(),
  primaryCarePhysician: z.string().max(100, "Name is too long").optional(),
  pcpPhone: z.string().regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format").min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  pcpAddress: z.string().max(300, "Address is too long").optional(),
  referringPhysician: z.string().max(100, "Name is too long").optional(),
  specialistSeen: z.string().max(200, "Information is too long").optional(),
  hospitalizationHistory: z.string().max(1000, "Information is too long").optional(),
  surgeryHistory: z.string().max(1000, "Information is too long").optional(),
  currentMedications: z.string().max(1000, "Information is too long").optional(),
  allergies: z.string().max(500, "Information is too long").optional(),
  medicalHistory: z.string().max(1000, "Information is too long").optional(),
  complaints: z.array(complaintSchema).min(1, "At least one complaint is required").refine(
    (complaints) => {
      // Check if we have priorities set
      const hasPriorities = complaints.some(c => c.priority !== undefined);
      if (hasPriorities) {
        // If priorities are set, validate they're unique and sequential
        const priorities = complaints.filter(c => c.priority).map(c => c.priority).sort();
        const uniquePriorities = new Set(priorities);
        return uniquePriorities.size === priorities.length;
      }
      // Otherwise, check for isPrimary (backwards compatibility)
      return complaints.some(c => c.isPrimary);
    },
    "Please rank your complaints in order of priority (each complaint must have a unique priority)"
  ),
  injuryDate: z.string().optional(),
  injuryMechanism: z.string().max(500, "Description is too long").optional(),
  painLevel: z.number().min(0).max(10),
  symptoms: z.string().max(1000, "Description is too long").optional(),
  reviewOfSystems: z.array(z.string()).default([]),
  consentSignature: z.string().min(1, "Signature is required"),
  consentSignedName: z.string().min(2, "Please type your full name").max(100, "Name is too long"),
  consentDate: z.string().min(1, "Date is required"),
  hipaaAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the HIPAA Privacy Notice"),
  hipaaSignedName: z.string().min(2, "Please type your full name").max(100, "Name is too long"),
  hipaaDate: z.string().min(1, "Date is required"),
  consentClinicUpdates: z.boolean().default(false),
  optOutNewsletter: z.boolean().default(false),
});

type IntakeFormValues = z.infer<typeof intakeFormSchema>;

export default function PatientIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [submittedComplaints, setSubmittedComplaints] = useState<z.infer<typeof complaintSchema>[]>([]);
  const [submittedReviewOfSystems, setSubmittedReviewOfSystems] = useState<string[]>([]);
  const [submittedFormData, setSubmittedFormData] = useState<IntakeFormValues | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [sectionCompletion, setSectionCompletion] = useState({
    personal: false,
    insurance: false,
    emergency: false,
    medical: false,
    reviewOfSystems: false,
    concerns: false,
    consent: false,
    hipaa: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [progressToken, setProgressToken] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRestoringProgress, setIsRestoringProgress] = useState(false);
  const [duplicateEpisodes, setDuplicateEpisodes] = useState<any[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<IntakeFormValues | null>(null);
  const [useTypedSignature, setUseTypedSignature] = useState(false);
  
  const signatureRef = useRef<SignatureCanvas>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { medium, light, success } = useHaptics();
  const isMobile = useIsMobile();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      patientName: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      address: "",
      guardianPhone: "",
      insuranceProvider: "",
      insuranceId: "",
      billResponsibleParty: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      referralSource: "",
      primaryCarePhysician: "",
      pcpPhone: "",
      pcpAddress: "",
      referringPhysician: "",
      specialistSeen: "",
      hospitalizationHistory: "",
      surgeryHistory: "",
      currentMedications: "",
      allergies: "",
      medicalHistory: "",
      complaints: [{ text: "", category: "", severity: "", duration: "", isPrimary: true, priority: 1 }],
      injuryDate: "",
      injuryMechanism: "",
      painLevel: 5,
      symptoms: "",
      reviewOfSystems: [],
      consentSignature: "",
      consentSignedName: "",
      consentDate: new Date().toISOString().split('T')[0],
      hipaaAcknowledged: false,
      hipaaSignedName: "",
      hipaaDate: new Date().toISOString().split('T')[0],
      consentClinicUpdates: false,
      optOutNewsletter: false,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "complaints",
  });

  // Check for resume token on load
  useEffect(() => {
    const token = searchParams.get('resume');
    if (token) {
      loadSavedProgress(token);
    }
  }, [searchParams]);

  // Load saved progress
  const loadSavedProgress = async (token: string) => {
    setIsRestoringProgress(true);
    try {
      const { data, error } = await supabase
        .from('intake_progress')
        .select('*')
        .eq('token', token)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error("Could not find saved progress with this link");
        return;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        toast.error("This save link has expired. Please start a new intake form.");
        return;
      }

      // Restore form data
      const savedData = data.form_data as IntakeFormValues;
      Object.keys(savedData).forEach((key) => {
        form.setValue(key as any, savedData[key as keyof IntakeFormValues]);
      });

      setProgressToken(token);
      setLastSaved(new Date(data.updated_at));
      
      toast.success("Progress restored! Continue where you left off.", { duration: 4000 });
    } catch (error: any) {
      console.error('Error loading progress:', error);
      toast.error("Failed to load saved progress");
    } finally {
      setIsRestoringProgress(false);
    }
  };

  // Generate unique token
  const generateProgressToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Save progress function
  const saveProgress = async () => {
    setIsSaving(true);
    try {
      const values = form.getValues();
      
      // Need at least name to save progress
      if (!values.patientName) {
        toast.error("Please enter your name before saving progress");
        setIsSaving(false);
        return;
      }

      const token = progressToken || generateProgressToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const progressData = {
        token,
        patient_name: values.patientName || null,
        patient_email: values.email || null,
        patient_phone: values.phone || null,
        form_data: values,
        expires_at: expiresAt.toISOString(),
        last_accessed_at: new Date().toISOString()
      };

      if (progressToken) {
        // Update existing progress
        const { error } = await supabase
          .from('intake_progress')
          .update(progressData)
          .eq('token', token);

        if (error) throw error;
      } else {
        // Insert new progress
        const { error } = await supabase
          .from('intake_progress')
          .insert(progressData);

        if (error) throw error;
        setProgressToken(token);
      }

      setLastSaved(new Date());

      // Generate resume link
      const resumeLink = `${window.location.origin}/patient-intake?resume=${token}`;

      toast.success(
        <div className="space-y-2">
          <p className="font-semibold">Progress saved!</p>
          <p className="text-sm">You can resume anytime using this link:</p>
          <div className="flex gap-2">
            <Input 
              value={resumeLink} 
              readOnly 
              className="text-xs h-8"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => {
                navigator.clipboard.writeText(resumeLink);
                toast.success("Link copied!");
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Link expires in 7 days</p>
        </div>,
        { duration: 10000 }
      );
    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast.error("Failed to save progress");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle drag end
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Haptic feedback when picking up complaint
    medium();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      // Light haptic for cancelled drag
      light();
      return;
    }

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Move the item in the array
      move(oldIndex, newIndex);

      // Success haptic for successful reorder
      success();

      // Update priorities after reordering
      setTimeout(() => {
        const complaints = form.getValues('complaints');
        complaints.forEach((_, i) => {
          form.setValue(`complaints.${i}.priority`, i + 1);
          form.setValue(`complaints.${i}.isPrimary`, i === 0);
        });
        toast.success("Complaints reordered");
      }, 0);
    } else {
      // Light haptic for failed reorder
      light();
    }
  };

  // Calculate form completion percentage
  useEffect(() => {
    const subscription = form.watch((values) => {
      let completedSections = 0;
      let totalSections = 8;

      // 1. Personal Information (required fields)
      const personalComplete = !!(values.patientName && values.dateOfBirth);
      if (personalComplete) completedSections += 1;

      // 2. Insurance Information (at least one field)
      const insuranceComplete = !!(values.insuranceProvider || values.insuranceId);
      if (insuranceComplete) completedSections += 1;

      // 3. Emergency Contact (at least name)
      const emergencyComplete = !!values.emergencyContactName;
      if (emergencyComplete) completedSections += 1;

      // 4. Medical Information (at least one field)
      const medicalComplete = !!(values.primaryCarePhysician || values.currentMedications || values.allergies || values.medicalHistory);
      if (medicalComplete) completedSections += 1;

      // 5. Review of Systems (at least one selected)
      const rosComplete = !!(values.reviewOfSystems && values.reviewOfSystems.length > 0);
      if (rosComplete) completedSections += 1;

      // 6. Areas of Concern (at least one complete complaint with pain/symptom info)
      const hasCompleteComplaint = values.complaints?.some(
        (c) => c.text && c.category && c.severity && c.duration
      );
      const hasSymptomInfo = !!(values.symptoms || values.injuryDate || values.injuryMechanism);
      const concernsComplete = !!(hasCompleteComplaint && hasSymptomInfo);
      if (concernsComplete) completedSections += 1;

      // 7. Informed Consent (signature and name)
      const consentComplete = !!(values.consentSignature && values.consentSignedName);
      if (consentComplete) completedSections += 1;

      // 8. HIPAA Acknowledgment (checked and name)
      const hipaaComplete = !!(values.hipaaAcknowledged && values.hipaaSignedName);
      if (hipaaComplete) completedSections += 1;

      const percentage = Math.round((completedSections / totalSections) * 100);
      setCompletionPercentage(percentage);
      
      // Trigger celebration when 100% complete (only once)
      if (percentage === 100 && !hasTriggeredConfetti) {
        setHasTriggeredConfetti(true);
        toast.success("🎉 Amazing! Your form is 100% complete!");
      }
      
      setSectionCompletion({
        personal: personalComplete,
        insurance: insuranceComplete,
        emergency: emergencyComplete,
        medical: medicalComplete,
        reviewOfSystems: rosComplete,
        concerns: concernsComplete,
        consent: consentComplete,
        hipaa: hipaaComplete,
      });
    });

    return () => subscription.unsubscribe();
  }, [form, hasTriggeredConfetti]);

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Check for duplicate patients
  const checkForDuplicates = async (name: string, dob: string) => {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('id, patient_name, date_of_birth, region, diagnosis, date_of_service, discharge_date')
        .ilike('patient_name', name)
        .eq('date_of_birth', dob)
        .is('discharge_date', null) // Only check active episodes
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return [];
    }
  };

  const onSubmit = async (data: IntakeFormValues) => {
    // Check for duplicates first
    const duplicates = await checkForDuplicates(data.patientName, data.dateOfBirth);
    
    if (duplicates.length > 0) {
      setDuplicateEpisodes(duplicates);
      setPendingSubmitData(data);
      setShowDuplicateWarning(true);
      return;
    }

    // Proceed with submission
    await submitIntakeForm(data);
  };

  const submitIntakeForm = async (data: IntakeFormValues) => {
    try {
      const code = generateAccessCode();
      
      // Get referral code from session storage if it exists
      const referralCode = sessionStorage.getItem("referral_code");
      
      const primaryComplaint = data.complaints.find(c => c.isPrimary);
      
      const { error } = await supabase
        .from("intake_forms")
        .insert({
          access_code: code,
          patient_name: data.patientName,
          date_of_birth: data.dateOfBirth,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
          guardian_phone: data.guardianPhone || null,
          insurance_provider: data.insuranceProvider || null,
          insurance_id: data.insuranceId || null,
          bill_responsible_party: data.billResponsibleParty || null,
          emergency_contact_name: data.emergencyContactName || null,
          emergency_contact_phone: data.emergencyContactPhone || null,
          emergency_contact_relationship: data.emergencyContactRelationship || null,
          referral_source: data.referralSource || null,
          primary_care_physician: data.primaryCarePhysician || null,
          pcp_phone: data.pcpPhone || null,
          pcp_address: data.pcpAddress || null,
          referring_physician: data.referringPhysician || null,
          specialist_seen: data.specialistSeen || null,
          hospitalization_history: data.hospitalizationHistory || null,
          surgery_history: data.surgeryHistory || null,
          current_medications: data.currentMedications || null,
          allergies: data.allergies || null,
          medical_history: data.medicalHistory || null,
          chief_complaint: primaryComplaint?.text || data.complaints[0]?.text || "",
          complaints: data.complaints,
          injury_date: data.injuryDate || null,
          injury_mechanism: data.injuryMechanism || null,
          pain_level: data.painLevel,
          symptoms: data.symptoms || null,
          review_of_systems: data.reviewOfSystems,
          consent_signature: data.consentSignature,
          consent_signed_name: data.consentSignedName,
          consent_date: data.consentDate,
          hipaa_acknowledged: data.hipaaAcknowledged,
          hipaa_signed_name: data.hipaaSignedName,
          hipaa_date: data.hipaaDate,
          consent_clinic_updates: data.consentClinicUpdates,
          opt_out_newsletter: data.optOutNewsletter,
          referral_code: referralCode,
          status: "pending"
        });

      if (error) throw error;

      // If there's a referral code, update the referral record
      if (referralCode) {
        const { data: insertedData } = await supabase
          .from("intake_forms")
          .select("id")
          .eq("access_code", code)
          .single();

        if (insertedData) {
          await supabase
            .from("patient_referrals")
            .update({
              referred_patient_email: data.email,
              referred_patient_name: data.patientName,
              intake_form_id: insertedData.id,
              status: "completed",
              intake_submitted_at: new Date().toISOString(),
            })
            .eq("referral_code", referralCode);
          
          // Clear from session storage
          sessionStorage.removeItem("referral_code");
        }
      }

      setAccessCode(code);
      setSubmittedComplaints(data.complaints);
      setSubmittedReviewOfSystems(data.reviewOfSystems);
      setSubmittedFormData(data);
      
      // Mark progress as completed if it exists
      if (progressToken) {
        try {
          await supabase
            .from('intake_progress')
            .update({ completed: true })
            .eq('token', progressToken);
        } catch (err) {
          console.error('Error marking progress as complete:', err);
          // Don't fail the submission if this fails
        }
      }
      
      setSubmitted(true);
      toast.success("Intake form submitted successfully!");
    } catch (error: any) {
      toast.error(`Failed to submit form: ${error.message}`);
    }
  };

  const handleProceedWithDuplicate = async () => {
    setShowDuplicateWarning(false);
    if (pendingSubmitData) {
      await submitIntakeForm(pendingSubmitData);
      setPendingSubmitData(null);
    }
  };

  const handleCancelSubmit = () => {
    setShowDuplicateWarning(false);
    setPendingSubmitData(null);
    setDuplicateEpisodes([]);
    toast.info("Submission cancelled. Please review the existing episodes.");
  };

  const generatePDF = () => {
    if (!submittedFormData) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to check if we need a new page
    const checkPageBreak = (height: number) => {
      if (yPosition + height > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      checkPageBreak(lines.length * fontSize * 0.5);
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * fontSize * 0.5 + 3;
    };

    // Title
    pdf.setFillColor(165, 28, 48); // Primary color
    pdf.rect(0, 0, pageWidth, 30, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Patient Intake Form", pageWidth / 2, 20, { align: "center" });
    
    yPosition = 40;
    pdf.setTextColor(0, 0, 0);

    // Access Code
    addText(`Access Code: ${accessCode}`, 14, true);
    yPosition += 5;

    // Personal Information
    addText("PERSONAL INFORMATION", 12, true);
    addText(`Name: ${submittedFormData.patientName}`);
    addText(`Date of Birth: ${submittedFormData.dateOfBirth}`);
    if (submittedFormData.phone) addText(`Phone: ${submittedFormData.phone}`);
    if (submittedFormData.email) addText(`Email: ${submittedFormData.email}`);
    if (submittedFormData.address) addText(`Address: ${submittedFormData.address}`);
    yPosition += 5;

    // Insurance Information
    if (submittedFormData.insuranceProvider || submittedFormData.insuranceId) {
      addText("INSURANCE INFORMATION", 12, true);
      if (submittedFormData.insuranceProvider) addText(`Provider: ${submittedFormData.insuranceProvider}`);
      if (submittedFormData.insuranceId) addText(`Insurance ID: ${submittedFormData.insuranceId}`);
      if (submittedFormData.billResponsibleParty) addText(`Responsible Party: ${submittedFormData.billResponsibleParty}`);
      yPosition += 5;
    }

    // Emergency Contact
    if (submittedFormData.emergencyContactName) {
      addText("EMERGENCY CONTACT", 12, true);
      addText(`Name: ${submittedFormData.emergencyContactName}`);
      if (submittedFormData.emergencyContactPhone) addText(`Phone: ${submittedFormData.emergencyContactPhone}`);
      if (submittedFormData.emergencyContactRelationship) addText(`Relationship: ${submittedFormData.emergencyContactRelationship}`);
      yPosition += 5;
    }

    // Medical History
    addText("MEDICAL HISTORY", 12, true);
    if (submittedFormData.primaryCarePhysician) addText(`Primary Care Physician: ${submittedFormData.primaryCarePhysician}`);
    if (submittedFormData.currentMedications) addText(`Current Medications: ${submittedFormData.currentMedications}`);
    if (submittedFormData.allergies) addText(`Allergies: ${submittedFormData.allergies}`);
    if (submittedFormData.medicalHistory) addText(`Medical History: ${submittedFormData.medicalHistory}`);
    yPosition += 5;

    // Chief Complaints
    addText("AREAS OF CONCERN", 12, true);
    submittedFormData.complaints.forEach((complaint, index) => {
      const label = complaint.isPrimary ? "PRIMARY COMPLAINT" : `Additional Concern ${index}`;
      addText(`${label}:`, 10, true);
      addText(`Category: ${complaint.category}`);
      addText(`Severity: ${complaint.severity}`);
      addText(`Duration: ${complaint.duration}`);
      addText(`Description: ${complaint.text}`);
      yPosition += 3;
    });

    if (submittedFormData.painLevel !== undefined) {
      addText(`Pain Level: ${submittedFormData.painLevel}/10`);
    }
    if (submittedFormData.symptoms) addText(`Symptoms: ${submittedFormData.symptoms}`);
    yPosition += 5;

    // Review of Systems
    if (submittedFormData.reviewOfSystems.length > 0) {
      addText("REVIEW OF SYSTEMS", 12, true);
      addText(`Selected Symptoms (${submittedFormData.reviewOfSystems.length}):`, 10, true);
      submittedFormData.reviewOfSystems.forEach(symptom => {
        addText(`• ${symptom}`, 9);
      });
      yPosition += 5;
    }

    // Consent Information
    checkPageBreak(80);
    addText("INFORMED CONSENT", 12, true);
    addText(`Signed Name: ${submittedFormData.consentSignedName}`);
    addText(`Date: ${submittedFormData.consentDate}`);
    addText("Digital Signature:", 10, true);
    yPosition += 3;
    
    // Add signature image if available
    if (submittedFormData.consentSignature) {
      try {
        const signatureHeight = 30;
        const signatureWidth = 80;
        checkPageBreak(signatureHeight + 10);
        pdf.addImage(
          submittedFormData.consentSignature,
          'PNG',
          margin,
          yPosition,
          signatureWidth,
          signatureHeight
        );
        yPosition += signatureHeight + 5;
      } catch (error) {
        console.error("Error adding signature to PDF:", error);
        addText("[Signature could not be rendered]");
      }
    }
    yPosition += 5;

    // HIPAA Acknowledgment
    addText("HIPAA PRIVACY NOTICE", 12, true);
    addText(`Acknowledged: ${submittedFormData.hipaaAcknowledged ? "Yes" : "No"}`);
    addText(`Signed Name: ${submittedFormData.hipaaSignedName}`);
    addText(`Date: ${submittedFormData.hipaaDate}`);
    yPosition += 10;

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Generated on ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // Save the PDF
    pdf.save(`intake-form-${accessCode}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  if (submitted) {
    const primaryComplaint = submittedComplaints.find(c => c.isPrimary);
    const otherComplaints = submittedComplaints.filter(c => !c.isPrimary);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Form Submitted!</CardTitle>
            <CardDescription>Thank you for completing your intake form</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Your access code:</p>
              <p className="text-3xl font-bold tracking-wider">{accessCode}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Please save this code. Our staff will use it to process your information.
              </p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(accessCode);
                  toast.success("Access code copied to clipboard!");
                }}
                variant="outline"
                size="sm"
                className="mt-3 print:hidden"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Access Code
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Summary of Your Concerns</h3>
              
              {primaryComplaint && (
                <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge className="bg-primary text-primary-foreground">🎯 Priority</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">{primaryComplaint.category}</Badge>
                    <Badge variant={
                      primaryComplaint.severity === "Severe" ? "destructive" : 
                      primaryComplaint.severity === "Moderate" ? "default" : 
                      "secondary"
                    }>
                      {primaryComplaint.severity}
                    </Badge>
                    <Badge variant="outline">{primaryComplaint.duration}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{primaryComplaint.text}</p>
                </div>
              )}

              {otherComplaints.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Additional Concerns:</p>
                  {otherComplaints.map((complaint, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-card">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{complaint.category}</Badge>
                        <Badge variant={
                          complaint.severity === "Severe" ? "destructive" : 
                          complaint.severity === "Moderate" ? "default" : 
                          "secondary"
                        }>
                          {complaint.severity}
                        </Badge>
                        <Badge variant="outline">{complaint.duration}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{complaint.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {submittedReviewOfSystems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Review of Systems</h3>
                  <Badge variant="secondary" className="text-xs">
                    {submittedReviewOfSystems.length} selected
                  </Badge>
                </div>
                <div className="border rounded-lg p-4 bg-card">
                  <div className="space-y-3">
                    {Object.entries(REVIEW_OF_SYSTEMS).map(([system, systemSymptoms]) => {
                      const selectedSymptoms = systemSymptoms.filter(symptom => 
                        submittedReviewOfSystems.includes(symptom)
                      );
                      
                      if (selectedSymptoms.length === 0) return null;
                      
                      return (
                        <div key={system} className="space-y-2">
                          <h4 className="font-medium text-sm text-foreground">{system}</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedSymptoms.map((symptom) => (
                              <Badge key={symptom} variant="secondary" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-center text-muted-foreground">
              A staff member will review your information shortly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
              <Button 
                onClick={generatePDF} 
                className="w-full"
                variant="default"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                onClick={() => window.print()} 
                className="w-full"
                variant="outline"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Summary
              </Button>
            </div>

            <Button 
              onClick={() => navigate("/")} 
              className="w-full print:hidden"
              variant="secondary"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 py-8">
      <PWAInstallPrompt />
      <div className="mx-auto max-w-3xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">New Patient Intake Form</CardTitle>
            <CardDescription>
              Please complete this form to help us prepare for your visit
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Progress Indicator */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Form Completion</span>
                  {completionPercentage === 100 && (
                    <PartyPopper className="h-4 w-4 text-success animate-scale-in" />
                  )}
                </div>
                <span className="text-muted-foreground">{completionPercentage}%</span>
              </div>
              <Progress 
                value={completionPercentage} 
                className={`h-2 transition-all duration-500 ${
                  completionPercentage === 100 ? 'animate-pulse' : ''
                }`}
              />
              {completionPercentage === 100 ? (
                <p className="text-xs text-success font-medium animate-fade-in">
                  ✨ Perfect! Your form is complete and ready to submit
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Complete all sections for the best care experience
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Progress */}
        {!isRestoringProgress && (
          <Card className="mb-6 border-dashed">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Save & Resume Later</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Save your progress and return anytime within 7 days
                  </p>
                  {lastSaved && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveProgress}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Progress
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isRestoringProgress && (
          <Card className="mb-6 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5 animate-spin" />
                <span className="font-medium">Restoring your saved progress...</span>
              </div>
            </CardContent>
          </Card>
        )}

        <TooltipProvider>
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Personal Information</CardTitle>
                  {sectionCompletion.personal && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CheckCircle2 className="h-5 w-5 text-success animate-scale-in cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Section complete: Name and date of birth provided</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardianPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Phone (if under 18)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Required if patient is under 18" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Insurance Information</CardTitle>
                  {sectionCompletion.insurance && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CheckCircle2 className="h-5 w-5 text-success animate-scale-in cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Section complete: Insurance provider or ID provided</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="insuranceProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Provider</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="insuranceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance ID</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="billResponsibleParty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who is responsible for the bill?</FormLabel>
                      <FormControl>
                        <Input placeholder="Self, Spouse, Parent, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Emergency Contact</CardTitle>
                  {sectionCompletion.emergency && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CheckCircle2 className="h-5 w-5 text-success animate-scale-in cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Section complete: Emergency contact name provided</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContactRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Spouse, Parent" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Medical Information</CardTitle>
                  {sectionCompletion.medical && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CheckCircle2 className="h-5 w-5 text-success animate-scale-in cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Section complete: At least one medical field provided</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="referralSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did you hear about us? (Referral Source)</FormLabel>
                      <FormControl>
                        <Input placeholder="Friend, doctor referral, online search, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="primaryCarePhysician"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Care Physician (PCP)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pcpPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PCP Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pcpAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PCP Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referringPhysician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referring Physician (if any)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialistSeen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Have you seen a specialist? If so, who?</FormLabel>
                      <FormControl>
                        <Input placeholder="Specialist name and specialty" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hospitalizationHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Have you ever been hospitalized?</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please describe any hospitalizations" rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surgeryHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please list any surgeries</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List all previous surgeries and approximate dates" rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentMedications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Medications</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List all medications you are currently taking" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List any drug allergies or other relevant allergies" rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Relevant Medical History</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Chronic conditions, family history, etc." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Review of Systems */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Review of Systems</CardTitle>
                  {sectionCompletion.reviewOfSystems && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CheckCircle2 className="h-5 w-5 text-success animate-scale-in cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Section complete: At least one symptom selected</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <CardDescription>
                  Please check any symptoms you are currently experiencing or have experienced recently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="reviewOfSystems"
                  render={() => (
                    <FormItem>
                      <Accordion type="multiple" className="w-full">
                        {Object.entries(REVIEW_OF_SYSTEMS).map(([system, symptoms]) => (
                          <AccordionItem key={system} value={system}>
                            <AccordionTrigger className="text-base font-semibold">
                              {system}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                {symptoms.map((symptom) => (
                                  <FormField
                                    key={symptom}
                                    control={form.control}
                                    name="reviewOfSystems"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={symptom}
                                          className="flex flex-row items-start space-x-2 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(symptom)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, symptom])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== symptom
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal cursor-pointer">
                                            {symptom}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Areas of Concern */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Areas of Concern - What Would You Like Us to Evaluate?</CardTitle>
                  {sectionCompletion.concerns && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CheckCircle2 className="h-5 w-5 text-success animate-scale-in cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Section complete: Concern details and symptoms provided</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <CardDescription>
                  <strong>Drag and drop to reorder</strong> your concerns by treatment priority. The top concern will be treated first, and subsequent concerns will be queued for future treatment episodes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Complaint Overview Summary */}
                {fields.length > 1 && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-2">You're reporting {fields.length} concerns</p>
                      <p className="text-sm text-muted-foreground">
                        We'll create separate treatment episodes for each concern in the priority order you specify. 
                        Priority #1 will be converted to an active episode first, and the rest will be queued for future treatment.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-6">
                      {fields.map((field, index) => (
                        <SortableComplaintItem
                          key={field.id}
                          id={field.id}
                          index={index}
                          complaint={field}
                          form={form}
                          fieldsLength={fields.length}
                          categories={COMPLAINT_CATEGORIES}
                          severityLevels={SEVERITY_LEVELS}
                          durationOptions={DURATION_OPTIONS}
                          onRemove={() => {
                            remove(index);
                            toast.success("Concern removed");
                            // Reorder remaining priorities
                            setTimeout(() => {
                              const remaining = form.getValues('complaints');
                              remaining.forEach((_, i) => {
                                form.setValue(`complaints.${i}.priority`, i + 1);
                                form.setValue(`complaints.${i}.isPrimary`, i === 0);
                              });
                            }, 100);
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  <DragOverlay>
                    {activeId ? (
                      <div className="opacity-90 rotate-2 scale-105 transition-transform">
                        {(() => {
                          const draggedIndex = fields.findIndex((f) => f.id === activeId);
                          const draggedComplaint = form.watch(`complaints.${draggedIndex}`);
                          return (
                            <div className="p-5 border-2 border-primary rounded-lg bg-card shadow-2xl">
                              <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                                <GripVertical className="h-5 w-5 text-primary animate-pulse" />
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                  {draggedIndex + 1}
                                </div>
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Priority #{draggedComplaint?.priority || draggedIndex + 1}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {draggedComplaint?.category && (
                                  <p className="text-sm font-semibold text-primary">
                                    {draggedComplaint.category}
                                  </p>
                                )}
                                {draggedComplaint?.text && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {draggedComplaint.text}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const nextPriority = fields.length + 1;
                    append({ 
                      text: "", 
                      category: "", 
                      severity: "", 
                      duration: "", 
                      isPrimary: false,
                      priority: nextPriority 
                    });
                    toast.success(`Concern #${nextPriority} added`);
                  }}
                  className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Another Concern
                </Button>

                {form.formState.errors.complaints?.root && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.complaints.root.message}
                  </p>
                )}

                {/* Additional Details Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Additional Details (Applied to Primary Concern)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These details will be associated with your priority #1 concern
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="injuryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>When did this start?</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="painLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Pain Level (0-10)</FormLabel>
                          <FormControl>
                            <div className="pt-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={10}
                                step={1}
                              />
                              <div className="mt-2 text-center text-2xl font-bold">{field.value}</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="injuryMechanism"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did this happen?</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe how the injury or condition occurred" rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Symptoms</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your symptoms (pain, stiffness, weakness, etc.)" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informed Consent */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Informed Consent for Treatment</CardTitle>
                  {sectionCompletion.consent && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CheckCircle2 className="h-5 w-5 text-success animate-scale-in cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Section complete: Signature and consent provided</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <CardDescription>
                  Please read and sign the informed consent below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg text-sm space-y-3 max-h-60 overflow-y-auto">
                  <p className="font-semibold">CONSENT FOR TREATMENT</p>
                  <p>
                    I hereby request and consent to chiropractic and rehabilitative care treatment and related healthcare services. 
                    I understand that the practice of rehabilitative medicine involves the assessment, treatment, and prevention
                    of physical impairments, functional limitations, and disabilities.
                  </p>
                  <p>
                    I understand that various forms of treatment may be used during my care, including but not limited to: 
                    spinal adjustments, manual therapy, therapeutic exercise, modalities (heat, cold, electrical stimulation), and other interventions 
                    as deemed appropriate by my healthcare provider.
                  </p>
                  <p>
                    I have been informed of the potential benefits and risks of treatment. I understand that while treatment 
                    is designed to help, there are no guarantees of specific results. I acknowledge that my healthcare provider 
                    has answered my questions regarding treatment to my satisfaction.
                  </p>
                  <p>
                    I understand that I have the right to refuse treatment at any time and that I may withdraw this consent 
                    at any time by notifying my healthcare provider.
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="consentSignature"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Signature *</FormLabel>
                          {isMobile && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUseTypedSignature(!useTypedSignature);
                                if (!useTypedSignature) {
                                  // Switching to typed - generate signature from typed name
                                  const name = form.getValues('consentSignedName');
                                  if (name) {
                                    // Create a simple text-based signature image
                                    const canvas = document.createElement('canvas');
                                    canvas.width = 400;
                                    canvas.height = 100;
                                    const ctx = canvas.getContext('2d');
                                    if (ctx) {
                                      ctx.font = '30px "Dancing Script", cursive';
                                      ctx.fillStyle = '#000';
                                      ctx.fillText(name, 20, 60);
                                      field.onChange(canvas.toDataURL());
                                    }
                                  }
                                } else {
                                  // Switching to drawn - clear the field
                                  field.onChange("");
                                  if (signatureRef.current) {
                                    signatureRef.current.clear();
                                  }
                                }
                              }}
                              className="text-xs"
                            >
                              {useTypedSignature ? "Draw Instead" : "Type Instead"}
                            </Button>
                          )}
                        </div>
                        
                        {useTypedSignature || (isMobile && !field.value) ? (
                          <>
                            <FormDescription>
                              Your typed name will serve as your digital signature
                            </FormDescription>
                            <FormControl>
                              <div className="space-y-2">
                                <Input
                                  placeholder="Type your full legal name"
                                  value={form.watch('consentSignedName')}
                                  onChange={(e) => {
                                    const name = e.target.value;
                                    form.setValue('consentSignedName', name);
                                    
                                    // Generate signature image from typed name
                                    if (name) {
                                      const canvas = document.createElement('canvas');
                                      canvas.width = 400;
                                      canvas.height = 100;
                                      const ctx = canvas.getContext('2d');
                                      if (ctx) {
                                        ctx.font = '30px "Dancing Script", cursive';
                                        ctx.fillStyle = '#000';
                                        ctx.textAlign = 'left';
                                        ctx.textBaseline = 'middle';
                                        ctx.fillText(name, 20, 50);
                                        field.onChange(canvas.toDataURL());
                                      }
                                    } else {
                                      field.onChange("");
                                    }
                                  }}
                                  className="text-lg"
                                />
                                {field.value && (
                                  <div className="border-2 border-input rounded-md p-4 bg-muted/30">
                                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                    <img 
                                      src={field.value} 
                                      alt="Signature preview" 
                                      className="h-16 mx-auto"
                                    />
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                By typing your name, you agree this serves as your legal electronic signature
                              </AlertDescription>
                            </Alert>
                          </>
                        ) : (
                          <>
                            <FormDescription>
                              Please sign in the box below using your mouse or finger
                            </FormDescription>
                            <FormControl>
                              <div className="border-2 border-input rounded-md">
                                <SignatureCanvas
                                  ref={signatureRef}
                                  canvasProps={{
                                    className: "w-full h-40 rounded-md",
                                  }}
                                  onEnd={() => {
                                    if (signatureRef.current) {
                                      const dataUrl = signatureRef.current.toDataURL();
                                      field.onChange(dataUrl);
                                    }
                                  }}
                                />
                              </div>
                            </FormControl>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (signatureRef.current) {
                                    signatureRef.current.clear();
                                    field.onChange("");
                                    toast.success("Signature cleared");
                                  }
                                }}
                                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Clear Signature
                              </Button>
                            </div>
                          </>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="consentSignedName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type Your Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="consentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HIPAA Privacy Notice */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>HIPAA Privacy Notice Acknowledgment</CardTitle>
                  {sectionCompletion.hipaa && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CheckCircle2 className="h-5 w-5 text-success animate-scale-in cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Section complete: HIPAA notice acknowledged</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <CardDescription>
                  Please read and acknowledge our HIPAA Privacy Notice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg text-sm space-y-3 max-h-60 overflow-y-auto">
                  <p className="font-semibold">NOTICE OF PRIVACY PRACTICES</p>
                  <p>
                    This notice describes how medical information about you may be used and disclosed and how you can 
                    get access to this information. Please review it carefully.
                  </p>
                  <p className="font-semibold">YOUR RIGHTS:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>You have the right to inspect and copy your health information</li>
                    <li>You have the right to request a restriction on certain uses and disclosures of your information</li>
                    <li>You have the right to request to receive confidential communications of your health information</li>
                    <li>You have the right to request an amendment to your health information</li>
                    <li>You have the right to receive an accounting of disclosures of your health information</li>
                    <li>You have the right to obtain a paper copy of this notice</li>
                  </ul>
                  <p className="font-semibold">OUR USES AND DISCLOSURES:</p>
                  <p>
                    We may use and disclose your health information for treatment, payment, and healthcare operations purposes. 
                    We may also use and disclose your health information as required or permitted by law. Your health information 
                    will not be shared without your authorization except as described in our full Privacy Notice.
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="hipaaAcknowledged"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I acknowledge that I have received and reviewed the HIPAA Privacy Notice *
                          </FormLabel>
                          <FormDescription>
                            You must acknowledge to continue
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="hipaaSignedName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type Your Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hipaaDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="consentClinicUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          Yes, I would like to receive clinic updates and appointment reminders
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="optOutNewsletter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          I do not wish to receive newsletters or promotional materials
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit Intake Form"}
            </Button>
          </form>
        </Form>
        </TooltipProvider>

        {/* Duplicate Patient Warning Dialog */}
        <AlertDialog open={showDuplicateWarning} onOpenChange={setShowDuplicateWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Possible Duplicate Patient Found
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  We found {duplicateEpisodes.length} active episode{duplicateEpisodes.length > 1 ? 's' : ''} for a patient with the same name and date of birth:
                </p>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {duplicateEpisodes.map((episode, index) => (
                    <div key={episode.id} className="border rounded-lg p-3 bg-muted/50">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{episode.patient_name}</span>
                          <Badge variant="outline" className="text-xs">
                            Episode {index + 1}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {episode.region && <p><strong>Region:</strong> {episode.region}</p>}
                          {episode.diagnosis && <p><strong>Diagnosis:</strong> {episode.diagnosis}</p>}
                          <p><strong>Service Date:</strong> {new Date(episode.date_of_service).toLocaleDateString()}</p>
                          <p className="text-warning font-medium">⚠️ Active (not discharged)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <p className="text-sm font-medium">What would you like to do?</p>
                  <ul className="text-xs mt-2 space-y-1 text-muted-foreground">
                    <li>• <strong>Cancel:</strong> Review the existing episodes before submitting a new intake form</li>
                    <li>• <strong>Continue:</strong> Submit this intake form as a new episode (e.g., for a different complaint)</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelSubmit}>
                Cancel Submission
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleProceedWithDuplicate}>
                Continue Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
