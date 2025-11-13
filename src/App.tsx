import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "@/auth/ProtectedRoute";
import AdminLayout from "@/admin/layout/AdminLayout";
import Dashboard from "@/admin/pages/Dashboard";
import Users from "@/admin/pages/Users";
import Annonces from "@/admin/pages/Annonces";
import Deals from "@/admin/pages/Deals";
import DealBox from "@/admin/pages/DealBox";
import Categories from "@/admin/pages/Categories";
import Stats from "@/admin/pages/Stats";
import Settings from "@/admin/pages/Settings";
import PageLoader from "@/components/PageLoader";
import { DealsProvider } from "@/context/DealsContext";
import InstallPrompt from "@/components/InstallPrompt";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("@/auth/Login"));
const DealsPage = lazy(() => import("@/pages/Deals"));
const DealsFound = lazy(() => import("@/pages/DealsFound"));
const SimulatorPage = lazy(() => import("@/pages/SimulatorPage"));
const HowItWorksPage = lazy(() => import("@/pages/HowItWorksPage"));
const ChartePage = lazy(() => import("@/pages/ChartePage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DealsProvider>
          <Suspense fallback={<PageLoader />}>
            <InstallPrompt />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/simulateur" element={<SimulatorPage />} />
              <Route path="/deals-found" element={<DealsFound />} />
              <Route path="/comment-ca-marche" element={<HowItWorksPage />} />
              <Route path="/charte" element={<ChartePage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="annonces" element={<Annonces />} />
            <Route path="deals" element={<Deals />} />
            <Route path="dealbox" element={<DealBox />} />
            <Route path="categories" element={<Categories />} />
            <Route path="stats" element={<Stats />} />
            <Route path="settings" element={<Settings />} />
          </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </DealsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
