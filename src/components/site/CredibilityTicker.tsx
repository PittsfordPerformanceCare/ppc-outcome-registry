import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, Award, Brain } from "lucide-react";

interface StatProps {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  delay?: number;
}

const AnimatedStat = ({ value, suffix = "", label, icon: Icon, delay = 0 }: StatProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timeout = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, value, delay]);

  return (
    <div 
      ref={ref} 
      className="relative flex flex-col items-center text-center group p-6 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-background/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        {/* Icon with enhanced styling */}
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        
        {/* Animated number with gradient */}
        <div className="text-4xl md:text-5xl lg:text-6xl font-bold tabular-nums bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          {count.toLocaleString()}{suffix}
        </div>
        
        {/* Label with improved typography */}
        <div className="text-sm md:text-base text-muted-foreground mt-3 font-medium leading-tight max-w-[180px] mx-auto">
          {label}
        </div>
      </div>
    </div>
  );
};

export function CredibilityTicker() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Enhanced background with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          {/* Empathetic headline with enhanced styling */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Trusted Results
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Still Not Feeling Like Yourself?
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Whether it's chronic pain, stiffness, or movement limitations—or 
              headaches, brain fog, and fatigue after concussion—lingering symptoms 
              can feel isolating.
            </p>
            <p className="text-foreground font-medium text-base md:text-lg mt-4 max-w-xl mx-auto">
              You're not imagining it, and you're not alone.
            </p>
          </div>

          {/* Stats grid with enhanced cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
            <AnimatedStat 
              value={10000} 
              suffix="+" 
              label="Patients Helped" 
              icon={Users}
              delay={0}
            />
            <AnimatedStat 
              value={92} 
              suffix="%" 
              label="Report Meaningful Improvement in First 2 Visits" 
              icon={TrendingUp}
              delay={150}
            />
            <AnimatedStat 
              value={20} 
              suffix="+" 
              label="Years of Clinical Experience" 
              icon={Award}
              delay={300}
            />
            <AnimatedStat 
              value={8} 
              label="Neurologic Domains Assessed" 
              icon={Brain}
              delay={450}
            />
          </div>

          {/* Supporting message */}
          <div className="text-center mb-10">
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              When symptoms persist, there's usually a reason. Understanding why is 
              the first step toward feeling better.
            </p>
          </div>

          {/* Enhanced CTA */}
          <div className="text-center">
            <Button 
              size="lg" 
              asChild 
              className="h-14 px-10 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 hover:scale-105"
            >
              <Link to="/patient/concierge">
                Start Your Evaluation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CredibilityTicker;
