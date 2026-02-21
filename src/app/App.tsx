import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import AdminLayout from "@/features/admin/layout/AdminLayout";
import Dashboard from "@/features/admin/pages/Dashboard";
import Users from "@/features/admin/pages/Users";
import Annonces from "@/features/admin/pages/Annonces";
import Deals from "@/features/admin/pages/Deals";
import DealBox from "@/features/admin/pages/DealBox";
import Categories from "@/features/admin/pages/Categories";
import Stats from "@/features/admin/pages/Stats";
import Settings from "@/features/admin/pages/Settings";
import PageLoader from "@/shared/components/PageLoader";
import { DealsProvider } from "@/features/marketplace/deals.context";
import { AuthProvider } from "@/features/auth/auth.context";
import { ThemeProvider } from "@/core/theme/ThemeProvider";
import Layout from "@/shared/components/Layout";
import ScrollRestorer from "@/shared/components/ScrollToTop";

const Index = lazy(() => import("@/features/home/Index"));
const NotFound = lazy(() => import("@/features/misc/NotFound"));
const Login = lazy(() => import("@/features/auth/Login"));
const DealsPage = lazy(() => import("@/features/marketplace/Deals"));
const DealsFound = lazy(() => import("@/features/marketplace/DealsFound"));
const SimulatorPage = lazy(() => import("@/features/simulator/SimulatorPage"));
const HowItWorksPage = lazy(() => import("@/features/legal/HowItWorksPage"));
const ChartePage = lazy(() => import("@/features/legal/ChartePage"));
const CharteQualitePage = lazy(() => import("@/features/legal/CharteQualitePage"));
const PublishPage = lazy(() => import("@/features/marketplace/PublishPage"));
const SearchPage = lazy(() => import("@/features/marketplace/SearchPage"));
const DealDetails = lazy(() => import("@/features/marketplace/DealDetails"));
const MyPosts = lazy(() => import("@/features/marketplace/MyPosts"));
const Profile = lazy(() => import("@/features/profile/Profile"));
const EstimatorPage = lazy(() => import("@/features/simulator/EstimatorPage"));
const APropos = lazy(() => import("@/features/legal/APropos"));
const AideEtFaq = lazy(() => import("@/features/legal/AideEtFaq"));
const Contact = lazy(() => import("@/features/legal/Contact"));
const Blog = lazy(() => import("@/features/blog/Blog"));
const MentionsLegales = lazy(() => import("@/features/legal/MentionsLegales"));
const CGV = lazy(() => import("@/features/legal/CGV"));
const CGU = lazy(() => import("@/features/legal/CGU"));
const PolitiqueConfidentialite = lazy(() => import("@/features/legal/PolitiqueConfidentialite"));
const Apk = lazy(() => import("@/features/apk/Apk"));
const SettingsPage = lazy(() => import("@/features/settings/Settings"));
const CharteDuSwap = lazy(() => import("@/features/legal/CharteDuSwap"));

const DiagnosePage = lazy(() => import("@/features/simulator/Diagnose"));
const AdminPage = lazy(() => import("@/features/misc/AdminPage"));
const DealboxCatalog = lazy(() => import("@/features/marketplace/DealboxCatalog"));

const queryClient = new QueryClient();

const PageTransition = ({ children, navType }: { children: React.ReactNode, navType?: string }) => {
  // Désactive l'animation si on fait un retour arrière (POP)
  if (navType === "POP") return <div className="w-full h-full">{children}</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full h-full">
      {children}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavigationWrapper />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

const NavigationWrapper = () => {
  const navType = useNavigationType();

  return (
    <>
      <ScrollRestorer />
      <AuthProvider>
        <DealsProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Routes principales avec Layout */}
              <Route element={<Layout />}>
                <Route index element={<PageTransition navType={navType}><Index /></PageTransition>} />
                <Route path="/deals" element={<PageTransition navType={navType}><DealsPage /></PageTransition>} />
                <Route path="/deal/:id" element={<PageTransition navType={navType}><DealDetails /></PageTransition>} />
                <Route path="/diagnose" element={<PageTransition navType={navType}><DiagnosePage /></PageTransition>} />
                <Route path="/simulateur" element={<PageTransition navType={navType}><SimulatorPage /></PageTransition>} />
                <Route path="/estimer" element={<PageTransition navType={navType}><SimulatorPage /></PageTransition>} />
                <Route path="/deals-found" element={<PageTransition navType={navType}><DealsFound /></PageTransition>} />
                <Route path="/charte" element={<PageTransition navType={navType}><ChartePage /></PageTransition>} />
                <Route path="/charte-du-swap" element={<PageTransition navType={navType}><CharteDuSwap /></PageTransition>} />
                <Route path="/charte-qualite" element={<PageTransition navType={navType}><CharteQualitePage /></PageTransition>} />
                <Route path="/post" element={<PageTransition navType={navType}><SimulatorPage /></PageTransition>} />
                <Route path="/mes-publications" element={<PageTransition navType={navType}><MyPosts /></PageTransition>} />
                <Route path="/profile" element={<ProtectedRoute><PageTransition navType={navType}><Profile /></PageTransition></ProtectedRoute>} />
                <Route path="/search" element={<PageTransition navType={navType}><SearchPage /></PageTransition>} />
                <Route path="/login" element={<PageTransition navType={navType}><Login /></PageTransition>} />
                <Route path="/a-propos" element={<PageTransition navType={navType}><APropos /></PageTransition>} />
                <Route path="/aide-et-faq" element={<PageTransition navType={navType}><AideEtFaq /></PageTransition>} />
                <Route path="/contact" element={<PageTransition navType={navType}><Contact /></PageTransition>} />
                <Route path="/blog" element={<PageTransition navType={navType}><Blog /></PageTransition>} />
                <Route path="/mentions-legales" element={<PageTransition navType={navType}><MentionsLegales /></PageTransition>} />
                <Route path="/cgv" element={<PageTransition navType={navType}><CGV /></PageTransition>} />
                <Route path="/cgu" element={<PageTransition navType={navType}><CGU /></PageTransition>} />
                <Route path="/politique-confidentialite" element={<PageTransition navType={navType}><PolitiqueConfidentialite /></PageTransition>} />
                <Route path="/apk" element={<PageTransition navType={navType}><Apk /></PageTransition>} />
                <Route path="/dealboxes" element={<PageTransition navType={navType}><DealboxCatalog /></PageTransition>} />
                <Route path="/communities" element={<PageTransition navType={navType}><Index /></PageTransition>} />
                <Route path="/messages" element={<PageTransition navType={navType}><Index /></PageTransition>} />
                <Route path="/settings" element={<PageTransition navType={navType}><SettingsPage /></PageTransition>} />
              </Route>

              {/* Route Admin Exclusive */}
              <Route path="/admin-tekh-control" element={<AdminPage />} />

              {/* Routes d'administration */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="annonces" element={<Annonces />} />
                <Route path="deals" element={<Deals />} />
                <Route path="dealbox" element={<DealBox />} />
                <Route path="categories" element={<Categories />} />
                <Route path="stats" element={<Stats />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Route 404 - Doit être la dernière */}
              <Route path="*" element={<PageTransition navType={navType}><NotFound /></PageTransition>} />
            </Routes>
          </Suspense>
        </DealsProvider>
      </AuthProvider>
    </>
  );
}

export default App;
