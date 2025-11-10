import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { ClipboardCheck, Plus, X, Printer, Copy } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    (complaints) => complaints.some(c => c.isPrimary),
    "Please select a primary complaint"
  ),
  injuryDate: z.string().optional(),
  injuryMechanism: z.string().max(500, "Description is too long").optional(),
  painLevel: z.number().min(0).max(10),
  symptoms: z.string().max(1000, "Description is too long").optional(),
  reviewOfSystems: z.array(z.string()).default([]),
  consentClinicUpdates: z.boolean().default(false),
  optOutNewsletter: z.boolean().default(false),
});

type IntakeFormValues = z.infer<typeof intakeFormSchema>;

export default function PatientIntake() {
  const [submitted, setSubmitted] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [submittedComplaints, setSubmittedComplaints] = useState<z.infer<typeof complaintSchema>[]>([]);

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
      complaints: [{ text: "", category: "", severity: "", duration: "", isPrimary: true }],
      injuryDate: "",
      injuryMechanism: "",
      painLevel: 5,
      symptoms: "",
      reviewOfSystems: [],
      consentClinicUpdates: false,
      optOutNewsletter: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "complaints",
  });

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const onSubmit = async (data: IntakeFormValues) => {
    try {
      const code = generateAccessCode();
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
          consent_clinic_updates: data.consentClinicUpdates,
          opt_out_newsletter: data.optOutNewsletter,
          status: "pending"
        });

      if (error) throw error;

      setAccessCode(code);
      setSubmittedComplaints(data.complaints);
      setSubmitted(true);
      toast.success("Intake form submitted successfully!");
    } catch (error: any) {
      toast.error(`Failed to submit form: ${error.message}`);
    }
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

            <p className="text-sm text-center text-muted-foreground">
              A staff member will review your information shortly.
            </p>

            <Button 
              onClick={() => window.print()} 
              className="w-full print:hidden"
              variant="outline"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Summary for Your Records
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">New Patient Intake Form</CardTitle>
            <CardDescription>
              Please complete this form to help us prepare for your visit
            </CardDescription>
          </CardHeader>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
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
                <CardTitle>Insurance Information</CardTitle>
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
                <CardTitle>Emergency Contact</CardTitle>
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
                <CardTitle>Medical Information</CardTitle>
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
                <CardTitle>Review of Systems</CardTitle>
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
                <CardTitle>Areas of Concern - What Would You Like Us to Evaluate?</CardTitle>
                <CardDescription>
                  Please describe each separate issue or condition you'd like evaluated. Use the category dropdown to specify the body region. Then select which concern you want us to prioritize and treat first.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-4 p-4 border rounded-lg relative bg-card">
                      <div className="flex items-start justify-between gap-2">
                        <FormField
                          control={form.control}
                          name={`complaints.${index}.isPrimary`}
                          render={({ field: radioField }) => (
                            <FormItem className="flex items-center space-y-0">
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    checked={radioField.value}
                                    onChange={() => {
                                      // Uncheck all others
                                      fields.forEach((_, i) => {
                                        form.setValue(`complaints.${i}.isPrimary`, i === index);
                                      });
                                    }}
                                    className="h-4 w-4"
                                  />
                                  <FormLabel className="font-normal cursor-pointer">
                                    {radioField.value ? "🎯 Treat this concern first" : "Set as priority"}
                                  </FormLabel>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (form.getValues(`complaints.${index}.isPrimary`)) {
                                toast.error("Cannot remove the primary concern. Please set another concern as priority first.");
                                return;
                              }
                              remove(index);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`complaints.${index}.category`}
                          render={({ field: categoryField }) => (
                            <FormItem>
                              <FormLabel>Body Region/Category *</FormLabel>
                              <Select onValueChange={categoryField.onChange} value={categoryField.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select body region" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {COMPLAINT_CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
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
                          name={`complaints.${index}.severity`}
                          render={({ field: severityField }) => (
                            <FormItem>
                              <FormLabel>Severity *</FormLabel>
                              <Select onValueChange={severityField.onChange} value={severityField.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select severity" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SEVERITY_LEVELS.map((severity) => (
                                    <SelectItem key={severity} value={severity}>
                                      {severity}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`complaints.${index}.duration`}
                        render={({ field: durationField }) => (
                          <FormItem>
                            <FormLabel>How long have you had this issue? *</FormLabel>
                            <Select onValueChange={durationField.onChange} value={durationField.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DURATION_OPTIONS.map((duration) => (
                                  <SelectItem key={duration} value={duration}>
                                    {duration}
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
                        name={`complaints.${index}.text`}
                        render={({ field: textField }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe this specific concern in detail..." 
                                rows={3} 
                                {...textField} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ text: "", category: "", severity: "", duration: "", isPrimary: false })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Concern
                  </Button>

                  {form.formState.errors.complaints?.root && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.complaints.root.message}
                    </p>
                  )}
                </div>

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
      </div>
    </div>
  );
}
