import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Brain, Eye, HelpCircle, AlertTriangle, Shield, FileText } from "lucide-react";
import { ReactNode } from "react";

interface DomainSection {
  title: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface EducationalNeuroscienceDomainPageProps {
  domainName: string;
  overview: ReactNode;
  educatorObservations: ReactNode;
  neurosciencePerspectives: ReactNode;
  contextualModifiers: ReactNode;
  misconceptions?: ReactNode;
  professionalQuestions: string[];
  governingDocuments: string[];
}

export function EducationalNeuroscienceDomainPage({
  domainName,
  overview,
  educatorObservations,
  neurosciencePerspectives,
  contextualModifiers,
  misconceptions,
  professionalQuestions,
  governingDocuments,
}: EducationalNeuroscienceDomainPageProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="outline" className="text-xs font-mono">
          Educational Neuroscience Reference
        </Badge>
        <h1 className="text-3xl font-bold text-foreground">{domainName} Domain</h1>
        <p className="text-sm text-muted-foreground italic">
          PSOF-Safe Educational Reference
        </p>
      </div>

      {/* Informational Notice */}
      <Alert className="bg-blue-500/10 border-blue-500/20">
        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
          This content is informational only. It does not constitute clinical guidance, 
          intervention rationale, or decision support. Professional judgment remains paramount.
        </AlertDescription>
      </Alert>

      {/* Domain Overview */}
      <DomainCard
        title="Domain Overview"
        icon={<Brain className="h-5 w-5 text-primary" />}
      >
        {overview}
      </DomainCard>

      {/* What Educators Sometimes Observe */}
      <DomainCard
        title="What Educators Sometimes Observe"
        icon={<Eye className="h-5 w-5 text-primary" />}
      >
        {educatorObservations}
      </DomainCard>

      {/* Educational Neuroscience Perspectives */}
      <DomainCard
        title="Educational Neuroscience Perspectives"
        icon={<BookOpen className="h-5 w-5 text-primary" />}
      >
        {neurosciencePerspectives}
      </DomainCard>

      {/* Contextual Modifiers */}
      <DomainCard
        title="Contextual Modifiers"
        icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
      >
        {contextualModifiers}
      </DomainCard>

      {/* Common Misconceptions (Optional) */}
      {misconceptions && (
        <DomainCard
          title="Common Misconceptions"
          icon={<HelpCircle className="h-5 w-5 text-primary" />}
        >
          {misconceptions}
        </DomainCard>
      )}

      {/* Questions Professionals Sometimes Explore */}
      <DomainCard
        title="Questions Professionals Sometimes Explore"
        icon={<HelpCircle className="h-5 w-5 text-primary" />}
      >
        <ul className="space-y-2">
          {professionalQuestions.map((question, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-1">•</span>
              <span className="italic">{question}</span>
            </li>
          ))}
        </ul>
      </DomainCard>

      {/* Relationship to PSOF */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Relationship to PSOF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>This content is <strong>optional</strong> and accessed at the discretion of the professional.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>No student data is shared with or referenced by this content.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Viewing this reference does not create records or influence PSOF data.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>PSOF does not interpret, apply, or act upon this content.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Governance Notice */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Governance Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This content is governed by and must comply with:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {governingDocuments.map((doc, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>{doc}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground italic">
            This reference is <strong>informational only</strong>, <strong>non-diagnostic</strong>, 
            and <strong>non-prescriptive</strong>. It does not replace professional training, 
            clinical expertise, or institutional protocols.
          </p>
        </CardContent>
      </Card>

      {/* Closing Statement */}
      <div className="text-center py-6 space-y-4">
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Learning and behavior emerge from interconnected systems shaped by development, 
          context, and experience. Educational neuroscience provides perspectives that may 
          enrich professional reflection—never replace it.
        </p>
        <p className="text-lg font-semibold text-primary">
          "Knowledge informs reflection — never direction."
        </p>
      </div>
    </div>
  );
}

function DomainCard({ 
  title, 
  icon, 
  children 
}: { 
  title: string; 
  icon?: ReactNode; 
  children: ReactNode;
}) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none text-foreground">
        {children}
      </CardContent>
    </Card>
  );
}
