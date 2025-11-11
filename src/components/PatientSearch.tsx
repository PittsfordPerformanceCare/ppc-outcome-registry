import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Calendar, FileText, ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PPC_CONFIG } from "@/lib/ppcConfig";
import { PatientMerge } from "./PatientMerge";

interface PatientData {
  patient_name: string;
  date_of_birth: string;
  episodes: Array<{
    id: string;
    region: string;
    diagnosis: string;
    date_of_service: string;
    clinician: string;
    insurance?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    referring_physician?: string;
    medications?: string;
    medical_history?: string;
  }>;
}

interface PatientSearchProps {
  onPatientSelect: (patient: PatientData) => void;
}

export function PatientSearch({ onPatientSelect }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Advanced filter states
  const [dobFilter, setDobFilter] = useState("");
  const [diagnosisFilter, setDiagnosisFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  useEffect(() => {
    const searchPatients = async () => {
      // Need at least 2 characters in name search OR at least one advanced filter
      const hasNameSearch = searchQuery.trim().length >= 2;
      const hasAdvancedFilter = dobFilter || diagnosisFilter || regionFilter || dateFromFilter || dateToFilter;
      
      if (!hasNameSearch && !hasAdvancedFilter) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        let query = supabase
          .from("episodes")
          .select("*")
          .order("date_of_service", { ascending: false })
          .limit(100);

        // Apply filters
        if (hasNameSearch) {
          query = query.ilike("patient_name", `%${searchQuery}%`);
        }
        
        if (dobFilter) {
          query = query.eq("date_of_birth", dobFilter);
        }
        
        if (diagnosisFilter) {
          query = query.ilike("diagnosis", `%${diagnosisFilter}%`);
        }
        
        if (regionFilter) {
          query = query.eq("region", regionFilter);
        }
        
        if (dateFromFilter) {
          query = query.gte("date_of_service", dateFromFilter);
        }
        
        if (dateToFilter) {
          query = query.lte("date_of_service", dateToFilter);
        }

        const { data: episodes, error } = await query;

        if (error) throw error;

        // Group episodes by patient name and DOB
        const patientMap = new Map<string, PatientData>();
        
        episodes?.forEach((episode) => {
          const key = `${episode.patient_name}-${episode.date_of_birth}`;
          if (!patientMap.has(key)) {
            patientMap.set(key, {
              patient_name: episode.patient_name,
              date_of_birth: episode.date_of_birth,
              episodes: [],
            });
          }
          patientMap.get(key)!.episodes.push({
            id: episode.id,
            region: episode.region,
            diagnosis: episode.diagnosis || "",
            date_of_service: episode.date_of_service,
            clinician: episode.clinician || "",
            insurance: episode.insurance,
            emergency_contact: episode.emergency_contact,
            emergency_phone: episode.emergency_phone,
            referring_physician: episode.referring_physician,
            medications: episode.medications,
            medical_history: episode.medical_history,
          });
        });

        setSearchResults(Array.from(patientMap.values()));
        setShowResults(true);
      } catch (error) {
        console.error("Error searching patients:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, dobFilter, diagnosisFilter, regionFilter, dateFromFilter, dateToFilter]);

  const handlePatientSelect = (patient: PatientData) => {
    onPatientSelect(patient);
    setSearchQuery("");
    setShowResults(false);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDobFilter("");
    setDiagnosisFilter("");
    setRegionFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setShowResults(false);
  };

  const hasActiveFilters = dobFilter || diagnosisFilter || regionFilter || dateFromFilter || dateToFilter;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">Patient Search</TabsTrigger>
        <TabsTrigger value="merge">Merge Duplicates</TabsTrigger>
      </TabsList>

      <TabsContent value="search">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Patient Search
            </CardTitle>
            <CardDescription>
              Search for existing patients to view their history and create a new episode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="patient-search">Search by Patient Name</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="patient-search"
              placeholder="Type patient name to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {[dobFilter, diagnosisFilter, regionFilter, dateFromFilter, dateToFilter].filter(Boolean).length}
              </Badge>
            )}
            {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Advanced Filter Options */}
        {showAdvancedFilters && (
          <Card className="border-dashed">
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dob-filter">Date of Birth</Label>
                  <Input
                    id="dob-filter"
                    type="date"
                    value={dobFilter}
                    onChange={(e) => setDobFilter(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region-filter">Region</Label>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger id="region-filter">
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All regions</SelectItem>
                      {PPC_CONFIG.regionEnum.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis-filter">Diagnosis</Label>
                <Input
                  id="diagnosis-filter"
                  placeholder="Search by diagnosis..."
                  value={diagnosisFilter}
                  onChange={(e) => setDiagnosisFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Episode Date Range</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date-from-filter" className="text-sm text-muted-foreground">
                      From
                    </Label>
                    <Input
                      id="date-from-filter"
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-to-filter" className="text-sm text-muted-foreground">
                      To
                    </Label>
                    <Input
                      id="date-to-filter"
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showResults && searchResults.length > 0 && (
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="space-y-2 p-4">
              {searchResults.map((patient, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {patient.patient_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          DOB: {formatDate(patient.date_of_birth)}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        Select Patient
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Episode History ({patient.episodes.length})
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 pt-2">
                        {patient.episodes.slice(0, 5).map((episode) => (
                          <div
                            key={episode.id}
                            className="rounded-lg border bg-card p-3 text-sm space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{episode.region}</Badge>
                              <span className="text-muted-foreground text-xs">
                                {formatDate(episode.date_of_service)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{episode.diagnosis}</p>
                              <p className="text-muted-foreground text-xs">
                                {episode.clinician}
                              </p>
                            </div>
                          </div>
                        ))}
                        {patient.episodes.length > 5 && (
                          <p className="text-xs text-muted-foreground text-center pt-2">
                            +{patient.episodes.length - 5} more episodes
                          </p>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {showResults && searchResults.length === 0 && !isSearching && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No existing patients found with that name
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Continue filling out the form to create a new patient episode
            </p>
          </Card>
        )}

        {isSearching && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Searching patients...</p>
          </Card>
        )}
      </CardContent>
    </Card>
      </TabsContent>

      <TabsContent value="merge">
        <PatientMerge />
      </TabsContent>
    </Tabs>
  );
}
