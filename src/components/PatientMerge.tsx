import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, AlertTriangle, Users, ArrowRight, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";
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

interface PatientRecord {
  patient_name: string;
  date_of_birth: string;
  episodeCount: number;
  episodes: Array<{
    id: string;
    region: string;
    diagnosis: string;
    date_of_service: string;
    insurance?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    referring_physician?: string;
    medications?: string;
    medical_history?: string;
  }>;
}

export function PatientMerge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [duplicates, setDuplicates] = useState<PatientRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPrimary, setSelectedPrimary] = useState<string>("");
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const searchForDuplicates = async () => {
    if (searchQuery.trim().length < 2) {
      toast.error("Please enter at least 2 characters to search");
      return;
    }

    setIsSearching(true);
    try {
      const { data: episodes, error } = await supabase
        .from("episodes")
        .select("*")
        .ilike("patient_name", `%${searchQuery}%`)
        .order("date_of_service", { ascending: false });

      if (error) throw error;

      // Group by patient name (case-insensitive) and DOB
      const patientMap = new Map<string, PatientRecord>();

      episodes?.forEach((episode) => {
        const key = `${episode.patient_name.toLowerCase()}-${episode.date_of_birth}`;
        if (!patientMap.has(key)) {
          patientMap.set(key, {
            patient_name: episode.patient_name,
            date_of_birth: episode.date_of_birth,
            episodeCount: 0,
            episodes: [],
          });
        }
        const patient = patientMap.get(key)!;
        patient.episodeCount++;
        patient.episodes.push({
          id: episode.id,
          region: episode.region,
          diagnosis: episode.diagnosis || "",
          date_of_service: episode.date_of_service,
          insurance: episode.insurance,
          emergency_contact: episode.emergency_contact,
          emergency_phone: episode.emergency_phone,
          referring_physician: episode.referring_physician,
          medications: episode.medications,
          medical_history: episode.medical_history,
        });
      });

      // Find potential duplicates (similar names with same DOB or exact name matches)
      const potentialDuplicates: PatientRecord[] = [];
      const processed = new Set<string>();

      patientMap.forEach((patient, key) => {
        if (processed.has(key)) return;

        const similarPatients = [patient];
        
        patientMap.forEach((otherPatient, otherKey) => {
          if (key !== otherKey && !processed.has(otherKey)) {
            // Check for similar names with same DOB
            const nameSimilarity = calculateNameSimilarity(
              patient.patient_name.toLowerCase(),
              otherPatient.patient_name.toLowerCase()
            );
            
            if (nameSimilarity > 0.7 && patient.date_of_birth === otherPatient.date_of_birth) {
              similarPatients.push(otherPatient);
              processed.add(otherKey);
            }
          }
        });

        if (similarPatients.length > 1) {
          potentialDuplicates.push(...similarPatients);
          processed.add(key);
        }
      });

      setDuplicates(potentialDuplicates);
      
      if (potentialDuplicates.length === 0) {
        toast.info("No potential duplicate patients found");
      } else {
        toast.success(`Found ${potentialDuplicates.length} potential duplicate records`);
      }
    } catch (error) {
      console.error("Error searching for duplicates:", error);
      toast.error("Failed to search for duplicates");
    } finally {
      setIsSearching(false);
    }
  };

  const calculateNameSimilarity = (name1: string, name2: string): number => {
    // Simple Levenshtein distance-based similarity
    const maxLength = Math.max(name1.length, name2.length);
    if (maxLength === 0) return 1;
    
    const distance = levenshteinDistance(name1, name2);
    return 1 - distance / maxLength;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const handleMerge = async () => {
    if (!selectedPrimary) {
      toast.error("Please select a primary patient record");
      return;
    }

    const primaryPatient = duplicates.find(
      (p) => `${p.patient_name}-${p.date_of_birth}` === selectedPrimary
    );

    if (!primaryPatient) return;

    setIsMerging(true);
    try {
      // Get current user for audit log
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get user profile for clinic_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      // Collect all records being merged
      const mergedRecords = duplicates
        .filter((p) => `${p.patient_name}-${p.date_of_birth}` !== selectedPrimary)
        .map((p) => ({
          patient_name: p.patient_name,
          date_of_birth: p.date_of_birth,
          episode_ids: p.episodes.map((e) => e.id),
          episode_count: p.episodeCount,
        }));

      // Get all episode IDs that need to be updated
      const episodeIdsToUpdate: string[] = [];
      duplicates.forEach((patient) => {
        if (`${patient.patient_name}-${patient.date_of_birth}` !== selectedPrimary) {
          episodeIdsToUpdate.push(...patient.episodes.map((e) => e.id));
        }
      });

      // Update all episodes to match the primary patient's name and DOB
      const { error: updateError } = await supabase
        .from("episodes")
        .update({
          patient_name: primaryPatient.patient_name,
          date_of_birth: primaryPatient.date_of_birth,
        })
        .in("id", episodeIdsToUpdate);

      if (updateError) throw updateError;

      // Create audit log entry for the merge
      const auditLogData = {
        action: "patient_merge",
        table_name: "episodes",
        record_id: `merge_${Date.now()}`,
        user_id: user.id,
        clinic_id: profile?.clinic_id || null,
        old_data: {
          merged_patients: mergedRecords,
          total_episodes_affected: episodeIdsToUpdate.length,
        },
        new_data: {
          primary_patient: {
            patient_name: primaryPatient.patient_name,
            date_of_birth: primaryPatient.date_of_birth,
            total_episodes: primaryPatient.episodeCount + episodeIdsToUpdate.length,
          },
          episode_ids_updated: episodeIdsToUpdate,
        },
        user_agent: navigator.userAgent,
        ip_address: null, // Client-side doesn't have access to IP
      };

      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert(auditLogData);

      if (auditError) {
        console.error("Failed to create audit log:", auditError);
        // Don't fail the merge if audit log fails
      }

      toast.success(
        `Successfully merged ${episodeIdsToUpdate.length} episodes into ${primaryPatient.patient_name}'s record`
      );

      // Reset state
      setDuplicates([]);
      setSelectedPrimary("");
      setSearchQuery("");
      setShowMergeDialog(false);
    } catch (error) {
      console.error("Error merging patients:", error);
      toast.error("Failed to merge patient records");
    } finally {
      setIsMerging(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalEpisodes = duplicates.reduce((sum, p) => sum + p.episodeCount, 0);

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Patient Record Merge
        </CardTitle>
        <CardDescription>
          Find and merge duplicate patient records to maintain data integrity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tool identifies patients with similar names and matching dates of birth. 
            Merging will consolidate all episodes under a single patient record.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="duplicate-search">Search Patient Name</Label>
            <Input
              id="duplicate-search"
              placeholder="Enter patient name to find duplicates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchForDuplicates()}
            />
          </div>
          <Button
            onClick={searchForDuplicates}
            disabled={isSearching}
            className="mt-8"
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? "Searching..." : "Find Duplicates"}
          </Button>
        </div>

        {duplicates.length > 0 && (
          <>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {duplicates.length} potential duplicate records with {totalEpisodes} total episodes.
                Select the primary record to merge into.
              </AlertDescription>
            </Alert>

            <ScrollArea className="h-[500px] rounded-md border p-4">
              <RadioGroup value={selectedPrimary} onValueChange={setSelectedPrimary}>
                <div className="space-y-4">
                  {duplicates.map((patient, index) => {
                    const key = `${patient.patient_name}-${patient.date_of_birth}`;
                    return (
                      <Card
                        key={key}
                        className={`${
                          selectedPrimary === key
                            ? "border-primary border-2"
                            : ""
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value={key} id={key} className="mt-1" />
                              <div>
                                <Label htmlFor={key} className="text-base font-semibold cursor-pointer">
                                  {patient.patient_name}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  DOB: {formatDate(patient.date_of_birth)}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {patient.episodeCount} episode{patient.episodeCount !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {patient.episodes.slice(0, 3).map((episode) => (
                              <div
                                key={episode.id}
                                className="text-sm p-2 rounded-md bg-muted/50"
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium">{episode.region}</span>
                                  <span className="text-muted-foreground">
                                    {formatDate(episode.date_of_service)}
                                  </span>
                                </div>
                                <p className="text-muted-foreground">{episode.diagnosis}</p>
                              </div>
                            ))}
                            {patient.episodeCount > 3 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{patient.episodeCount - 3} more episodes
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </RadioGroup>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDuplicates([]);
                  setSelectedPrimary("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowMergeDialog(true)}
                disabled={!selectedPrimary}
                className="gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Merge Records
              </Button>
            </div>
          </>
        )}

        <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Patient Merge
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  This action will merge all duplicate patient records into the selected primary record.
                </p>
                <p className="font-semibold">
                  All {totalEpisodes} episodes will be consolidated under:
                </p>
                <p className="text-foreground">
                  {duplicates.find((p) => `${p.patient_name}-${p.date_of_birth}` === selectedPrimary)?.patient_name}
                </p>
                <p className="text-destructive font-semibold mt-4">
                  This action cannot be undone.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isMerging}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleMerge}
                disabled={isMerging}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isMerging ? "Merging..." : "Confirm Merge"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
