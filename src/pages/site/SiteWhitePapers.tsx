import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Separator } from "@/components/ui/separator";
import { MedicalWebPageSchema, BreadcrumbSchema } from "@/components/site/StructuredData";

interface WhitePaper {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorTitle: string;
  year: string;
  description: string;
  pdfUrl?: string;
  webUrl?: string;
}

const whitePapers: WhitePaper[] = [
  {
    id: "long-covid-neuro-covid",
    title: "Persistent Neurologic Symptoms After COVID-19",
    subtitle: "A Clinical Overview of Long COVID and Neuro COVID",
    author: "C. Robert Luckey, DC",
    authorTitle: "Clinic Director, Pittsford Performance Care",
    year: "2025",
    description: "A clinically grounded overview of persistent neurologic symptoms following SARS-CoV-2 infection, with emphasis on functional neurologic disruption, autonomic involvement, and systems based models of post viral recovery.",
    pdfUrl: "/white-papers/long-covid-neuro-covid.pdf",
    webUrl: "/site/white-papers/long-covid-neuro-covid"
  }
];

const SiteWhitePapers = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>PPC Clinical White Paper Series | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Educational white papers synthesizing current evidence and clinical observations related to neurologic, vestibular, autonomic, and post injury recovery." 
        />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/white-papers" />
      </Helmet>
      <MedicalWebPageSchema
        name="PPC Clinical White Paper Series"
        description="Educational white papers synthesizing current evidence and clinical observations related to neurologic, vestibular, autonomic, and post injury recovery."
        url="https://muse-meadow-app.lovable.app/site/white-papers"
        about={[
          "Clinical White Papers",
          "Neurologic Recovery",
          "Vestibular Disorders",
          "Autonomic Dysregulation",
          "Post Injury Recovery",
          "Long COVID",
          "Post Concussion Syndrome"
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://muse-meadow-app.lovable.app/site/home" },
          { name: "Clinical Governance", url: "https://muse-meadow-app.lovable.app/site/clinical-governance" },
          { name: "White Paper Series", url: "https://muse-meadow-app.lovable.app/site/white-papers" }
        ]}
      />

      {/* Header Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-background dark:from-slate-900 dark:to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              PPC Clinical White Paper Series
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Introduction */}
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                The PPC Clinical White Paper Series provides educational, evidence informed reviews of neurologic, 
                vestibular, autonomic, and post injury recovery topics relevant to complex and persistent clinical 
                presentations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                These documents are intended to synthesize current peer reviewed research, emerging consensus, and 
                structured clinical observation through a neurologic systems based framework. The purpose of this 
                series is to support clinical understanding, interdisciplinary dialogue, and informed evaluation 
                rather than to propose treatment protocols or promote services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                White papers published within this series reflect conditions and recovery patterns commonly encountered 
                in post viral syndromes, concussion and post concussive presentations, dizziness and balance disorders, 
                autonomic dysregulation, and neurologically mediated fatigue states.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Scope and Intent */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Scope and Intent</h2>
              <p className="text-muted-foreground leading-relaxed">
                Each white paper in this series is developed with the following principles:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Educational and informational purpose only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Grounded in peer reviewed and high consensus medical literature</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Focused on neurologic mechanisms, systems interaction, and clinical context</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Independent of marketing, promotional, or service specific language</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Appropriate for physician review, payor evaluation, and institutional reference</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                The PPC Clinical White Paper Series is designed to complement ongoing research efforts and to support 
                thoughtful discussion as evidence and clinical understanding continue to evolve.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Available White Papers */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Available White Papers</h2>
              
              {whitePapers.map((paper) => (
                <div key={paper.id} className="space-y-3 py-4">
                  <h3 className="text-lg font-medium text-foreground">{paper.title}</h3>
                  <p className="text-sm text-muted-foreground italic">{paper.subtitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {paper.author}<br />
                    {paper.authorTitle}<br />
                    {paper.year}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {paper.description}
                  </p>
                  <div className="flex flex-col gap-1 pt-2">
                    {paper.pdfUrl && (
                      <a 
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                      >
                        View White Paper PDF
                      </a>
                    )}
                    {paper.webUrl && (
                      <Link 
                        to={paper.webUrl}
                        className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                      >
                        View Web Version
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Disclosure */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                White papers published within this series are provided for educational purposes only. They do not 
                constitute medical advice, clinical guidelines, or treatment recommendations. Content reflects current 
                evidence and clinical observations at the time of publication and may evolve as additional research 
                becomes available.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                No external funding was received for the development of these materials unless otherwise stated.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Internal Links */}
            <div className="space-y-3 pt-4">
              <p className="text-sm text-muted-foreground">Related pages:</p>
              <div className="flex flex-col gap-2">
                <Link 
                  to="/site/clinical-governance" 
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Clinical Governance & Outcomes
                </Link>
                <Link 
                  to="/resources/professional-outcomes/sample-review" 
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Professional Clinical Outcomes Review
                </Link>
                <Link 
                  to="/site/providers" 
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Provider Resources
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteWhitePapers;
