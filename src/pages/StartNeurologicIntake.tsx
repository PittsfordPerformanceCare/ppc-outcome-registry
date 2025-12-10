import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Baby, Stethoscope, ArrowRight, Brain } from "lucide-react";

const StartNeurologicIntake = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Preserve UTM parameters when routing
  const getRouteWithParams = (basePath: string) => {
    const params = searchParams.toString();
    return params ? `${basePath}?${params}` : basePath;
  };

  const handleMyselfClick = () => {
    // Route to unified patient intake path
    navigate(getRouteWithParams("/patient/intake/adult"));
  };

  const handleMyChildClick = () => {
    // Route to unified patient intake path
    navigate(getRouteWithParams("/patient/intake/pediatric"));
  };

  const handleProfessionalClick = () => {
    // Route to unified patient intake path
    navigate(getRouteWithParams("/patient/intake/referral"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628]">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            Neurologic Recovery Program
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Start Your Neurologic Intake
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Begin your path to recovery with our specialized concussion and neurologic care team. Choose who you're here for to get personalized guidance.
          </p>
        </div>

        {/* Persona Selection */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-10">
            <CardTitle className="text-2xl md:text-3xl text-[#0a1628] font-bold">Choose Who You're Here For</CardTitle>
            <CardDescription className="text-slate-600 text-base mt-2">Select the option that best describes your situation</CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-10 pb-10">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Myself Card */}
              <button
                onClick={handleMyselfClick}
                className="group relative flex flex-col items-center text-center p-8 rounded-2xl border-2 border-slate-200 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10 bg-white hover:bg-gradient-to-b hover:from-teal-50/80 hover:to-white transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-teal-500/30">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1628] mb-3">Myself</h3>
                <p className="text-sm text-slate-600 leading-relaxed">I'm seeking evaluation or care for my own symptoms</p>
                <div className="mt-5 flex items-center gap-2 text-teal-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* My Child Card */}
              <button
                onClick={handleMyChildClick}
                className="group relative flex flex-col items-center text-center p-8 rounded-2xl border-2 border-slate-200 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 bg-white hover:bg-gradient-to-b hover:from-cyan-50/80 hover:to-white transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-cyan-500/30">
                  <Baby className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1628] mb-3">My Child</h3>
                <p className="text-sm text-slate-600 leading-relaxed">I'm a parent seeking care for my child's symptoms</p>
                <div className="mt-5 flex items-center gap-2 text-cyan-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Medical Professional Card */}
              <button
                onClick={handleProfessionalClick}
                className="group relative flex flex-col items-center text-center p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 bg-white hover:bg-gradient-to-b hover:from-blue-50/80 hover:to-white transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/30">
                  <Stethoscope className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1628] mb-3">Medical Professional</h3>
                <p className="text-sm text-slate-600 leading-relaxed">I'm referring a patient for neurologic care</p>
                <div className="mt-5 flex items-center gap-2 text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Make a Referral</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StartNeurologicIntake;
