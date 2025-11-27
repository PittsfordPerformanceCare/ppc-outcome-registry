import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Briefcase, GraduationCap, Copy, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NeuroLetterGeneratorProps {
  episodeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NeuroLetterGenerator = ({ episodeId, open, onOpenChange }: NeuroLetterGeneratorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employeeLetter, setEmployeeLetter] = useState("");
  const [schoolLetter, setSchoolLetter] = useState("");
  const [activeTab, setActiveTab] = useState<"employee" | "school">("employee");

  const generateLetter = async (type: "employee" | "school") => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-neuro-letter", {
        body: { episodeId, letterType: type }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      if (type === "employee") {
        setEmployeeLetter(data.letter);
      } else {
        setSchoolLetter(data.letter);
      }

      toast({
        title: "Letter Generated",
        description: `${type === "employee" ? "Employee" : "School"} letter has been generated successfully.`
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
      description: "Letter copied to clipboard"
    });
  };

  const downloadLetter = (text: string, type: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-letter-${episodeId}.txt`;
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
            Generate Professional Letters
          </DialogTitle>
          <DialogDescription>
            Generate customized letters for employers or schools based on neurologic examination findings
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "employee" | "school")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Employee Letter
            </TabsTrigger>
            <TabsTrigger value="school" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              School Letter
            </TabsTrigger>
          </TabsList>

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
                  <Button onClick={() => downloadLetter(employeeLetter, "employee")} variant="outline">
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
                  <Button onClick={() => downloadLetter(schoolLetter, "school")} variant="outline">
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
