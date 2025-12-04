import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DevToolbar } from "./components/DevToolbar";
import { DashboardSkeleton } from "./components/skeletons/DashboardSkeleton";
import { AdminLayout } from "./components/AdminLayout";

// Lazy load all pages for better initial load performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NewEpisode = lazy(() => import("./pages/NewEpisode"));
const FollowUp = lazy(() => import("./pages/FollowUp"));
const Discharge = lazy(() => import("./pages/Discharge"));
const Dashboards = lazy(() => import("./pages/Dashboards"));
const PCPSummary = lazy(() => import("./pages/PCPSummary"));
const EpisodeSummary = lazy(() => import("./pages/EpisodeSummary"));
const AdminManagement = lazy(() => import("./pages/AdminManagement"));
const ComplianceAudit = lazy(() => import("./pages/ComplianceAudit"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PatientIntake = lazy(() => import("./pages/PatientIntake"));
const IntakeStart = lazy(() => import("./pages/IntakeStart"));
const PatientAuth = lazy(() => import("./pages/PatientAuth"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const ReferralLanding = lazy(() => import("./pages/ReferralLanding"));
const PatientEpisodeView = lazy(() => import("./pages/PatientEpisodeView"));
const PatientNotificationPreferences = lazy(() => import("./pages/PatientNotificationPreferences"));
const IntakeReview = lazy(() => import("./pages/IntakeReview"));
const IntakeValidation = lazy(() => import("./pages/IntakeValidation"));
const ClinicSettings = lazy(() => import("./pages/ClinicSettings"));
const NotificationHistory = lazy(() => import("./pages/NotificationHistory"));
const NotificationAnalytics = lazy(() => import("./pages/NotificationAnalytics"));
const RetryAnalytics = lazy(() => import("./pages/RetryAnalytics"));
const LinkAnalytics = lazy(() => import("./pages/LinkAnalytics"));
const AlertHistory = lazy(() => import("./pages/AlertHistory"));
const ExportHistory = lazy(() => import("./pages/ExportHistory"));
const ReferralAnalytics = lazy(() => import("./pages/ReferralAnalytics"));
const AutomationStatus = lazy(() => import("./pages/AutomationStatus"));
const ClinicianInbox = lazy(() => import("./pages/ClinicianInbox"));
const NeuroExam = lazy(() => import("./pages/NeuroExam"));
const PatientWelcome = lazy(() => import("./pages/PatientWelcome"));
const PatientAccess = lazy(() => import("./pages/PatientAccess"));
const ClinicianQuickStart = lazy(() => import("./pages/ClinicianQuickStart"));
const AdministratorQuickStart = lazy(() => import("./pages/AdministratorQuickStart"));
const PatientQuickStart = lazy(() => import("./pages/PatientQuickStart"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const DataGovernance = lazy(() => import("./pages/DataGovernance"));
const ReferralScreening = lazy(() => import("./pages/ReferralScreening"));
const ReferralSuccess = lazy(() => import("./pages/ReferralSuccess"));
const ReferralStatus = lazy(() => import("./pages/ReferralStatus"));
const ReferralInbox = lazy(() => import("./pages/ReferralInbox"));
const AppInstallGuide = lazy(() => import("./pages/AppInstallGuide"));
const OrthoPartners = lazy(() => import("./pages/OrthoPartners"));
const OrthoReturnDashboard = lazy(() => import("./pages/OrthoReturnDashboard"));
const StartNeurologicIntake = lazy(() => import("./pages/StartNeurologicIntake"));
const NeurologicLeadsAdmin = lazy(() => import("./pages/NeurologicLeadsAdmin"));
const SeverityCheck = lazy(() => import("./pages/SeverityCheck"));
const NeurologicIntakeForm = lazy(() => import("./pages/NeurologicIntakeForm"));
const LeadAnalytics = lazy(() => import("./pages/LeadAnalytics"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLeads = lazy(() => import("./pages/AdminLeads"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background">
    <DashboardSkeleton />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DevToolbar />
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/start-neurologic-intake" element={<StartNeurologicIntake />} />
            <Route path="/severity-check" element={<SeverityCheck />} />
            <Route path="/neurologic-intake" element={<NeurologicIntakeForm />} />
            
            {/* Admin Panel Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
            </Route>
            
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/new-episode" element={<NewEpisode />} />
                        <Route path="/follow-up" element={<FollowUp />} />
                        <Route path="/discharge" element={<Discharge />} />
                        <Route path="/dashboards" element={<Dashboards />} />
                        <Route path="/pcp-summary" element={<PCPSummary />} />
                        <Route path="/episode-summary" element={<EpisodeSummary />} />
                        <Route path="/admin-management" element={
                          <ProtectedRoute requireAdmin>
                            <AdminManagement />
                          </ProtectedRoute>
                        } />
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
                        <Route
                          path="/neurologic-leads"
                          element={
                            <ProtectedRoute requireAdmin>
                              <NeurologicLeadsAdmin />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/lead-analytics"
                          element={
                            <ProtectedRoute requireAdmin>
                              <LeadAnalytics />
                            </ProtectedRoute>
                          }
                        />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;