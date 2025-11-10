import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ClipboardCheck } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function PatientIntake() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [accessCode, setAccessCode] = useState("");

  // Patient demographics
  const [patientName, setPatientName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  // Insurance
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insuranceId, setInsuranceId] = useState("");
  const [billResponsibleParty, setBillResponsibleParty] = useState("");

  // Emergency contact
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState("");

  // Medical information
  const [referralSource, setReferralSource] = useState("");
  const [primaryCarePhysician, setPrimaryCarePhysician] = useState("");
  const [pcpPhone, setPcpPhone] = useState("");
  const [pcpAddress, setPcpAddress] = useState("");
  const [referringPhysician, setReferringPhysician] = useState("");
  const [specialistSeen, setSpecialistSeen] = useState("");
  const [hospitalizationHistory, setHospitalizationHistory] = useState("");
  const [surgeryHistory, setSurgeryHistory] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");

  // Consents
  const [consentClinicUpdates, setConsentClinicUpdates] = useState(false);
  const [optOutNewsletter, setOptOutNewsletter] = useState(false);

  // Injury/condition details
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [injuryDate, setInjuryDate] = useState("");
  const [injuryMechanism, setInjuryMechanism] = useState("");
  const [painLevel, setPainLevel] = useState([5]);
  const [symptoms, setSymptoms] = useState("");

  const generateAccessCode = () => {
    // Generate a 6-character alphanumeric code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const code = generateAccessCode();
      
      const { error } = await supabase
        .from("intake_forms")
        .insert({
          access_code: code,
          patient_name: patientName,
          date_of_birth: dateOfBirth,
          phone,
          email,
          address,
          guardian_phone: guardianPhone || null,
          insurance_provider: insuranceProvider,
          insurance_id: insuranceId,
          bill_responsible_party: billResponsibleParty || null,
          emergency_contact_name: emergencyContactName,
          emergency_contact_phone: emergencyContactPhone,
          emergency_contact_relationship: emergencyContactRelationship,
          referral_source: referralSource || null,
          primary_care_physician: primaryCarePhysician,
          pcp_phone: pcpPhone || null,
          pcp_address: pcpAddress || null,
          referring_physician: referringPhysician,
          specialist_seen: specialistSeen || null,
          hospitalization_history: hospitalizationHistory || null,
          surgery_history: surgeryHistory || null,
          current_medications: currentMedications,
          allergies,
          medical_history: medicalHistory,
          chief_complaint: chiefComplaint,
          injury_date: injuryDate || null,
          injury_mechanism: injuryMechanism,
          pain_level: painLevel[0],
          symptoms,
          consent_clinic_updates: consentClinicUpdates,
          opt_out_newsletter: optOutNewsletter,
          status: "pending"
        });

      if (error) throw error;

      setAccessCode(code);
      setSubmitted(true);
      toast.success("Intake form submitted successfully!");
    } catch (error: any) {
      toast.error(`Failed to submit form: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
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
            </div>
            <p className="text-sm text-center text-muted-foreground">
              A staff member will review your information shortly.
            </p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Full Name *</Label>
                <Input
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianPhone">Parent/Guardian Phone (if under 18)</Label>
                <Input
                  id="guardianPhone"
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="Required if patient is under 18"
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceId">Insurance ID</Label>
                  <Input
                    id="insuranceId"
                    value={insuranceId}
                    onChange={(e) => setInsuranceId(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billResponsibleParty">Who is responsible for the bill?</Label>
                <Input
                  id="billResponsibleParty"
                  value={billResponsibleParty}
                  onChange={(e) => setBillResponsibleParty(e.target.value)}
                  placeholder="Self, Spouse, Parent, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    value={emergencyContactRelationship}
                    onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referralSource">How did you hear about us? (Referral Source)</Label>
                <Input
                  id="referralSource"
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  placeholder="Friend, doctor referral, online search, etc."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryCarePhysician">Primary Care Physician (PCP)</Label>
                  <Input
                    id="primaryCarePhysician"
                    value={primaryCarePhysician}
                    onChange={(e) => setPrimaryCarePhysician(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pcpPhone">PCP Phone</Label>
                  <Input
                    id="pcpPhone"
                    type="tel"
                    value={pcpPhone}
                    onChange={(e) => setPcpPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pcpAddress">PCP Address</Label>
                <Input
                  id="pcpAddress"
                  value={pcpAddress}
                  onChange={(e) => setPcpAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referringPhysician">Referring Physician (if any)</Label>
                <Input
                  id="referringPhysician"
                  value={referringPhysician}
                  onChange={(e) => setReferringPhysician(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialistSeen">Have you seen a specialist? If so, who?</Label>
                <Input
                  id="specialistSeen"
                  value={specialistSeen}
                  onChange={(e) => setSpecialistSeen(e.target.value)}
                  placeholder="Specialist name and specialty"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospitalizationHistory">Have you ever been hospitalized?</Label>
                <Textarea
                  id="hospitalizationHistory"
                  value={hospitalizationHistory}
                  onChange={(e) => setHospitalizationHistory(e.target.value)}
                  placeholder="Please describe any hospitalizations"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surgeryHistory">Please list any surgeries</Label>
                <Textarea
                  id="surgeryHistory"
                  value={surgeryHistory}
                  onChange={(e) => setSurgeryHistory(e.target.value)}
                  placeholder="List all previous surgeries and approximate dates"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="List all medications you are currently taking"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="List any drug allergies or other relevant allergies"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Other Relevant Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Chronic conditions, family history, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Injury/Condition Details */}
          <Card>
            <CardHeader>
              <CardTitle>Reason for Visit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chiefComplaint">What brings you in today? *</Label>
                <Textarea
                  id="chiefComplaint"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Describe your main concern or reason for seeking treatment"
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="injuryDate">When did this start?</Label>
                  <Input
                    id="injuryDate"
                    type="date"
                    value={injuryDate}
                    onChange={(e) => setInjuryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="painLevel">Current Pain Level (0-10)</Label>
                  <div className="pt-2">
                    <Slider
                      id="painLevel"
                      value={painLevel}
                      onValueChange={setPainLevel}
                      max={10}
                      step={1}
                    />
                    <div className="mt-2 text-center text-2xl font-bold">{painLevel[0]}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="injuryMechanism">How did this happen?</Label>
                <Textarea
                  id="injuryMechanism"
                  value={injuryMechanism}
                  onChange={(e) => setInjuryMechanism(e.target.value)}
                  placeholder="Describe how the injury or condition occurred"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Current Symptoms</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms (pain, stiffness, weakness, etc.)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Consent & Communication */}
          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="consentClinicUpdates"
                  checked={consentClinicUpdates}
                  onChange={(e) => setConsentClinicUpdates(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="consentClinicUpdates" className="cursor-pointer">
                  Yes, I would like to receive clinic updates and appointment reminders
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="optOutNewsletter"
                  checked={optOutNewsletter}
                  onChange={(e) => setOptOutNewsletter(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="optOutNewsletter" className="cursor-pointer">
                  I do not wish to receive newsletters or promotional materials
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Intake Form"}
          </Button>
        </form>
      </div>
    </div>
  );
}
