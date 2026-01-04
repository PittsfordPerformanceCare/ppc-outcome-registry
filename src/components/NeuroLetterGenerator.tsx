import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Briefcase, GraduationCap, Copy, Download, Stethoscope } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NeuroLetterGeneratorProps {
  episodeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LetterType = "employee" | "school" | "pcp";

export const NeuroLetterGenerator = ({ episodeId, open, onOpenChange }: NeuroLetterGeneratorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employeeLetter, setEmployeeLetter] = useState("");
  const [schoolLetter, setSchoolLetter] = useState("");
  const [pcpSummary, setPcpSummary] = useState("");
  const [activeTab, setActiveTab] = useState<LetterType>("pcp");

  const generateLetter = async (type: LetterType) => {
    setLoading(true);
    try {
      // Get current session - this is more reliable than getUser
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to generate letters",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const user = session.user;
      let data, error;

      if (type === "pcp") {
        // Use the dedicated neuro PCP summary function
        const result = await supabase.functions.invoke("generate-neuro-pcp-summary", {
          body: { episodeId }
        });
        data = result.data;
        error = result.error;
      } else {
        // Use the existing letter function for employee/school
        const result = await supabase.functions.invoke("generate-neuro-letter", {
          body: { episodeId, letterType: type }
        });
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      const letterContent = type === "pcp" ? data.summary : data.letter;
      
      // Save the letter to the database
      const { error: saveError } = await supabase
        .from("patient_letters")
        .insert({
          episode_id: episodeId,
          user_id: user.id,
          letter_type: type,
          title: type === "employee" 
            ? "Employer Return-to-Work Letter" 
            : type === "school" 
            ? "School Return Letter"
            : "Neurological PCP Summary",
          content: letterContent,
          generated_by: user.id,
        });

      if (saveError) {
        console.error("Error saving letter:", saveError);
        // Don't throw - still show the letter even if save fails
      }

      if (type === "employee") {
        setEmployeeLetter(letterContent);
      } else if (type === "school") {
        setSchoolLetter(letterContent);
      } else {
        setPcpSummary(letterContent);
      }

      toast({
        title: type === "pcp" ? "PCP Summary Generated" : "Letter Generated",
        description: type === "pcp" 
          ? "Neurological PCP summary has been generated and saved."
          : `${type === "employee" ? "Employee" : "School"} letter has been generated and saved.`
      });
    } catch (error: any) {
      console.error("Error generating letter:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate letter",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  const downloadLetter = (text: string, type: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-${episodeId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Professional Documents
          </DialogTitle>
          <DialogDescription>
            Generate PCP summaries and customized letters based on neurologic examination findings
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LetterType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pcp" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              PCP Summary
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Employer Letter
            </TabsTrigger>
            <TabsTrigger value="school" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              School Letter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pcp" className="space-y-4 mt-4">
            {!pcpSummary ? (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Generate a comprehensive clinical summary for the referring physician with detailed neurological examination findings, outcome measures, and recommendations.
                </p>
                <Button onClick={() => generateLetter("pcp")} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate PCP Summary"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={pcpSummary}
                  onChange={(e) => setPcpSummary(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(pcpSummary)} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button onClick={() => downloadLetter(pcpSummary, "pcp-summary")} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button onClick={() => generateLetter("pcp")} variant="outline" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      "Regenerate"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="employee" className="space-y-4 mt-4">
            {!employeeLetter ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Generate a professional letter for the employer outlining work restrictions and accommodations
                </p>
                <Button onClick={() => generateLetter("employee")} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Employee Letter"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={employeeLetter}
                  onChange={(e) => setEmployeeLetter(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(employeeLetter)} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button onClick={() => downloadLetter(employeeLetter, "employee-letter")} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button onClick={() => generateLetter("employee")} variant="outline" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      "Regenerate"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="school" className="space-y-4 mt-4">
            {!schoolLetter ? (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Generate a professional letter for the school outlining academic accommodations and restrictions
                </p>
                <Button onClick={() => generateLetter("school")} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate School Letter"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={schoolLetter}
                  onChange={(e) => setSchoolLetter(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(schoolLetter)} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button onClick={() => downloadLetter(schoolLetter, "school-letter")} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button onClick={() => generateLetter("school")} variant="outline" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      "Regenerate"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
