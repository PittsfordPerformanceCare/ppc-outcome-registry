import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
import PatientWelcome from "./pages/PatientWelcome";
import ClinicianQuickStart from "./pages/ClinicianQuickStart";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/patient-auth" element={<PatientAuth />} />
          <Route path="/patient-welcome" element={<PatientWelcome />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/patient-episode/:id" element={<PatientEpisodeView />} />
          <Route path="/patient-preferences" element={<PatientNotificationPreferences />} />
          <Route path="/patient-intake" element={<PatientIntake />} />
          <Route path="/intake-start" element={<IntakeStart />} />
          <Route path="/referral/:referralCode" element={<ReferralLanding />} />
          
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
                    <Route path="/admin" element={<AdminManagement />} />
                    <Route path="/compliance" element={<ComplianceAudit />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/intake-review" element={<IntakeReview />} />
                    <Route path="/intake-validation" element={<IntakeValidation />} />
                    <Route path="/settings" element={<ClinicSettings />} />
                    <Route path="/notification-history" element={<NotificationHistory />} />
                    <Route path="/notification-analytics" element={<NotificationAnalytics />} />
                    <Route path="/retry-analytics" element={<RetryAnalytics />} />
                    <Route path="/link-analytics" element={<LinkAnalytics />} />
                    <Route path="/alert-history" element={<AlertHistory />} />
                    <Route path="/export-history" element={<ExportHistory />} />
                    <Route path="/referral-analytics" element={<ReferralAnalytics />} />
                    <Route path="/automation-status" element={<AutomationStatus />} />
                    <Route path="/clinician-inbox" element={<ClinicianInbox />} />
                    <Route path="/quick-start" element={<ClinicianQuickStart />} />
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
