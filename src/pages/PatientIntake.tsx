import { useState, useEffect, lazy, Suspense } from "react";
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
import { ClipboardCheck, Plus, X, Printer, Copy, CheckCircle2, PartyPopper, Download, Home, AlertCircle, Activity, GripVertical, Save, Clock, ChevronRight, ChevronLeft, Loader2, Moon, Sun, Smartphone } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { SortableComplaintItem } from "@/components/SortableComplaintItem";
import { ReturningPatientLookup } from "@/components/ReturningPatientLookup";
import { IntakeWizardSteps } from "@/components/IntakeWizardSteps";
import { useHaptics } from "@/hooks/useHaptics";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
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

// Lazy load heavy components
const SignatureField = lazy(() => import("@/components/intake/SignatureField").then(m => ({ default: m.SignatureField })));

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
  "Brain/Head",
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
  legalName: z.string().max(100, "Name is too long").optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  episodeType: z.enum(["MSK", "Neurology", "Performance"]).default("MSK"),
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
  pcpFax: z.string().regex(/^\+?[\d\s\-()]+$/, "Invalid fax number format").min(10, "Fax number must be at least 10 digits").optional().or(z.literal("")),
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [hasFormChanged, setHasFormChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showReturningPatientLookup, setShowReturningPatientLookup] = useState(true);
  const [hasPrefilledData, setHasPrefilledData] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // Bot protection: form load timestamp and honeypot fields
  const [formLoadedAt] = useState(() => Date.now());
  const [honeypot, setHoneypot] = useState({ website: '', fax: '' });
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [validatedFields, setValidatedFields] = useState<Set<string>>(new Set());
  const [errorFields, setErrorFields] = useState<Set<string>>(new Set());
  
  const wizardSteps = [
    { id: 0, title: "Patient Info", description: "Personal & Contact" },
    { id: 1, title: "Medical History", description: "Health Background" },
    { id: 2, title: "Health Review", description: "Systems Check" },
    { id: 3, title: "Current Concerns", description: "Areas of Pain" },
    { id: 4, title: "Review", description: "Verify Details" },
    { id: 5, title: "Consent", description: "Signatures" },
  ];
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const { medium, light, success } = useHaptics();
  const { isDark, toggleDarkMode } = useDarkMode();
  const isMobile = useIsMobile();
  const { isOnline } = useNetworkStatus();

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
    mode: "onBlur", // Validate on blur instead of onChange for better performance
    reValidateMode: "onChange", // Re-validate on change after first validation
    defaultValues: {
      patientName: "",
      legalName: "",
      dateOfBirth: "",
      episodeType: "MSK",
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
      pcpFax: "",
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
  
  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (!hasFormChanged && !hasPrefilledData && !isRestoringProgress) {
        setHasFormChanged(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, hasFormChanged, hasPrefilledData, isRestoringProgress]);

  // Check for resume token on load
  useEffect(() => {
    const token = searchParams.get('resume');
    if (token) {
      loadSavedProgress(token);
    }
  }, [searchParams]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasFormChanged && !submitted) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasFormChanged, submitted]);

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

  // Save progress function (can be called manually or automatically)
  const saveProgress = async (isAutomatic = false) => {
    if (isAutomatic) {
      setIsAutoSaving(true);
    } else {
      setIsSaving(true);
    }
    
    try {
      const values = form.getValues();
      
      // Need at least name to save progress
      if (!values.patientName) {
        if (!isAutomatic) {
          toast.error("Please enter your name before saving progress");
        }
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
      setHasFormChanged(false);

      // Only show detailed toast for manual saves
      if (!isAutomatic) {
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
      }
    } catch (error: any) {
      console.error('Error saving progress:', error);
      if (!isAutomatic) {
        toast.error("Failed to save progress");
      }
    } finally {
      if (isAutomatic) {
        setIsAutoSaving(false);
      } else {
        setIsSaving(false);
      }
    }
  };

  // Auto-save effect
  useEffect(() => {
    // Don't auto-save if form is submitted or restoring
    if (submitted || isRestoringProgress) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set up auto-save timer if form has changed and has patient name
    const values = form.getValues();
    if (hasFormChanged && values.patientName) {
      autoSaveTimerRef.current = setTimeout(() => {
        saveProgress(true);
      }, 30000); // Auto-save every 30 seconds
    }

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasFormChanged, submitted, isRestoringProgress]);

  // Watch for form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasFormChanged(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

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


  // Handle returning patient selection and pre-fill
  const handleReturningPatientSelect = (patientData: any) => {
    // Pre-fill all the fields
    Object.keys(patientData).forEach((key) => {
      if (patientData[key]) {
        form.setValue(key as any, patientData[key]);
      }
    });
    
    setHasPrefilledData(true);
    setShowReturningPatientLookup(false);
    
    // Trigger haptic feedback
    success();
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
    // Check network connectivity before starting
    if (!navigator.onLine) {
      toast.error("No internet connection", {
        description: "Please connect to the internet before submitting your form.",
      });
      medium();
      return;
    }
    
    setIsSubmitting(true);
    medium(); // Haptic feedback on submit start
    
    try {
      // Check for duplicates first
      const duplicates = await checkForDuplicates(data.patientName, data.dateOfBirth);
      
      if (duplicates.length > 0) {
        setDuplicateEpisodes(duplicates);
        setPendingSubmitData(data);
        setShowDuplicateWarning(true);
        setIsSubmitting(false);
        return;
      }

      // Proceed with submission
      await submitIntakeForm(data);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
    }
  };

  const submitIntakeForm = async (data: IntakeFormValues, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds
    
    setIsSubmitting(true);
    
    // Check network connectivity first
    if (!navigator.onLine) {
      toast.error("No internet connection", {
        description: "Please connect to the internet and try again.",
      });
      setIsSubmitting(false);
      medium();
      return;
    }
    
    try {
      // Get referral code from session storage if it exists
      const referralCode = sessionStorage.getItem("referral_code");
      
      const primaryComplaint = data.complaints.find(c => c.isPrimary);
      
      // Use edge function for rate limiting and bot protection
      const { data: responseData, error } = await supabase.functions.invoke('submit-intake-form', {
        body: {
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
          pcp_fax: data.pcpFax || null,
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
          // Bot detection fields
          website: honeypot.website,
          fax: honeypot.fax,
          _form_loaded_at: formLoadedAt,
        },
      });

      if (error) throw error;
      
      const code = responseData?.access_code;

      // Clear referral code from session storage (edge function handles the update)
      if (referralCode) {
        sessionStorage.removeItem("referral_code");
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
      success(); // Haptic feedback on success
      
      // Send welcome email to patient (non-blocking)
      if (data.email) {
        const firstName = data.patientName.split(' ')[0];
        supabase.functions.invoke('send-intake-welcome-email', {
          body: { email: data.email, firstName }
        }).then(({ error }) => {
          if (error) {
            console.error('Failed to send welcome email:', error);
          } else {
            console.log('Welcome email sent successfully');
          }
        }).catch(err => {
          console.error('Error invoking welcome email function:', err);
        });
      }
      
      // Trigger confetti effect
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const confettiInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(confettiInterval);
          return;
        }

        const particleCount = 3;
        
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.style.position = 'fixed';
          particle.style.width = '10px';
          particle.style.height = '10px';
          particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          particle.style.left = Math.random() * window.innerWidth + 'px';
          particle.style.top = '-10px';
          particle.style.opacity = '1';
          particle.style.borderRadius = '50%';
          particle.style.pointerEvents = 'none';
          particle.style.zIndex = '9999';
          
          document.body.appendChild(particle);
          
          const angle = randomInRange(-30, 30);
          const velocity = randomInRange(3, 6);
          const rotation = randomInRange(0, 360);
          
          let posY = -10;
          let posX = parseFloat(particle.style.left);
          let currentRotation = 0;
          
          const animate = () => {
            posY += velocity;
            posX += Math.sin(angle * Math.PI / 180) * 2;
            currentRotation += 5;
            
            particle.style.top = posY + 'px';
            particle.style.left = posX + 'px';
            particle.style.transform = `rotate(${currentRotation}deg)`;
            particle.style.opacity = String(Math.max(0, 1 - posY / window.innerHeight));
            
            if (posY < window.innerHeight && parseFloat(particle.style.opacity) > 0) {
              requestAnimationFrame(animate);
            } else {
              particle.remove();
            }
          };
          
          requestAnimationFrame(animate);
        }
      }, 50);

      toast.success("Intake form submitted successfully!");
    } catch (error: any) {
      // Check if it's a network error
      const isNetworkError = 
        error.message?.includes('fetch') || 
        error.message?.includes('network') ||
        error.message?.includes('Failed to fetch') ||
        !navigator.onLine;
      
      // Retry logic for network errors
      if (isNetworkError && retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        toast.error(`Connection issue - Retrying (${nextRetry}/${MAX_RETRIES})...`, {
          description: "Please ensure you have a stable internet connection.",
        });
        medium();
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        // Retry
        return submitIntakeForm(data, nextRetry);
      }
      
      // Show appropriate error message
      if (isNetworkError) {
        toast.error("Network error - Unable to submit", {
          description: "Please check your internet connection and try again. Your progress has been saved.",
          duration: 6000,
        });
      } else {
        toast.error("Failed to submit form", {
          description: error.message || "An unexpected error occurred. Please try again.",
          duration: 6000,
        });
      }
      medium(); // Haptic feedback on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedWithDuplicate = async () => {
    setShowDuplicateWarning(false);
    setIsSubmitting(true);
    if (pendingSubmitData) {
      await submitIntakeForm(pendingSubmitData);
      setPendingSubmitData(null);
    }
  };

  const handleCancelSubmit = () => {
    setShowDuplicateWarning(false);
    setPendingSubmitData(null);
    setDuplicateEpisodes([]);
    setIsSubmitting(false);
    toast.info("Submission cancelled. Please review the existing episodes.");
  };
  
  // Handle navigation with unsaved changes warning
  const handleNavigationAttempt = (path: string) => {
    if (hasFormChanged && !submitted) {
      setPendingNavigation(path);
      setShowExitWarning(true);
    } else {
      navigate(path);
    }
  };
  
  const handleConfirmExit = () => {
    setShowExitWarning(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };
  
  const handleCancelExit = () => {
    setShowExitWarning(false);
    setPendingNavigation(null);
  };

  // Wizard step validation - only validate required fields for current step
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    let fieldsToValidate: (keyof IntakeFormValues)[] = [];
    
    switch (stepIndex) {
      case 0: // Patient Info
        fieldsToValidate = ["patientName", "dateOfBirth", "episodeType"];
        break;
      case 1: // Medical History
        return true; // All fields optional
      case 2: // Health Review  
        return true; // All fields optional
      case 3: // Current Concerns
        fieldsToValidate = ["complaints"];
        break;
      case 4: // Review
        return true; // Review step, no validation needed
      case 5: // Consent
        fieldsToValidate = ["consentSignature", "consentSignedName", "hipaaAcknowledged", "hipaaSignedName"];
        break;
      default:
        return true;
    }
    
    // Only trigger validation if there are fields to validate
    if (fieldsToValidate.length > 0) {
      return await form.trigger(fieldsToValidate);
    }
    
    return true;
  };

  const handleNextStep = async () => {
    const isValid = await validateStep(currentStep);
    
    if (!isValid) {
      toast.error("Please complete all required fields before proceeding");
      medium();
      return;
    }

    // Mark current step as completed
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    
    if (currentStep < wizardSteps.length - 1) {
      setSlideDirection('left'); // Slide left when going forward
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        light();
        setIsTransitioning(false);
      }, 300); // Increased from 150ms to 300ms for smoother transition
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setSlideDirection('right'); // Slide right when going back
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        light();
        setIsTransitioning(false);
      }, 300); // Increased from 150ms to 300ms for smoother transition
    }
  };

  const generatePDF = async () => {
    if (!submittedFormData) return;

    try {
      // Dynamically import the PDF generator
      const { generateIntakePDF } = await import('@/components/intake/PDFGenerator');
      
      const pdf = generateIntakePDF(submittedFormData as any, accessCode);
      pdf.save(`intake-${submittedFormData.patientName.replace(/\s+/g, '-')}-${accessCode}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  if (submitted) {
    const primaryComplaint = submittedComplaints.find(c => c.isPrimary);
    const otherComplaints = submittedComplaints.filter(c => !c.isPrimary);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/5 via-background to-primary/5 p-4 py-8 animate-fade-in">
        <div className="mx-auto max-w-3xl">
          {/* Success Header with Animation */}
          <div className="text-center mb-8 space-y-4 animate-scale-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-success/20 blur-3xl animate-pulse"></div>
              <div className="relative bg-success/10 backdrop-blur-sm border-2 border-success/30 rounded-full p-8 inline-block">
                <CheckCircle2 className="h-20 w-20 text-success animate-[scale-in_0.5s_ease-out]" strokeWidth={2.5} />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-success animate-[slide-up_0.6s_ease-out]">
                Form Submitted Successfully! 🎉
              </h1>
              <p className="text-lg text-muted-foreground animate-[fade-in_0.8s_ease-out]">
                Thank you for completing your intake form
              </p>
            </div>
          </div>

        <Card className="animate-[slide-up_0.5s_ease-out]">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-success/10 backdrop-blur-sm p-4 rounded-2xl border border-success/20 animate-scale-in">
                <ClipboardCheck className="h-16 w-16 text-success" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl">Intake Form Submitted</CardTitle>
              <CardDescription className="text-base">
                Your information has been received and will be reviewed by our clinical team
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-success/10 border border-success/20 backdrop-blur-sm p-4 text-center animate-[scale-in_0.3s_ease-out_0.2s_both]">
              <p className="text-sm text-muted-foreground mb-2">Your access code:</p>
              <p className="text-3xl font-bold tracking-wider text-success">{accessCode}</p>
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
                className="mt-3 print:hidden border-success/30 hover:bg-success/10 hover:border-success/50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Access Code
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success animate-scale-in" />
                <h3 className="font-semibold text-lg">Summary of Your Concerns</h3>
              </div>
              
              {primaryComplaint && (
                <div className="border rounded-lg p-4 bg-success/5 border-success/20 animate-[scale-in_0.3s_ease-out_0.3s_both]">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge className="bg-success text-success-foreground">🎯 Priority</Badge>
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
                <div className="space-y-3 animate-[fade-in_0.4s_ease-out_0.4s_both]">
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
              <div className="space-y-4 animate-[fade-in_0.5s_ease-out_0.5s_both]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success animate-scale-in" />
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

            <p className="text-sm text-center text-muted-foreground animate-[fade-in_0.6s_ease-out_0.6s_both]">
              A staff member will review your information shortly.
            </p>

            <div className="print:hidden animate-[slide-up_0.5s_ease-out_0.7s_both]">
              <Button 
                onClick={generatePDF} 
                className="w-full min-h-[52px]"
                variant="default"
              >
                <Download className="h-4 w-4 mr-2" />
                Print PDF
              </Button>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate(`/patient-auth?code=${accessCode}`)} 
                className="w-full print:hidden min-h-[52px] animate-[fade-in_0.5s_ease-out_0.8s_both] bg-success hover:bg-success/90"
                variant="default"
              >
                <Activity className="h-4 w-4 mr-2" />
                Create Your Patient Account
              </Button>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate("/install")} 
                  className="flex-1 print:hidden min-h-[52px]"
                  variant="outline"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Install App Guide
                </Button>
                <Button 
                  onClick={() => navigate("/")} 
                  className="flex-1 print:hidden min-h-[52px]"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 py-8">
      <PWAInstallPrompt />
      
      {/* Dark Mode Toggle */}
      <Button
        onClick={() => {
          toggleDarkMode();
          light();
        }}
        size="icon"
        variant="outline"
        className="fixed top-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg border-2 transition-all hover:scale-110 print:hidden"
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-warning transition-transform duration-300 rotate-0" />
        ) : (
          <Moon className="h-5 w-5 text-primary transition-transform duration-300 rotate-0" />
        )}
      </Button>
      
      <div className="mx-auto max-w-3xl">
        {/* Welcome Banner for Referral Approval */}
        {searchParams.get('source') === 'referral_approval' && (
          <Alert className="mb-6 border-success/50 bg-success/5 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div className="ml-2">
              <h3 className="font-semibold text-success mb-1">You're in the Right Place! ✨</h3>
              <p className="text-sm text-muted-foreground">
                Welcome! Complete this intake form to schedule your first visit with us. 
                No account needed - just fill out the information below.
              </p>
            </div>
          </Alert>
        )}
        
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">New Patient Intake Form</CardTitle>
            <CardDescription>
              Please complete this form to help us prepare for your visit
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Progress Indicator */}
        <Card className="mb-6 animate-fade-in border-2">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Circular Progress */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    {/* Background circle */}
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - completionPercentage / 100)}`}
                        className={`transition-all duration-700 ease-out ${
                          completionPercentage === 100 ? 'text-success' : 'text-primary'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Percentage text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold transition-colors duration-300 ${
                        completionPercentage === 100 ? 'text-success' : 'text-primary'
                      }`}>
                        {completionPercentage}%
                      </span>
                    </div>
                    {/* Celebration icon */}
                    {completionPercentage === 100 && (
                      <div className="absolute -top-1 -right-1">
                        <PartyPopper className="h-6 w-6 text-success animate-scale-in" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">Form Progress</span>
                      {completionPercentage === 100 && (
                        <Badge className="bg-success text-success-foreground animate-scale-in">
                          Complete!
                        </Badge>
                      )}
                    </div>
                    {completionPercentage === 100 ? (
                      <p className="text-sm text-success font-medium">
                        ✨ Perfect! Your form is ready to submit
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {Math.round((completionPercentage / 100) * Object.keys(sectionCompletion).length)} of {Object.keys(sectionCompletion).length} sections completed
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Milestone badges */}
                <div className="hidden sm:flex gap-2">
                  {[25, 50, 75, 100].map((milestone) => (
                    <TooltipProvider key={milestone}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              completionPercentage >= milestone
                                ? 'bg-success text-success-foreground scale-110 shadow-lg'
                                : 'bg-muted text-muted-foreground scale-100'
                            } ${completionPercentage === milestone ? 'animate-scale-in' : ''}`}
                          >
                            {milestone === 25 && '🌱'}
                            {milestone === 50 && '🌿'}
                            {milestone === 75 && '🌳'}
                            {milestone === 100 && '🎉'}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{milestone}% Milestone {completionPercentage >= milestone ? '- Achieved!' : ''}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>

              {/* Linear progress bar */}
              <div className="space-y-2">
                <Progress 
                  value={completionPercentage} 
                  className={`h-3 transition-all duration-500 ${
                    completionPercentage === 100 ? 'bg-success/20' : ''
                  }`}
                />
                
                {/* Section completion chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(sectionCompletion).map(([key, completed]) => (
                    <Badge
                      key={key}
                      variant={completed ? "default" : "secondary"}
                      className={`text-xs transition-all duration-300 ${
                        completed ? 'bg-success text-success-foreground scale-105' : 'opacity-60'
                      }`}
                    >
                      {completed && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Progress */}
        {!isRestoringProgress && (
          <Card className="mb-6 border-dashed animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Save & Resume Later</span>
                    {isAutoSaving && (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <div className="absolute inset-0 animate-ping">
                            <Loader2 className="h-4 w-4 text-primary opacity-20" />
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                          Auto-saving...
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-saves every 30 seconds • Progress expires in 7 days
                  </p>
                  {lastSaved && (
                    <div className="flex items-center gap-1 text-xs text-success mt-1 animate-fade-in">
                      <CheckCircle2 className="h-3 w-3 animate-scale-in" />
                      <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => saveProgress(false)}
                  disabled={isSaving || isAutoSaving}
                  className="w-full sm:w-auto min-h-[48px] transition-all hover:shadow-md"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isRestoringProgress && (
          <Card className="mb-6 border-primary/50 bg-primary/5 animate-fade-in">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <div className="absolute inset-0 animate-ping">
                      <Loader2 className="h-6 w-6 text-primary opacity-20" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-primary">Restoring your saved progress...</p>
                    <p className="text-xs text-muted-foreground mt-1">Please wait while we load your information</p>
                  </div>
                </div>
                
                {/* Skeleton loading animation */}
                <div className="space-y-3 pt-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Returning Patient Lookup */}
        {showReturningPatientLookup && !isRestoringProgress && !hasPrefilledData && (
          <div className="mb-6">
            <ReturningPatientLookup
              onPatientSelect={handleReturningPatientSelect}
              onClose={() => setShowReturningPatientLookup(false)}
            />
          </div>
        )}

        {hasPrefilledData && (
          <Card className="mb-6 border-success/50 bg-success/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Information Pre-filled</p>
                    <p className="text-xs text-success/80">
                      Your previous information has been loaded. Please update your current complaint below.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReturningPatientLookup(true);
                    setHasPrefilledData(false);
                  }}
                >
                  Search Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wizard Progress */}
        <IntakeWizardSteps 
          steps={wizardSteps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
            <Card className="p-8 max-w-sm mx-4 shadow-2xl border-2 animate-scale-in">
              <CardContent className="flex flex-col items-center gap-6 p-0">
                {/* Animated loader */}
                <div className="relative w-24 h-24">
                  <Loader2 className="h-24 w-24 animate-spin text-primary" />
                  <div className="absolute inset-0 animate-ping">
                    <Loader2 className="h-24 w-24 text-primary opacity-10" />
                  </div>
                  {/* Progress ring */}
                  <svg className="absolute inset-0 w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-primary/20"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      className="text-primary animate-[spin_2s_linear_infinite]"
                      strokeLinecap="round"
                      style={{ strokeDashoffset: `${2 * Math.PI * 44 * 0.75}` }}
                    />
                  </svg>
                </div>
                
                <div className="text-center space-y-3">
                  <p className="text-xl font-semibold animate-pulse">Submitting Your Form</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Please wait while we securely process your information...
                  </p>
                  
                  {/* Loading steps */}
                  <div className="space-y-2 pt-4">
                    {['Validating data', 'Encrypting information', 'Saving securely'].map((step, index) => (
                      <div 
                        key={step}
                        className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in"
                        style={{ animationDelay: `${index * 0.3}s` }}
                      >
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <TooltipProvider>
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 0: Patient Info (Personal + Insurance + Emergency) */}
            {currentStep === 0 && (
              <div 
                key="step-0"
                className={`space-y-6 ${
                  isTransitioning 
                    ? slideDirection === 'left' 
                      ? 'animate-[fade-out_0.3s_ease-out,slide-out-right_0.3s_ease-out]' 
                      : 'animate-[fade-out_0.3s_ease-out,slide-in-right_0.3s_ease-out]'
                    : 'animate-[fade-in_0.4s_ease-out,scale-in_0.3s_ease-out]'
                }`}
              >
            {/* Personal Information */}
            <Card className="animate-[fade-in_0.3s_ease-out] hover:shadow-md transition-shadow duration-200">
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
                  render={({ field, fieldState }) => {
                    const isValid = touchedFields.has('patientName') && !fieldState.error && field.value;
                    const hasError = touchedFields.has('patientName') && fieldState.error;
                    return (
                      <FormItem className={hasError ? 'animate-shake' : ''}>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field}
                              autoComplete="name"
                              inputMode="text"
                              enterKeyHint="next"
                              onBlur={(e) => {
                                field.onBlur();
                                setTouchedFields(prev => new Set(prev).add('patientName'));
                              }}
                              className={isValid ? 'border-success focus:ring-success pr-10' : ''}
                            />
                            {isValid && (
                              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success animate-scale-in" />
                            )}
                          </div>
                        </FormControl>
                        {fieldState.error && (
                          <FormMessage className="animate-slide-down" />
                        )}
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field, fieldState }) => {
                    const isValid = touchedFields.has('legalName') && !fieldState.error && field.value;
                    const hasError = touchedFields.has('legalName') && fieldState.error;
                    return (
                      <FormItem className={hasError ? 'animate-shake' : ''}>
                        <FormLabel>Legal Name</FormLabel>
                        <FormDescription className="text-xs">
                          Only if different from Full Name above
                        </FormDescription>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field}
                              autoComplete="name"
                              inputMode="text"
                              enterKeyHint="next"
                              placeholder="Leave blank if same as Full Name"
                              onBlur={(e) => {
                                field.onBlur();
                                setTouchedFields(prev => new Set(prev).add('legalName'));
                              }}
                              className={isValid ? 'border-success focus:ring-success pr-10' : ''}
                            />
                            {isValid && (
                              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success animate-scale-in" />
                            )}
                          </div>
                        </FormControl>
                        {fieldState.error && (
                          <FormMessage className="animate-slide-down" />
                        )}
                      </FormItem>
                    );
                  }}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field, fieldState }) => {
                      const isValid = touchedFields.has('dateOfBirth') && !fieldState.error && field.value;
                      const hasError = touchedFields.has('dateOfBirth') && fieldState.error;
                      return (
                        <FormItem className={hasError ? 'animate-shake' : ''}>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="date" 
                                {...field} 
                                autoComplete="bday"
                                onBlur={(e) => {
                                  field.onBlur();
                                  setTouchedFields(prev => new Set(prev).add('dateOfBirth'));
                                }}
                                className={isValid ? 'border-success focus:ring-success pr-10' : ''}
                              />
                              {isValid && (
                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success animate-scale-in" />
                              )}
                            </div>
                          </FormControl>
                          {fieldState.error && (
                            <FormMessage className="animate-slide-down" />
                          )}
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="episodeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Episode Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select episode type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MSK">Musculoskeletal</SelectItem>
                            <SelectItem value="Neurology">Neurology</SelectItem>
                            <SelectItem value="Performance">Performance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => {
                    const isValid = touchedFields.has('phone') && !fieldState.error && field.value && field.value.length >= 10;
                    const hasError = touchedFields.has('phone') && fieldState.error;
                    return (
                      <FormItem className={hasError ? 'animate-shake' : ''}>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="tel" 
                              placeholder="(555) 123-4567" 
                              {...field} 
                              autoComplete="tel"
                              inputMode="tel"
                              enterKeyHint="next"
                              onBlur={(e) => {
                                field.onBlur();
                                setTouchedFields(prev => new Set(prev).add('phone'));
                              }}
                              className={isValid ? 'border-success focus:ring-success pr-10' : ''}
                            />
                            {isValid && (
                              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success animate-scale-in" />
                            )}
                          </div>
                        </FormControl>
                        {fieldState.error && (
                          <FormMessage className="animate-slide-down" />
                        )}
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => {
                    const isValid = touchedFields.has('email') && !fieldState.error && field.value && field.value.includes('@');
                    const hasError = touchedFields.has('email') && fieldState.error;
                    return (
                      <FormItem className={hasError ? 'animate-shake' : ''}>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="email" 
                              placeholder="name@example.com" 
                              {...field} 
                              autoComplete="email"
                              inputMode="email"
                              enterKeyHint="next"
                              onBlur={(e) => {
                                field.onBlur();
                                setTouchedFields(prev => new Set(prev).add('email'));
                              }}
                              className={isValid ? 'border-success focus:ring-success pr-10' : ''}
                            />
                            {isValid && (
                              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success animate-scale-in" />
                            )}
                          </div>
                        </FormControl>
                        {fieldState.error && (
                          <FormMessage className="animate-slide-down" />
                        )}
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={2} 
                          {...field} 
                          autoComplete="street-address"
                        />
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
                        <Input 
                          type="tel" 
                          placeholder="Required if patient is under 18" 
                          {...field} 
                          inputMode="tel"
                          enterKeyHint="next"
                        />
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
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select insurance provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Aetna">Aetna</SelectItem>
                        <SelectItem value="Anthem">Anthem</SelectItem>
                        <SelectItem value="BlueCross BlueShield">BlueCross BlueShield</SelectItem>
                        <SelectItem value="Cigna">Cigna</SelectItem>
                        <SelectItem value="Excellus">Excellus</SelectItem>
                        <SelectItem value="Humana">Humana</SelectItem>
                        <SelectItem value="Medicare">Medicare</SelectItem>
                        <SelectItem value="Medicaid">Medicaid</SelectItem>
                        <SelectItem value="MVP">MVP</SelectItem>
                        <SelectItem value="UnitedHealthcare">UnitedHealthcare</SelectItem>
                        <SelectItem value="Self-Pay">Self-Pay</SelectItem>
                        <SelectItem value="Workers Comp">Workers Comp</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select responsible party" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Self">Self</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Employer">Employer</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                          <Input 
                            type="tel" 
                            {...field} 
                            inputMode="tel"
                            enterKeyHint="next"
                          />
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
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Friend">Friend</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>
              </CardContent>
            </Card>

            </div>
            )}

            {/* Step 1: Medical History */}
            {currentStep === 1 && (
              <div 
                key="step-1"
                className={`space-y-6 ${
                  isTransitioning 
                    ? slideDirection === 'left' 
                      ? 'animate-[fade-out_0.3s_ease-out,slide-out-right_0.3s_ease-out]' 
                      : 'animate-[fade-out_0.3s_ease-out,slide-in-right_0.3s_ease-out]'
                    : 'animate-[fade-in_0.4s_ease-out,scale-in_0.3s_ease-out]'
                }`}
              >
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
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select how you heard about us" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Doctor Referral">Doctor Referral</SelectItem>
                      <SelectItem value="Friend/Family">Friend/Family</SelectItem>
                      <SelectItem value="Google Search">Google Search</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Insurance Provider">Insurance Provider</SelectItem>
                      <SelectItem value="School/Athletic Trainer">School/Athletic Trainer</SelectItem>
                      <SelectItem value="Previous Patient">Previous Patient</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                          <Input 
                            type="tel" 
                            {...field} 
                            inputMode="tel"
                            enterKeyHint="next"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pcpFax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PCP Fax</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            {...field} 
                            inputMode="tel"
                            enterKeyHint="next"
                          />
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

            </div>
            )}

            {/* Step 2: Review of Systems */}
            {currentStep === 2 && (
            <div 
              key="step-2"
              className={`space-y-6 ${
                isTransitioning 
                  ? slideDirection === 'left' 
                    ? 'animate-[fade-out_0.3s_ease-out,slide-out-right_0.3s_ease-out]' 
                    : 'animate-[fade-out_0.3s_ease-out,slide-in-right_0.3s_ease-out]'
                  : 'animate-[fade-in_0.4s_ease-out,scale-in_0.3s_ease-out]'
              }`}
            >
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
                                          className="flex flex-row items-start space-x-3 space-y-0 py-2"
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
                                                    )
                                              }}
                                              className="mt-0.5"
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal cursor-pointer">
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

            </div>
            )}

            {/* Step 3: Areas of Concern */}
            {currentStep === 3 && (
              <div 
                key="step-3"
                className={`space-y-6 ${
                  isTransitioning 
                    ? slideDirection === 'left' 
                      ? 'animate-[fade-out_0.3s_ease-out,slide-out-right_0.3s_ease-out]' 
                      : 'animate-[fade-out_0.3s_ease-out,slide-in-right_0.3s_ease-out]'
                    : 'animate-[fade-in_0.4s_ease-out,scale-in_0.3s_ease-out]'
                }`}
              >
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
                  {isMobile ? (
                    <strong>Use the ↑ ↓ buttons</strong>
                  ) : (
                    <strong>Drag and drop</strong>
                  )}{" "}
                  to reorder your concerns by treatment priority. The top concern will be treated first, and subsequent concerns will be queued for future treatment episodes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Complaint Overview Summary */}
                {fields.length > 1 && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-2">You're reporting {fields.length} concerns</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        We'll create separate treatment episodes for each concern in the priority order you specify. 
                        Priority #1 will be converted to an active episode first, and the rest will be queued for future treatment.
                      </p>
                      {isMobile && (
                        <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Tap the ↑ ↓ buttons to change priority order
                        </p>
                      )}
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
                            medium();
                            // Reorder remaining priorities
                            setTimeout(() => {
                              const remaining = form.getValues('complaints');
                              remaining.forEach((_, i) => {
                                form.setValue(`complaints.${i}.priority`, i + 1);
                                form.setValue(`complaints.${i}.isPrimary`, i === 0);
                              });
                            }, 100);
                          }}
                          onMoveUp={() => {
                            if (index > 0) {
                              move(index, index - 1);
                              light();
                              // Update priorities after move
                              setTimeout(() => {
                                const complaints = form.getValues('complaints');
                                complaints.forEach((_, i) => {
                                  form.setValue(`complaints.${i}.priority`, i + 1);
                                  form.setValue(`complaints.${i}.isPrimary`, i === 0);
                                });
                              }, 100);
                              toast.success("Moved up in priority");
                            }
                          }}
                          onMoveDown={() => {
                            if (index < fields.length - 1) {
                              move(index, index + 1);
                              light();
                              // Update priorities after move
                              setTimeout(() => {
                                const complaints = form.getValues('complaints');
                                complaints.forEach((_, i) => {
                                  form.setValue(`complaints.${i}.priority`, i + 1);
                                  form.setValue(`complaints.${i}.isPrimary`, i === 0);
                                });
                              }, 100);
                              toast.success("Moved down in priority");
                            }
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
                  className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5 min-h-[52px]"
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

            </div>
            )}

            {/* Step 4: Review Your Information */}
            {currentStep === 4 && (
            <div 
              key="step-4"
              className={`space-y-6 ${
                isTransitioning 
                  ? slideDirection === 'left' 
                    ? 'animate-[fade-out_0.3s_ease-out,slide-out-right_0.3s_ease-out]' 
                    : 'animate-[fade-out_0.3s_ease-out,slide-in-right_0.3s_ease-out]'
                  : 'animate-[fade-in_0.4s_ease-out,scale-in_0.3s_ease-out]'
              }`}
            >
            <Card>
              <CardHeader>
                <CardTitle>Review Your Information</CardTitle>
                <CardDescription>
                  Please review all information before signing. Use the Back button if you need to make changes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <div className="grid gap-2 text-sm bg-muted/30 p-4 rounded-lg border">
                    <div><span className="font-medium">Name:</span> {form.watch("patientName")}</div>
                    <div><span className="font-medium">Date of Birth:</span> {form.watch("dateOfBirth")}</div>
                    <div><span className="font-medium">Episode Type:</span> {form.watch("episodeType")}</div>
                    {form.watch("email") && <div><span className="font-medium">Email:</span> {form.watch("email")}</div>}
                    {form.watch("phone") && <div><span className="font-medium">Phone:</span> {form.watch("phone")}</div>}
                    {form.watch("address") && <div><span className="font-medium">Address:</span> {form.watch("address")}</div>}
                  </div>
                </div>

                {/* Emergency Contact */}
                {(form.watch("emergencyContactName") || form.watch("emergencyContactPhone")) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Emergency Contact
                    </h4>
                    <div className="grid gap-2 text-sm bg-muted/30 p-4 rounded-lg border">
                      {form.watch("emergencyContactName") && (
                        <div><span className="font-medium">Name:</span> {form.watch("emergencyContactName")}</div>
                      )}
                      {form.watch("emergencyContactPhone") && (
                        <div><span className="font-medium">Phone:</span> {form.watch("emergencyContactPhone")}</div>
                      )}
                      {form.watch("emergencyContactRelationship") && (
                        <div><span className="font-medium">Relationship:</span> {form.watch("emergencyContactRelationship")}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medical History */}
                {(form.watch("primaryCarePhysician") || form.watch("currentMedications") || form.watch("allergies") || 
                  form.watch("medicalHistory") || form.watch("surgeryHistory") || form.watch("hospitalizationHistory")) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Medical History
                    </h4>
                    <div className="grid gap-2 text-sm bg-muted/30 p-4 rounded-lg border">
                      {form.watch("primaryCarePhysician") && (
                        <div><span className="font-medium">Primary Care Physician:</span> {form.watch("primaryCarePhysician")}</div>
                      )}
                      {form.watch("currentMedications") && (
                        <div><span className="font-medium">Current Medications:</span> {form.watch("currentMedications")}</div>
                      )}
                      {form.watch("allergies") && (
                        <div><span className="font-medium">Allergies:</span> {form.watch("allergies")}</div>
                      )}
                      {form.watch("medicalHistory") && (
                        <div><span className="font-medium">Medical History:</span> {form.watch("medicalHistory")}</div>
                      )}
                      {form.watch("surgeryHistory") && (
                        <div><span className="font-medium">Surgery History:</span> {form.watch("surgeryHistory")}</div>
                      )}
                      {form.watch("hospitalizationHistory") && (
                        <div><span className="font-medium">Hospitalization History:</span> {form.watch("hospitalizationHistory")}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Review of Systems */}
                {form.watch("reviewOfSystems") && form.watch("reviewOfSystems").length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Review of Systems
                    </h4>
                    <div className="bg-muted/30 p-4 rounded-lg border text-sm">
                      <div className="flex flex-wrap gap-2">
                        {form.watch("reviewOfSystems").map((symptom, index) => (
                          <Badge key={index} variant="outline">{symptom}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Concerns */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Current Concerns
                  </h4>
                  {form.watch("complaints")?.map((complaint, index) => (
                    <div key={index} className="bg-muted/30 p-4 rounded-lg border space-y-2 text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">Priority #{complaint.priority || index + 1}</Badge>
                        {complaint.isPrimary && <Badge variant="secondary">Primary</Badge>}
                      </div>
                      <div><span className="font-medium">Concern:</span> {complaint.text}</div>
                      <div><span className="font-medium">Location:</span> {complaint.category}</div>
                      <div><span className="font-medium">Severity:</span> {complaint.severity}</div>
                      <div><span className="font-medium">Duration:</span> {complaint.duration}</div>
                    </div>
                  ))}
                  {form.watch("injuryDate") && (
                    <div className="text-sm bg-muted/20 p-3 rounded border">
                      <span className="font-medium">Started:</span> {form.watch("injuryDate")}
                    </div>
                  )}
                  {form.watch("injuryMechanism") && (
                    <div className="text-sm bg-muted/20 p-3 rounded border">
                      <span className="font-medium">How it happened:</span> {form.watch("injuryMechanism")}
                    </div>
                  )}
                  {form.watch("symptoms") && (
                    <div className="text-sm bg-muted/20 p-3 rounded border">
                      <span className="font-medium">Symptoms:</span> {form.watch("symptoms")}
                    </div>
                  )}
                  <div className="text-sm bg-muted/20 p-3 rounded border">
                    <span className="font-medium">Current Pain Level:</span> {form.watch("painLevel")}/10
                  </div>
                </div>

                {/* Instructions */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    If any information needs to be corrected, use the <strong>Back</strong> button to return to the appropriate section.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            </div>
            )}

            {/* Step 5: Consent & HIPAA */}
            {currentStep === 5 && (
            <div 
              key="step-5"
              className={`space-y-6 ${
                isTransitioning 
                  ? slideDirection === 'left' 
                    ? 'animate-[fade-out_0.3s_ease-out,slide-out-right_0.3s_ease-out]' 
                    : 'animate-[fade-out_0.3s_ease-out,slide-in-right_0.3s_ease-out]'
                  : 'animate-[fade-in_0.4s_ease-out,scale-in_0.3s_ease-out]'
              }`}
            >
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
                      <Suspense fallback={
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="ml-2 text-muted-foreground">Loading signature pad...</span>
                        </div>
                      }>
                        <SignatureField
                          value={field.value}
                          onChange={field.onChange}
                          typedName={form.watch('consentSignedName')}
                          onTypedNameChange={(name) => form.setValue('consentSignedName', name)}
                          isMobile={isMobile}
                        />
                      </Suspense>
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
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              autoComplete="name"
                              enterKeyHint="next"
                            />
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
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
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              autoComplete="name"
                              enterKeyHint="done"
                            />
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
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

            </div>
            )}

            {/* Wizard Navigation */}
            <div className="flex items-center justify-between gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === 0 || isSubmitting}
                className="flex-1 min-h-[52px]"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < wizardSteps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="flex-1 min-h-[52px]"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="flex-1 min-h-[52px]" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Intake Form"
                  )}
                </Button>
              )}
            </div>
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

        {/* Exit Warning Dialog */}
        <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Unsaved Changes
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  You have unsaved changes to your intake form. If you leave now, your progress will be lost.
                </p>
                
                <div className="bg-muted/50 border rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Options:</p>
                  <ul className="text-xs space-y-1.5 text-muted-foreground">
                    <li>• <strong>Stay:</strong> Continue filling out the form</li>
                    <li>• <strong>Save Progress:</strong> Save your work and come back later</li>
                    <li>• <strong>Leave:</strong> Exit without saving (changes will be lost)</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel onClick={handleCancelExit}>
                Stay on Form
              </AlertDialogCancel>
              <Button
                variant="outline"
                onClick={async () => {
                  setShowExitWarning(false);
                  await saveProgress(false);
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save & Exit
              </Button>
              <AlertDialogAction 
                onClick={handleConfirmExit}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Leave Without Saving
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
