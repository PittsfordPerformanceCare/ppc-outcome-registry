import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  Award,
  ArrowRight
} from "lucide-react";
import drMichaelFink from "@/assets/providers/dr-michael-fink.jpg";

const providers = [
  {
    name: "Dr. Michael Fink",
    title: "Clinical Director",
    credentials: "DC, DACNB",
    specialties: ["Functional Neurology", "Concussion Management", "Vestibular Rehabilitation"],
    bio: "Dr. Fink is a board-certified chiropractic neurologist and the founder of Pittsford Performance Care. He specializes in functional neurology, concussion management, and complex neurologic cases.",
    image: drMichaelFink
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
              Board-certified specialists in functional neurology, concussion management, 
              and neuromuscular rehabilitation.
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
                      alt={provider.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        {provider.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{provider.name}</CardTitle>
                  <div className="space-y-1">
                    <p className="text-sm text-primary font-medium">{provider.title}</p>
                    <p className="text-sm text-muted-foreground">{provider.credentials}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{provider.bio}</p>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Credentials</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced training and board certifications in neurologic specialties
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4 p-6 rounded-lg bg-background border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Board Certifications</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Diplomate, American Chiropractic Neurology Board (DACNB)</li>
                  <li>Fellow, American College of Functional Neurology (FACFN)</li>
                  <li>Neurologic Clinical Specialist (NCS)</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-lg bg-background border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Advanced Training</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Post-doctoral functional neurology residency</li>
                  <li>Vestibular rehabilitation certification</li>
                  <li>Concussion management specialist training</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Schedule With Our Team</h2>
          <p className="mb-6 opacity-90 max-w-xl mx-auto">
            Our providers are ready to help you find answers and start your recovery.
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
