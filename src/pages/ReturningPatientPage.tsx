import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, User, Calendar, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface PatientMatch {
  id: string;
  patientName: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  chiefComplaint?: string;
  source: "intake_forms" | "episodes";
  createdAt: string;
}

export default function ReturningPatientPage() {
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState("");
  const [searchDob, setSearchDob] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<PatientMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchName.trim() && !searchDob) {
      toast.error("Please enter a name or date of birth to search");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const matches: PatientMatch[] = [];

      // Search intake_forms
      let intakeQuery = supabase
        .from("intake_forms")
        .select("id, patient_name, date_of_birth, email, phone, chief_complaint, created_at")
        .eq("status", "submitted");

      if (searchName.trim()) {
        intakeQuery = intakeQuery.ilike("patient_name", `%${searchName.trim()}%`);
      }
      if (searchDob) {
        intakeQuery = intakeQuery.eq("date_of_birth", searchDob);
      }

      const { data: intakeForms } = await intakeQuery.order("created_at", { ascending: false }).limit(20);

      if (intakeForms) {
        intakeForms.forEach((form) => {
          matches.push({
            id: form.id,
            patientName: form.patient_name,
            dateOfBirth: form.date_of_birth,
            email: form.email || undefined,
            phone: form.phone || undefined,
            chiefComplaint: form.chief_complaint,
            source: "intake_forms",
            createdAt: form.created_at || "",
          });
        });
      }

      // Search episodes
      let episodeQuery = supabase
        .from("episodes")
        .select("id, patient_name, date_of_birth, region, created_at, current_status");

      if (searchName.trim()) {
        episodeQuery = episodeQuery.ilike("patient_name", `%${searchName.trim()}%`);
      }
      if (searchDob) {
        episodeQuery = episodeQuery.eq("date_of_birth", searchDob);
      }

      const { data: episodes } = await episodeQuery.order("created_at", { ascending: false }).limit(20);

      if (episodes) {
        episodes.forEach((ep) => {
          // Only add if not already from intake
          const exists = matches.some(
            (m) => m.patientName === ep.patient_name && m.dateOfBirth === ep.date_of_birth
          );
          if (!exists) {
            matches.push({
              id: ep.id,
              patientName: ep.patient_name,
              dateOfBirth: ep.date_of_birth || "",
              chiefComplaint: ep.region,
              source: "episodes",
              createdAt: ep.created_at,
            });
          }
        });
      }

      setResults(matches);

      if (matches.length === 0) {
        toast.info("No matching patients found");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for patients");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient: PatientMatch) => {
    // Store patient data for pre-fill
    const prefillData = {
      patientName: patient.patientName,
      dateOfBirth: patient.dateOfBirth,
      email: patient.email,
      phone: patient.phone,
      chiefComplaint: patient.chiefComplaint,
      sourceId: patient.id,
      sourceType: patient.source,
      isReturning: true,
    };

    sessionStorage.setItem("returningPatientData", JSON.stringify(prefillData));
    toast.success(`Selected ${patient.patientName} - ready for new episode`);
    navigate("/new-episode");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Returning Patient Lookup
              </h1>
              <p className="text-muted-foreground mt-1">
                Find existing patients to create a new episode
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Search Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search for Patient
            </CardTitle>
            <CardDescription>
              Enter name and/or date of birth to find existing patient records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="searchName">Patient Name</Label>
                <Input
                  id="searchName"
                  placeholder="Enter patient name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="searchDob">Date of Birth</Label>
                <Input
                  id="searchDob"
                  type="date"
                  value={searchDob}
                  onChange={(e) => setSearchDob(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="w-full md:w-auto">
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">
              {results.length > 0 ? `Found ${results.length} patient(s)` : "No results"}
            </h2>

            {results.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No matching patients found. Try adjusting your search.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {results.map((patient) => (
                  <Card
                    key={`${patient.source}-${patient.id}`}
                    className="hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-primary" />
                            <h3 className="font-medium text-foreground">{patient.patientName}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {patient.dateOfBirth && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                DOB: {format(new Date(patient.dateOfBirth), "MMM d, yyyy")}
                              </span>
                            )}
                            {patient.chiefComplaint && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {patient.chiefComplaint}
                              </span>
                            )}
                          </div>
                          {patient.email && (
                            <p className="text-xs text-muted-foreground mt-1">{patient.email}</p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          Select
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
