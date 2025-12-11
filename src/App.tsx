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
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load all pages for better initial load performance
const Index = lazy(() => import("./pages/Index"));
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
const BeginIntake = lazy(() => import("./pages/BeginIntake"));
const StaffLogin = lazy(() => import("./pages/StaffLogin"));
const NeurologicLeadsAdmin = lazy(() => import("./pages/NeurologicLeadsAdmin"));
const SeverityCheck = lazy(() => import("./pages/SeverityCheck"));
const NeurologicIntakeForm = lazy(() => import("./pages/NeurologicIntakeForm"));
const LeadAnalytics = lazy(() => import("./pages/LeadAnalytics"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLeads = lazy(() => import("./pages/AdminLeads"));
const AdminClinicianQueues = lazy(() => import("./pages/AdminClinicianQueues"));
const EpisodeIntegrity = lazy(() => import("./pages/EpisodeIntegrity"));
const DirectorDashboard = lazy(() => import("./pages/DirectorDashboard"));
const WeeklyCleanup = lazy(() => import("./pages/WeeklyCleanup"));
const UTMHealth = lazy(() => import("./pages/UTMHealth"));
const SpecialSituations = lazy(() => import("./pages/SpecialSituations"));
const ClinicianDashboard = lazy(() => import("./pages/ClinicianDashboard"));
const MyDay = lazy(() => import("./pages/MyDay"));

// ========== PHASE 1 SHELL: NEW LAYOUTS ==========
const SiteLayout = lazy(() => import("./layouts/SiteLayout"));
const PatientLayout = lazy(() => import("./layouts/PatientLayout"));
const ShellAdminLayout = lazy(() => import("./layouts/ShellAdminLayout"));

// ========== PHASE 1 SHELL: /site PAGES ==========
const SiteHome = lazy(() => import("./pages/site/SiteHome"));
const SiteHub = lazy(() => import("./pages/site/SiteHub"));
const SiteConcussion = lazy(() => import("./pages/site/SiteConcussion"));
const SiteMsk = lazy(() => import("./pages/site/SiteMsk"));
const SiteArticles = lazy(() => import("./pages/site/SiteArticles"));
const SiteArticleDetail = lazy(() => import("./pages/site/SiteArticleDetail"));
const SiteCta = lazy(() => import("./pages/site/SiteCta"));
const SiteAbout = lazy(() => import("./pages/site/SiteAbout"));
const SiteRegistry = lazy(() => import("./pages/site/SiteRegistry"));
const SiteProviders = lazy(() => import("./pages/site/SiteProviders"));
const SiteContact = lazy(() => import("./pages/site/SiteContact"));

// ========== PHASE 1 SHELL: /patient PAGES ==========
const PatientConcierge = lazy(() => import("./pages/patient-shell/PatientConcierge"));
const PatientIntakeShell = lazy(() => import("./pages/patient-shell/PatientIntakeShell"));
const PatientIntakeAdult = lazy(() => import("./pages/patient-shell/PatientIntakeAdult"));
const PatientIntakePediatric = lazy(() => import("./pages/patient-shell/PatientIntakePediatric"));
const PatientIntakeReferral = lazy(() => import("./pages/patient-shell/PatientIntakeReferral"));
const PatientThankYou = lazy(() => import("./pages/patient-shell/PatientThankYou"));
const PatientStatus = lazy(() => import("./pages/patient-shell/PatientStatus"));
const PatientSelfTests = lazy(() => import("./pages/patient-shell/PatientSelfTests"));
const PatientSelfTestsConcussion = lazy(() => import("./pages/patient-shell/PatientSelfTestsConcussion"));
const PatientSelfTestsMsk = lazy(() => import("./pages/patient-shell/PatientSelfTestsMsk"));

// ========== PHASE 1 SHELL: /admin-shell PAGES ==========
const AdminShellRegistry = lazy(() => import("./pages/admin-shell/AdminShellRegistry"));
const AdminShellEpisodes = lazy(() => import("./pages/admin-shell/AdminShellEpisodes"));
const AdminShellPatients = lazy(() => import("./pages/admin-shell/AdminShellPatients"));
const AdminShellTasks = lazy(() => import("./pages/admin-shell/AdminShellTasks"));
const AdminShellProviderTools = lazy(() => import("./pages/admin-shell/AdminShellProviderTools"));
const AdminShellCommunications = lazy(() => import("./pages/admin-shell/AdminShellCommunications"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background">
    <DashboardSkeleton />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DevToolbar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
            {/* ========== PHASE 1 SHELL: /site ROUTES (PUBLIC) ========== */}
            <Route path="/site" element={<SiteLayout />}>
              <Route index element={<SiteHome />} />
              <Route path="home" element={<SiteHome />} />
              <Route path="hub" element={<SiteHub />} />
              <Route path="concussion" element={<SiteConcussion />} />
              <Route path="msk" element={<SiteMsk />} />
              <Route path="articles" element={<SiteArticles />} />
              <Route path="articles/:category/:slug" element={<SiteArticleDetail />} />
              <Route path="cta" element={<SiteCta />} />
              <Route path="about" element={<SiteAbout />} />
              <Route path="registry" element={<SiteRegistry />} />
              <Route path="providers" element={<SiteProviders />} />
              <Route path="contact" element={<SiteContact />} />
            </Route>

            {/* ========== PHASE 1 SHELL: /patient ROUTES (PUBLIC) ========== */}
            <Route path="/patient" element={<PatientLayout />}>
              <Route path="concierge" element={<PatientConcierge />} />
              <Route path="intake" element={<PatientIntakeShell />} />
              <Route path="intake/adult" element={<PatientIntakeAdult />} />
              <Route path="intake/pediatric" element={<PatientIntakePediatric />} />
              <Route path="intake/referral" element={<PatientIntakeReferral />} />
              <Route path="thank-you" element={<PatientThankYou />} />
              <Route path="status" element={<PatientStatus />} />
              <Route path="self-tests" element={<PatientSelfTests />} />
              <Route path="self-tests/concussion" element={<PatientSelfTestsConcussion />} />
              <Route path="self-tests/msk" element={<PatientSelfTestsMsk />} />
            </Route>

            {/* ========== PHASE 1 SHELL: /admin-shell ROUTES (PLACEHOLDER ONLY) ========== */}
            <Route path="/admin-shell" element={<ShellAdminLayout />}>
              <Route path="registry" element={<AdminShellRegistry />} />
              <Route path="episodes" element={<AdminShellEpisodes />} />
              <Route path="patients" element={<AdminShellPatients />} />
              <Route path="tasks" element={<AdminShellTasks />} />
              <Route path="provider-tools" element={<AdminShellProviderTools />} />
              <Route path="communications" element={<AdminShellCommunications />} />
            </Route>

            {/* ========== PUBLIC INTAKE GATEWAY (Must be first - No Authentication) ========== */}
            <Route path="/begin-intake" element={<BeginIntake />} />
            <Route path="/begin-intake/*" element={<BeginIntake />} />
            
            {/* ========== OTHER PUBLIC ROUTES (No Authentication Required) ========== */}
            <Route path="/" element={<Index />} />
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
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/install" element={<AppInstallGuide />} />
            <Route path="/referral/:referralCode" element={<ReferralLanding />} />
            <Route path="/referral-screening" element={<ReferralScreening />} />
            <Route path="/referral-success" element={<ReferralSuccess />} />
            <Route path="/referral-status" element={<ReferralStatus />} />
            <Route path="/start-neurologic-intake" element={<StartNeurologicIntake />} />
            <Route path="/severity-check" element={<SeverityCheck />} />
            <Route path="/neurologic-intake" element={<NeurologicIntakeForm />} />
            
            {/* ========== ADMIN PANEL ROUTES (Requires Admin Role) ========== */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="my-day" element={<MyDay />} />
              <Route path="director" element={<DirectorDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="clinician-queues" element={<AdminClinicianQueues />} />
              <Route path="episode-integrity" element={<EpisodeIntegrity />} />
              <Route path="weekly-cleanup" element={<WeeklyCleanup />} />
              <Route path="utm-health" element={<UTMHealth />} />
              <Route path="special-situations" element={<SpecialSituations />} />
            </Route>

            {/* ========== CLINICIAN DASHBOARD ROUTE ========== */}
            <Route
              path="/clinician/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ClinicianDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
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
  </ErrorBoundary>
);

export default App;
