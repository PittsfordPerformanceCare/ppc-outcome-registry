import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, Calendar, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReturningPatientLookupProps {
  onPatientSelect: (patientData: any) => void;
  onClose: () => void;
}

export function ReturningPatientLookup({ onPatientSelect, onClose }: ReturningPatientLookupProps) {
  const [searchName, setSearchName] = useState("");
  const [searchDob, setSearchDob] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchName.trim() || !searchDob) {
      toast.error("Please enter both name and date of birth");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search intake_forms first
      const { data: intakeData, error: intakeError } = await supabase
        .from('intake_forms')
        .select('*')
        .ilike('patient_name', `%${searchName}%`)
        .eq('date_of_birth', searchDob)
        .order('created_at', { ascending: false })
        .limit(5);

      if (intakeError) throw intakeError;

      // Also search episodes for additional data
      const { data: episodeData, error: episodeError } = await supabase
        .from('episodes')
        .select('*')
        .ilike('patient_name', `%${searchName}%`)
        .eq('date_of_birth', searchDob)
        .order('created_at', { ascending: false })
        .limit(5);

      if (episodeError) throw episodeError;

      // Combine and deduplicate results
      const combined = [...(intakeData || []), ...(episodeData || [])];
      const uniqueResults = combined.reduce((acc: any[], curr) => {
        const exists = acc.find(item => 
          item.patient_name === curr.patient_name && 
          item.date_of_birth === curr.date_of_birth
        );
        if (!exists) {
          acc.push(curr);
        }
        return acc;
      }, []);

      setResults(uniqueResults);

      if (uniqueResults.length === 0) {
        toast.info("No previous records found for this patient");
      }
    } catch (error: any) {
      console.error('Error searching patients:', error);
      toast.error("Failed to search for patient records");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (record: any) => {
    // Pre-fill data from the selected record
    const prefillData = {
      patientName: record.patient_name,
      dateOfBirth: record.date_of_birth,
      phone: record.phone || "",
      email: record.email || "",
      address: record.address || "",
      guardianPhone: record.guardian_phone || "",
      insuranceProvider: record.insurance_provider || record.insurance || "",
      insuranceId: record.insurance_id || "",
      billResponsibleParty: record.bill_responsible_party || "",
      emergencyContactName: record.emergency_contact_name || record.emergency_contact || "",
      emergencyContactPhone: record.emergency_contact_phone || record.emergency_phone || "",
      emergencyContactRelationship: record.emergency_contact_relationship || "",
      primaryCarePhysician: record.primary_care_physician || "",
      pcpPhone: record.pcp_phone || "",
      pcpAddress: record.pcp_address || "",
      referringPhysician: record.referring_physician || "",
      currentMedications: record.current_medications || record.medications || "",
      allergies: record.allergies || "",
      medicalHistory: record.medical_history || "",
      hospitalizationHistory: record.hospitalization_history || "",
      surgeryHistory: record.surgery_history || "",
    };

    onPatientSelect(prefillData);
    toast.success(`Pre-filled information for ${record.patient_name}`, {
      description: "Please update your current complaint and injury details",
      duration: 5000,
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <CardTitle>Returning Patient?</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Search for your previous records to speed up the intake process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Full Name</Label>
            <Input
              id="search-name"
              placeholder="John Doe"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-dob">Date of Birth</Label>
            <Input
              id="search-dob"
              type="date"
              value={searchDob}
              onChange={(e) => setSearchDob(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full"
            >
              {isSearching ? (
                <>Searching...</>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Records
                </>
              )}
            </Button>
          </div>
        </div>

        {hasSearched && (
          <div className="space-y-2">
            {results.length > 0 ? (
              <>
                <Label className="text-sm font-medium">
                  Found {results.length} previous record{results.length !== 1 ? 's' : ''}
                </Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.map((record, index) => (
                    <Card key={index} className="border-muted">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{record.patient_name}</span>
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                DOB: {format(new Date(record.date_of_birth), 'MM/dd/yyyy')}
                              </Badge>
                            </div>
                            {record.chief_complaint && (
                              <p className="text-sm text-muted-foreground">
                                Previous complaint: {record.chief_complaint}
                              </p>
                            )}
                            {record.created_at && (
                              <p className="text-xs text-muted-foreground">
                                Record from: {format(new Date(record.created_at), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSelectPatient(record)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Use This Record
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No previous records found</p>
                <p className="text-sm">Please fill out the form below as a new patient</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
