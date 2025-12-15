import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const SiteContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - would integrate with backend
    toast({
      title: "Message Sent",
      description: "We'll get back to you within 1 business day."
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Contact Us | Pittsford Performance Care</title>
        <meta name="description" content="Contact Pittsford Performance Care for neurologic rehabilitation and musculoskeletal care. Located in Rochester, NY." />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/contact" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <MessageSquare className="h-4 w-4" />
              Get In Touch
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Contact Us
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Have questions about our approach or want to schedule an evaluation? 
              We're here to help. Reach out by phone, email, or use the form below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-10">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  Contact Information
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Get In Touch</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Ready to schedule an evaluation or have questions about our services? 
                  We'd love to hear from you. Our team responds to all inquiries within 
                  one business day.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <MapPin className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Location</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        3800 Monroe Ave. Suite 22<br />
                        Pittsford, NY 14534
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Phone className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Phone</h3>
                      <a 
                        href="tel:+15852031050" 
                        className="text-lg text-muted-foreground hover:text-primary transition-colors"
                      >
                        (585) 203-1050
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Mail className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Email</h3>
                      <a 
                        href="mailto:info@pittsfordperformancecare.com" 
                        className="text-lg text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        info@pittsfordperformancecare.com
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Clock className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Hours</h3>
                      <div className="text-muted-foreground leading-relaxed space-y-1">
                        <p>Monday - Thursday: 9:00 AM - 5:00 PM</p>
                        <p>Friday: 9:00 AM - 12:00 PM</p>
                        <p>Saturday & Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="pt-4">
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  For fastest service, schedule directly through our online concierge:
                </p>
                <Button asChild size="lg" className="h-12 px-8 text-base rounded-xl">
                  <Link to="/patient/concierge">
                    Schedule Online
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="p-8 lg:p-10 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm h-fit">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Send Us a Message</h3>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you promptly.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">Name</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    required
                    className="h-12 text-base rounded-xl border-border/60"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                    className="h-12 text-base rounded-xl border-border/60"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium">Phone (optional)</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 555-5555"
                    className="h-12 text-base rounded-xl border-border/60"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base font-medium">Message</Label>
                  <Textarea 
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                    className="text-base rounded-xl border-border/60 resize-none"
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full h-12 text-base rounded-xl">
                  Send Message
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <MapPin className="h-4 w-4" />
                Our Location
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Find Us</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Located in Pittsford, NY, we're easily accessible from Rochester and 
                surrounding communities.
              </p>
            </div>
            
            <Card className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="h-80 flex items-center justify-center bg-muted/30">
                <div className="text-center text-muted-foreground p-8">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-lg font-medium mb-2">3800 Monroe Ave. Suite 22</p>
                  <p className="text-muted-foreground">Pittsford, NY 14534</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteContact;
