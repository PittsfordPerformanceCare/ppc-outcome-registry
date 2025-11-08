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
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
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
