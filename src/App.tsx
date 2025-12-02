import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DevToolbar } from "./components/DevToolbar";
import Dashboard from "./pages/Dashboard";
import NewEpisode from "./pages/NewEpisode";
import FollowUp from "./pages/FollowUp";
import Discharge from "./pages/Discharge";
import Dashboards from "./pages/Dashboards";
import PCPSummary from "./pages/PCPSummary";
import EpisodeSummary from "./pages/EpisodeSummary";
import AdminManagement from "./pages/AdminManagement";
import ComplianceAudit from "./pages/ComplianceAudit";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PatientIntake from "./pages/PatientIntake";
import IntakeStart from "./pages/IntakeStart";
import PatientAuth from "./pages/PatientAuth";
import PatientDashboard from "./pages/PatientDashboard";
import ReferralLanding from "./pages/ReferralLanding";
import PatientEpisodeView from "./pages/PatientEpisodeView";
import PatientNotificationPreferences from "./pages/PatientNotificationPreferences";
import IntakeReview from "./pages/IntakeReview";
import IntakeValidation from "./pages/IntakeValidation";
import ClinicSettings from "./pages/ClinicSettings";
import NotificationHistory from "./pages/NotificationHistory";
import NotificationAnalytics from "./pages/NotificationAnalytics";
import RetryAnalytics from "./pages/RetryAnalytics";
import LinkAnalytics from "./pages/LinkAnalytics";
import AlertHistory from "./pages/AlertHistory";
import ExportHistory from "./pages/ExportHistory";
import ReferralAnalytics from "./pages/ReferralAnalytics";
import AutomationStatus from "./pages/AutomationStatus";
import ClinicianInbox from "./pages/ClinicianInbox";
import NeuroExam from "./pages/NeuroExam";
import PatientWelcome from "./pages/PatientWelcome";
import PatientAccess from "./pages/PatientAccess";
import ClinicianQuickStart from "./pages/ClinicianQuickStart";
import AdministratorQuickStart from "./pages/AdministratorQuickStart";
import PatientQuickStart from "./pages/PatientQuickStart";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import DataGovernance from "./pages/DataGovernance";
import ReferralScreening from "./pages/ReferralScreening";
import ReferralSuccess from "./pages/ReferralSuccess";
import ReferralStatus from "./pages/ReferralStatus";
import ReferralInbox from "./pages/ReferralInbox";
import AppInstallGuide from "./pages/AppInstallGuide";
import OrthoPartners from "./pages/OrthoPartners";
import OrthoReturnDashboard from "./pages/OrthoReturnDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DevToolbar />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/patient-auth" element={<PatientAuth />} />
          <Route path="/patient-access" element={<PatientAccess />} />
          <Route path="/patient-welcome" element={<PatientWelcome />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/patient-episode/:id" element={<PatientEpisodeView />} />
          <Route path="/patient-preferences" element={<PatientNotificationPreferences />} />
          <Route path="/patient-intake" element={<PatientIntake />} />
          <Route path="/patient-quick-start" element={<PatientQuickStart />} />
          <Route path="/intake-start" element={<IntakeStart />} />
          <Route path="/install" element={<AppInstallGuide />} />
          <Route path="/referral/:referralCode" element={<ReferralLanding />} />
          <Route path="/referral-screening" element={<ReferralScreening />} />
          <Route path="/referral-success" element={<ReferralSuccess />} />
          <Route path="/referral-status" element={<ReferralStatus />} />
          
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/new-episode" element={<NewEpisode />} />
                    <Route path="/follow-up" element={<FollowUp />} />
                    <Route path="/discharge" element={<Discharge />} />
                    <Route path="/dashboards" element={<Dashboards />} />
                    <Route path="/pcp-summary" element={<PCPSummary />} />
                    <Route path="/episode-summary" element={<EpisodeSummary />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/compliance"
                      element={
                        <ProtectedRoute requireAdmin>
                          <ComplianceAudit />
                        </ProtectedRoute>
                      }
                    />
<Route path="/profile" element={<Profile />} />
                    <Route path="/intake-review" element={<IntakeReview />} />
                    <Route path="/intake-validation" element={<IntakeValidation />} />
                    <Route
                      path="/clinic-settings"
                      element={
                        <ProtectedRoute requireAdmin>
                          <ClinicSettings />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/notification-history" element={<NotificationHistory />} />
                    <Route path="/notification-analytics" element={<NotificationAnalytics />} />
                    <Route path="/retry-analytics" element={<RetryAnalytics />} />
                    <Route path="/link-analytics" element={<LinkAnalytics />} />
                    <Route path="/alert-history" element={<AlertHistory />} />
                    <Route path="/export-history" element={<ExportHistory />} />
                    <Route path="/referral-analytics" element={<ReferralAnalytics />} />
                    <Route path="/automation-status" element={<AutomationStatus />} />
                    <Route path="/clinician-inbox" element={<ClinicianInbox />} />
                    <Route path="/referral-inbox" element={<ReferralInbox />} />
                    <Route path="/quick-start" element={<ClinicianQuickStart />} />
                    <Route
                      path="/admin-quick-start"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdministratorQuickStart />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
                    <Route path="/data-governance" element={<DataGovernance />} />
                    <Route path="/neuro-exam" element={<NeuroExam />} />
                    <Route path="/ortho-partners" element={<OrthoPartners />} />
                    <Route path="/ortho-return-dashboard" element={<OrthoReturnDashboard />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
