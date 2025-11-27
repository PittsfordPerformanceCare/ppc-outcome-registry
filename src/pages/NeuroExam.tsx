import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NeuroExamForm } from "@/components/NeuroExamForm";
import { NeuroLetterGenerator } from "@/components/NeuroLetterGenerator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

export default function NeuroExam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get('episode');
  const [showLetterDialog, setShowLetterDialog] = useState(false);

  if (!episodeId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Missing Episode ID</h1>
          <p className="text-muted-foreground mb-4">
            Please access this page from an episode view.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/episode-summary?id=${episodeId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Episode
        </Button>
        <Button onClick={() => setShowLetterDialog(true)} variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Generate Letters
        </Button>
      </div>

      <NeuroExamForm
        episodeId={episodeId}
        onSaved={() => navigate(`/episode-summary?id=${episodeId}`)}
      />

      <NeuroLetterGenerator
        episodeId={episodeId}
        open={showLetterDialog}
        onOpenChange={setShowLetterDialog}
      />
    </div>
  );
}