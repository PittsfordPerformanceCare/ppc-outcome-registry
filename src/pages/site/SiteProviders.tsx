import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  ArrowRight,
  BookOpen
} from "lucide-react";
import drMichaelFink from "@/assets/providers/dr-michael-fink.jpg";
import drJamesGaffney from "@/assets/providers/dr-james-gaffney.jpg";
import drRobertLuckey from "@/assets/providers/dr-robert-luckey.jpg";

const providers = [
  {
    name: "Dr. Michael Fink, DC",
    title: "Senior Lead Clinician",
    specialties: [
      "Concussion & mTBI Care",
      "Pediatric & Athlete Performance Care",
      "Neuromuscular Rehabilitation",
      "Injury Prevention & Return-to-Play"
    ],
    bio: "Dr. Fink earned his undergraduate degree from Houghton University (2009) and his Doctor of Chiropractic from Northeastern College of Health Sciences (2012). Since joining PPC in 2013, he has completed extensive post-doctoral coursework in clinical neuroscience and is currently pursuing advanced training in Functional Neurology. Dr. Fink coordinates musculoskeletal care operations and actively bridges professional gaps in pediatric athlete care through evidence-based education and interdisciplinary collaboration with physicians, athletic trainers, and school personnel.",
    image: drMichaelFink,
    clinicalFocus: [
      { title: "Pediatric Concussion Care", slug: "/site/articles/pediatric/pediatric-concussion-care" },
      { title: "Autonomic Nervous System Flow", slug: "/site/articles/concussion/autonomic-nervous-system-flow" },
      { title: "Return to Learn After Concussion", slug: "/site/articles/pediatric/return-to-learn" }
    ]
  },
  {
    name: "Dr. James Gaffney, DC",
    title: "Primary Clinician, Neurological Care",
    specialties: [
      "Concussion & mTBI Care",
      "Functional Neurology-Based Rehabilitation",
      "Visual-Vestibular Integration",
      "Athlete Performance Care"
    ],
    bio: "Dr. Gaffney earned his undergraduate degree from Nazareth University while competing in Division II Soccer and Lacrosse (2013) and his Doctor of Chiropractic from Northeastern College of Health Sciences (2018). He has completed extensive post-doctoral education in clinical neuroscience with a focus on concussion and neurologic contributors to athletic performance. As a primary clinician for neurological cases alongside Dr. Luckey, Dr. Gaffney applies neurology-driven principles to mTBI recovery and performance restoration through structured rehabilitation protocols.",
    image: drJamesGaffney,
    clinicalFocus: [
      { title: "Post-Concussion Performance Decline", slug: "/site/articles/athlete/post-concussion-performance-decline" },
      { title: "Visual-Vestibular Mismatch", slug: "/site/articles/concussion/visual-vestibular-mismatch" },
      { title: "Cerebellar Timing & Coordination", slug: "/site/articles/concussion/cerebellar-timing-coordination" }
    ]
  },
  {
    name: "Dr. C. Robert Luckey, DC",
    title: "Clinic Director",
    credentialNote: "Board-Eligible in Functional Neurology",
    specialties: [
      "Concussion & Post-Concussion Syndrome",
      "Visual-Vestibular & Balance Disorders",
      "Chronic Migraine & Headache",
      "Performance Readiness Assessment"
    ],
    bio: "Dr. Luckey leads PPC's neurology-driven approach to concussion recovery, complex musculoskeletal care, and performance readiness. With over 20 years of clinical experience treating more than 20,000 patients—including 1,500+ neurologic cases—he integrates applied neuroscience, movement science, and data-driven outcome tracking into clinical practice. Dr. Luckey is the inventor or co-inventor on 30+ patent claims spanning clinical neuroscience and healthcare data analytics, and he developed PPC's proprietary outcome registry to track patient trajectories and inform evidence-based care decisions.",
    image: drRobertLuckey,
    clinicalFocus: [
      { title: "Visual-Vestibular Mismatch", slug: "/site/articles/concussion/visual-vestibular-mismatch" },
      { title: "Autonomic Nervous System Flow", slug: "/site/articles/concussion/autonomic-nervous-system-flow" },
      { title: "Post-Concussion Performance Decline", slug: "/site/articles/athlete/post-concussion-performance-decline" }
    ]
  }
];

const SiteProviders = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Our Providers
            </h1>
            <p className="text-xl text-muted-foreground">
              Doctoral-level clinicians with advanced post-doctoral training in clinical neuroscience, 
              concussion care, and neuromuscular rehabilitation.
            </p>
          </div>
        </div>
      </section>

      {/* Providers Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {providers.map((provider, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
                  {provider.image ? (
                    <img 
                      src={provider.image} 
                      alt={`${provider.name} - ${provider.title} at Pittsford Performance Care`}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        {provider.name.split(' ').filter(n => !n.includes(',')).map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{provider.name}</CardTitle>
                  <div className="space-y-1">
                    <p className="text-sm text-primary font-medium">{provider.title}</p>
                    {'credentialNote' in provider && provider.credentialNote && (
                      <p className="text-sm text-muted-foreground font-medium">
                        {provider.credentialNote}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{provider.bio}</p>
                  
                  {/* Specialties */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Specialties
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {provider.specialties.map((specialty, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Clinical Focus & Related Reading */}
                  {provider.clinicalFocus && provider.clinicalFocus.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        Clinical Focus & Related Reading
                      </h4>
                      <ul className="space-y-1">
                        {provider.clinicalFocus.map((article, idx) => (
                          <li key={idx}>
                            <Link 
                              to={article.slug}
                              className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                            >
                              {article.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Training & Professional Education Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Advanced Training & Professional Education</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our clinicians have completed extensive post-doctoral education and advanced clinical training 
              in neurologically focused care models, including:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4 p-6 rounded-lg bg-background border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Post-Doctoral Education</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Post-doctoral education in Clinical Neuroscience & Functional Neurology</li>
                  <li>Advanced concussion and mTBI care training</li>
                  <li>Vestibular and balance rehabilitation coursework</li>
                  <li>Neuromuscular rehabilitation and performance-based care models</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-lg bg-background border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Clinical Training Focus</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Neurology-driven rehabilitation principles</li>
                  <li>Visual-vestibular integration assessment</li>
                  <li>Performance-based care models</li>
                  <li>Data-driven outcome tracking systems</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground italic max-w-2xl mx-auto">
              Board certification status varies by provider and is identified within individual profiles.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Schedule With Our Team</h2>
          <p className="mb-6 opacity-90 max-w-xl mx-auto">
            Our providers are ready to help you find answers and guide your recovery.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/patient/concierge">
              Schedule Evaluation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SiteProviders;
