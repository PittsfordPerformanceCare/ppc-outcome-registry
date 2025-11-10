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
import IntakeReview from "./pages/IntakeReview";
import IntakeStart from "./pages/IntakeStart";
import IntakeValidation from "./pages/IntakeValidation";
import ClinicSettings from "./pages/ClinicSettings";
import NotificationHistory from "./pages/NotificationHistory";
import NotificationAnalytics from "./pages/NotificationAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/patient-intake" element={<PatientIntake />} />
          <Route path="/intake-start" element={<IntakeStart />} />
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
                    <Route path="/clinic-settings" element={<ClinicSettings />} />
                    <Route path="/notification-history" element={<NotificationHistory />} />
                    <Route path="/notification-analytics" element={<NotificationAnalytics />} />
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
