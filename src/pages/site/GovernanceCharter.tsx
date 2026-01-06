import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  Activity, 
  Users, 
  Database, 
  Lock,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  FileSearch
} from "lucide-react";

interface GovernanceDocument {
  title: string;
  filename: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  status: "Canonical" | "Locked" | "Active";
}

const governanceDocuments: GovernanceDocument[] = [
  {
    title: "Enterprise Platform Specification",
    filename: "PPC-Unified-Platform-Enterprise-Spec.md",
    category: "Architecture",
    description: "Master technical and architectural reference defining the platform's React/TypeScript/Supabase stack, security controls, clinical feature specs, and compliance standards.",
    icon: <Database className="h-5 w-5" />,
    status: "Canonical"
  },
  {
    title: "Care Targets & Multi-Complaint Governance",
    filename: "PPC-Care-Targets-Governance.md",
    category: "Clinical Model",
    description: "Foundational multi-complaint care model defining Care Target status, discharge at target level, and patient experience principles.",
    icon: <Activity className="h-5 w-5" />,
    status: "Locked"
  },
  {
    title: "Care Target Outcome Association",
    filename: "PPC-Care-Target-Outcome-Association.md",
    category: "Clinical Model",
    description: "Outcome binding rules enforcing baseline→discharge symmetry per Care Target and preventing outcome blending in multi-complaint episodes.",
    icon: <ClipboardCheck className="h-5 w-5" />,
    status: "Canonical"
  },
  {
    title: "Phase 3: PCP Discharge Guardrails",
    filename: "PPC-Phase-3-Guardrail-Enforcement-Source-of-Truth.md",
    category: "Automation",
    description: "Server-side enforcement model for Episode-Level PCP Discharge Summary automation guardrails.",
    icon: <Shield className="h-5 w-5" />,
    status: "Locked"
  },
  {
    title: "Phase 4A: Patient Discharge Letter",
    filename: "PPC-Phase-4A-Patient-Discharge-Letter-Governance.md",
    category: "Communication",
    description: "Episode-level patient discharge letter governance ensuring calm, clear transition artifacts with clinician confirmation.",
    icon: <MessageSquare className="h-5 w-5" />,
    status: "Locked"
  },
  {
    title: "Phase 4B: Care Target Discharge Communication",
    filename: "PPC-Phase-4B-Care-Target-Discharge-Patient-Communication-Governance.md",
    category: "Communication",
    description: "Care Target-level discharge messaging governance for partial transitions while episode remains active.",
    icon: <MessageSquare className="h-5 w-5" />,
    status: "Locked"
  },
  {
    title: "Phase 5: Analytics & Registry Views",
    filename: "PPC-Phase-5-Analytics-Registry-Views-Governance.md",
    category: "Analytics",
    description: "Care Target-centric analytics views for research-grade analysis, publication readiness, and payor conversations.",
    icon: <BarChart3 className="h-5 w-5" />,
    status: "Canonical"
  },
  {
    title: "Lead-to-Resolution Analytics",
    filename: "PPC-Lead-to-Resolution-Analytics-Governance.md",
    category: "Analytics",
    description: "Governance guardrails connecting lead source attribution to clinical outcomes while preventing liability expansion.",
    icon: <BarChart3 className="h-5 w-5" />,
    status: "Canonical"
  },
  {
    title: "Patient Communication System",
    filename: "PPC-Patient-Communication-System-Canonical-Reference.md",
    category: "Communication",
    description: "Authoritative standard for prospective patient email communications including tone, content, and intent.",
    icon: <MessageSquare className="h-5 w-5" />,
    status: "Locked"
  },
  {
    title: "Registry Scope Statement",
    filename: "PPC-Registry-Scope-Statement.md",
    category: "Research",
    description: "Defines registry inclusions, exclusions, intended uses, and limitations for de-identified outcomes data.",
    icon: <FileSearch className="h-5 w-5" />,
    status: "Canonical"
  },
  {
    title: "Registry Dataset Description",
    filename: "PPC-Registry-Dataset-Description.md",
    category: "Research",
    description: "De-identified dataset structure, pseudonymization methods, and governance controls for research exports.",
    icon: <Database className="h-5 w-5" />,
    status: "Canonical"
  },
  {
    title: "De-Identification Export Pipeline",
    filename: "PPC-De-Identification-Export-Pipeline.md",
    category: "Research",
    description: "Three-layer architecture for generating research-ready datasets without exposing PHI.",
    icon: <Lock className="h-5 w-5" />,
    status: "Canonical"
  },
  {
    title: "Lead Source Taxonomy",
    filename: "PPC-Lead-Source-Taxonomy.md",
    category: "Operations",
    description: "Canonical lead source vocabulary ensuring consistent analytics and governance across all intake attribution.",
    icon: <Users className="h-5 w-5" />,
    status: "Canonical"
  },
  {
    title: "Research Export Cohorts",
    filename: "PPC-Research-Export-Cohorts.md",
    category: "Research",
    description: "Supported cohort definitions and date range constraints for research data exports.",
    icon: <FileSearch className="h-5 w-5" />,
    status: "Active"
  },
  {
    title: "Research Export Data Dictionary",
    filename: "PPC-Research-Export-Data-Dictionary.md",
    category: "Research",
    description: "Field definitions and transformations for all research export datasets.",
    icon: <FileText className="h-5 w-5" />,
    status: "Active"
  },
  {
    title: "Shadow Site Replicability Proof",
    filename: "PPC-Shadow-Site-Replicability-Proof.md",
    category: "Architecture",
    description: "Proof artifact demonstrating platform site-agnostic replicability with isolated data.",
    icon: <Database className="h-5 w-5" />,
    status: "Active"
  }
];

const categoryColors: Record<string, string> = {
  "Architecture": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Clinical Model": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Communication": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Analytics": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "Research": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  "Operations": "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
  "Automation": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300"
};

const statusColors: Record<string, string> = {
  "Canonical": "bg-primary/10 text-primary border-primary/20",
  "Locked": "bg-destructive/10 text-destructive border-destructive/20",
  "Active": "bg-success/10 text-success border-success/20"
};

export default function GovernanceCharter() {
  const groupedDocs = governanceDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, GovernanceDocument[]>);

  const categoryOrder = ["Architecture", "Clinical Model", "Communication", "Automation", "Analytics", "Research", "Operations"];

  return (
    <>
      <Helmet>
        <title>Governance Charter | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Platform governance documentation establishing canonical standards for clinical operations, data integrity, patient communication, and research compliance." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-50 to-background dark:from-slate-900/50 border-b">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="text-xs">Internal Reference</Badge>
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  Versioned & Locked
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Governance Charter
              </h1>
              <p className="text-lg text-muted-foreground">
                Canonical governance documentation establishing authoritative standards for platform behavior, 
                clinical operations, data integrity, patient communication, and research compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Core Principle */}
        <div className="container mx-auto px-4 py-8">
          <Card className="border-primary/20 bg-primary/5 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold mb-2">Core Governance Principle</h2>
                  <p className="text-muted-foreground">
                    All documents marked <Badge variant="outline" className={statusColors["Locked"]}>Locked</Badge> or{" "}
                    <Badge variant="outline" className={statusColors["Canonical"]}>Canonical</Badge> are authoritative 
                    sources of truth. Any deviation must be intentional, documented, and versioned. These artifacts 
                    supersede verbal requirements or informal specifications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents by Category */}
          <div className="space-y-8">
            {categoryOrder.map((category) => {
              const docs = groupedDocs[category];
              if (!docs) return null;

              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold">{category}</h2>
                    <Badge className={categoryColors[category]}>{docs.length} documents</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {docs.map((doc) => (
                      <Card key={doc.filename} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {doc.icon}
                              <CardTitle className="text-base">{doc.title}</CardTitle>
                            </div>
                            <Badge variant="outline" className={statusColors[doc.status]}>
                              {doc.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                          <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            /docs/{doc.filename}
                          </code>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <Card className="mt-12 border-muted">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong>Document Access:</strong> All governance documents are stored in the <code className="bg-muted px-1 rounded">/docs/</code> directory 
                    and are version-controlled. Changes require explicit revision and documentation.
                  </p>
                  <p>
                    <strong>Related Resources:</strong>{" "}
                    <Link to="/site/clinical-governance" className="text-primary hover:underline">Clinical Governance</Link>
                    {" · "}
                    <Link to="/site/works-cited" className="text-primary hover:underline">Works Cited</Link>
                    {" · "}
                    <Link to="/site/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
