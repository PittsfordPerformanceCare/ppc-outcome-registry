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
    <div ref={ref} className="flex flex-col items-center text-center group">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm md:text-base text-muted-foreground mt-1 font-medium">
        {label}
      </div>
    </div>
  );
};

export function CredibilityTicker() {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto">
          {/* Empathetic headline */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Still Not Feeling Like Yourself?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Weeks or months after injury, lingering symptoms can feel isolating. 
              Headaches, brain fog, chronic pain, fatigue—you're not imagining it, 
              and you're not alone.
            </p>
            <p className="text-muted-foreground/80 text-sm md:text-base mt-4 max-w-xl mx-auto">
              When symptoms persist, there's usually a reason. Understanding why is 
              the first step toward feeling better.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            <AnimatedStat 
              value={900} 
              suffix="+" 
              label="Patients Helped" 
              icon={Users}
              delay={0}
            />
            <AnimatedStat 
              value={92} 
              suffix="%" 
              label="Report Improvement in 4 Weeks" 
              icon={TrendingUp}
              delay={150}
            />
            <AnimatedStat 
              value={15} 
              suffix="+" 
              label="Years of Experience" 
              icon={Award}
              delay={300}
            />
            <AnimatedStat 
              value={5} 
              label="Neurologic Systems Assessed" 
              icon={Brain}
              delay={450}
            />
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
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
