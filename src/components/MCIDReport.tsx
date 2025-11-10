import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  User,
  Activity,
  Target,
  Phone,
  Mail
} from "lucide-react";
import { MCIDSummary, MCIDAchievement, getAchievementColor } from "@/lib/mcidTracking";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MCIDReportProps {
  patientName: string;
  dateOfBirth?: string;
  region: string;
  diagnosis?: string;
  startDate: string;
  dischargeDate: string;
  clinicianName?: string;
  clinicianNPI?: string;
  referringPhysician?: string;
  summary: MCIDSummary;
  daysInCare: number;
  clinicName?: string;
  clinicTagline?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicAddress?: string;
  clinicLogoUrl?: string;
}

export function MCIDReport({
  patientName,
  dateOfBirth,
  region,
  diagnosis,
  startDate,
  dischargeDate,
  clinicianName,
  clinicianNPI,
  referringPhysician,
  summary,
  daysInCare,
  clinicName = "PPC Outcome Registry",
  clinicTagline = "NeuroEdvance",
  clinicPhone = "(555) 123-4567",
  clinicEmail = "contact@clinic.com",
  clinicAddress,
  clinicLogoUrl,
}: MCIDReportProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getOutcomeIcon = (level: MCIDAchievement["achievementLevel"]) => {
    switch (level) {
      case "excellent":
        return <Award className="h-5 w-5 text-green-600" />;
      case "significant":
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="mcid-report bg-white text-black">
      {/* Header with Clinic Branding */}
      <div className="report-header border-b-4 border-primary pb-6 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Patient Outcome Report
            </h1>
            <p className="text-lg text-gray-600">
              Evidence-Based Treatment Outcomes
            </p>
          </div>
          <div className="text-right">
            {clinicLogoUrl && (
              <div className="mb-4">
                <img
                  src={clinicLogoUrl}
                  alt="Clinic logo"
                  className="h-16 w-auto ml-auto object-contain"
                />
              </div>
            )}
            <div className="text-2xl font-bold text-primary mb-1">
              {clinicName}
            </div>
            {clinicTagline && (
              <div className="text-sm text-gray-600">{clinicTagline}</div>
            )}
            {(clinicPhone || clinicEmail || clinicAddress) && (
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                {clinicPhone && (
                  <div>
                    <Phone className="inline h-3 w-3 mr-1" />
                    {clinicPhone}
                  </div>
                )}
                {clinicEmail && (
                  <div>
                    <Mail className="inline h-3 w-3 mr-1" />
                    {clinicEmail}
                  </div>
                )}
                {clinicAddress && (
                  <div className="whitespace-pre-line">
                    {clinicAddress}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Metadata */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div>
          <div className="font-semibold text-gray-700 mb-3">Report Information</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Report Date:</span>
              <span className="font-medium">{format(new Date(), "MMMM dd, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Treatment Period:</span>
              <span className="font-medium">{daysInCare} days</span>
            </div>
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-3">Referring Physician</div>
          <div className="space-y-2">
            {referringPhysician ? (
              <div className="font-medium">{referringPhysician}</div>
            ) : (
              <div className="text-gray-500 italic">Not specified</div>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Patient Information */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Patient Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div>
              <div className="text-gray-600 text-xs uppercase tracking-wide">Patient Name</div>
              <div className="font-semibold text-lg">{patientName}</div>
            </div>
            {dateOfBirth && (
              <div>
                <div className="text-gray-600 text-xs uppercase tracking-wide">Date of Birth</div>
                <div className="font-medium">{formatDate(dateOfBirth)}</div>
              </div>
            )}
            <div>
              <div className="text-gray-600 text-xs uppercase tracking-wide">Anatomical Region</div>
              <div className="font-medium">{region}</div>
            </div>
          </div>
          <div className="space-y-3">
            {diagnosis && (
              <div>
                <div className="text-gray-600 text-xs uppercase tracking-wide">Diagnosis</div>
                <div className="font-medium">{diagnosis}</div>
              </div>
            )}
            <div>
              <div className="text-gray-600 text-xs uppercase tracking-wide">Start Date</div>
              <div className="font-medium">{formatDate(startDate)}</div>
            </div>
            <div>
              <div className="text-gray-600 text-xs uppercase tracking-wide">Discharge Date</div>
              <div className="font-medium">{formatDate(dischargeDate)}</div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Clinical Significance Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Clinical Outcomes Summary
        </h2>
        
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {Math.round(summary.achievementRate)}%
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                MCID Achievement Rate
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Clinically Significant Improvement
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {summary.achievedMCID}/{summary.totalAssessments}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                Outcome Measures
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Achieved MCID Threshold
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {summary.averageImprovement >= 0 ? "+" : ""}
                {summary.averageImprovement.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                Average Improvement
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Functional Status Change
              </div>
            </div>
          </div>
        </div>

        {/* Overall Success Badge */}
        <div className="text-center py-4 bg-white rounded-lg border-2 border-primary">
          <div className="flex items-center justify-center gap-3">
            {summary.overallSuccess ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    Treatment Success Confirmed
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Patient achieved clinically meaningful improvement
                  </div>
                </div>
              </>
            ) : (
              <>
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    Progress Documented
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Patient showed measurable improvement
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="page-break" />

      {/* Detailed Outcome Measures */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Detailed Outcome Measures
        </h2>
        
        <div className="space-y-4">
          {summary.achievements.map((achievement, idx) => {
            const colors = getAchievementColor(achievement.achievementLevel);
            
            return (
              <div 
                key={idx}
                className={cn(
                  "border-l-4 rounded-lg p-4",
                  colors.border,
                  colors.bg
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getOutcomeIcon(achievement.achievementLevel)}
                    <div>
                      <h3 className="font-bold text-lg">{achievement.toolName}</h3>
                      <p className="text-sm text-gray-600">
                        MCID Threshold: {achievement.mcidThreshold} points
                      </p>
                    </div>
                  </div>
                  {achievement.achievedMCID && (
                    <Badge className="bg-green-600 text-white">
                      MCID Achieved
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Baseline Score</div>
                    <div className="text-2xl font-bold">{achievement.baselineScore}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Discharge Score</div>
                    <div className="text-2xl font-bold">{achievement.dischargeScore}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Change</div>
                    <div className={cn(
                      "text-2xl font-bold",
                      achievement.scoreChange > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {achievement.scoreChange > 0 ? "-" : "+"}
                      {Math.abs(achievement.scoreChange).toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <Progress value={Math.min(achievement.achievementPercentage, 100)} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Progress toward MCID</span>
                    <span className="font-semibold">
                      {Math.round(achievement.achievementPercentage)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white/80 rounded p-3 text-sm">
                  <div className="font-semibold text-gray-700 mb-1">Clinical Interpretation:</div>
                  <div className="text-gray-600">{achievement.interpretation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Clinical Notes Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          About MCID (Minimal Clinically Important Difference)
        </h2>
        <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
          <p>
            The Minimal Clinically Important Difference (MCID) represents the smallest change 
            in an outcome measure that patients perceive as beneficial and that would mandate a 
            change in patient management.
          </p>
          <p>
            MCID values are evidence-based thresholds established through clinical research. 
            Improvements exceeding the MCID threshold indicate clinically meaningful outcomes 
            that translate to real functional improvements in patients' daily lives.
          </p>
          <p className="font-semibold text-gray-900">
            This report confirms that objective, validated outcome measures were used to track 
            patient progress throughout the treatment episode.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="report-footer border-t-2 border-gray-300 pt-4 mt-8 text-xs text-gray-600">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-gray-700 mb-1">Treating Clinician</div>
            <div>{clinicianName || "Not specified"}</div>
            {clinicianNPI && <div>NPI: {clinicianNPI}</div>}
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-700 mb-1">Report Generated</div>
            <div>{format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}</div>
            <div className="mt-2 text-gray-500">
              This is a computer-generated report based on validated outcome measures.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
