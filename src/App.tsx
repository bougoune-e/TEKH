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
import PageLoader from "@/components/common/PageLoader";
import { DealsProvider } from "@/context/DealsContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/theme/ThemeProvider";
import Layout from "@/components/layout/Layout";
import ScrollRestorer from "@/components/common/ScrollToTop";

const Index = lazy(() => import("@/pages/home/Index"));
const NotFound = lazy(() => import("@/pages/misc/NotFound"));
const Login = lazy(() => import("@/auth/Login"));
const DealsPage = lazy(() => import("@/pages/deal/Deals"));
const DealsFound = lazy(() => import("@/pages/deal/DealsFound"));
const SimulatorPage = lazy(() => import("@/pages/simulator/SimulatorPage"));
const HowItWorksPage = lazy(() => import("@/pages/legal/HowItWorksPage"));
const ChartePage = lazy(() => import("@/pages/legal/ChartePage"));
const CharteQualitePage = lazy(() => import("@/pages/legal/CharteQualitePage"));
const PublishPage = lazy(() => import("@/pages/deal/PublishPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const DealDetails = lazy(() => import("@/pages/deal/DealDetails"));
const MyPosts = lazy(() => import("@/pages/deal/MyPosts"));
const Profile = lazy(() => import("@/pages/profile/Profile"));
const EstimatorPage = lazy(() => import("@/pages/simulator/EstimatorPage"));
const APropos = lazy(() => import("@/pages/legal/APropos"));
const AideEtFaq = lazy(() => import("@/pages/legal/AideEtFaq"));
const Contact = lazy(() => import("@/pages/contact/Contact"));
const Blog = lazy(() => import("@/pages/blog/Blog"));
const MentionsLegales = lazy(() => import("@/pages/legal/MentionsLegales"));
const CGV = lazy(() => import("@/pages/legal/CGV"));
const CGU = lazy(() => import("@/pages/legal/CGU"));
const PolitiqueConfidentialite = lazy(() => import("@/pages/legal/PolitiqueConfidentialite"));
const Apk = lazy(() => import("@/pages/apk/Apk"));
const SettingsPage = lazy(() => import("@/pages/settings/Settings"));
const CharteDuSwap = lazy(() => import("@/pages/legal/CharteDuSwap"));

const DiagnosePage = lazy(() => import("@/pages/simulator/Diagnose"));
const AdminPage = lazy(() => import("@/pages/misc/AdminPage"));
const DealboxCatalog = lazy(() => import("@/pages/deal/DealboxCatalog"));

const queryClient = new QueryClient();

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full h-full">
    {children}
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollRestorer />
          <AuthProvider>
            <DealsProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Routes principales avec Layout */}
                  <Route element={<Layout />}>
                    <Route index element={<PageTransition><Index /></PageTransition>} />
                    <Route path="/deals" element={<PageTransition><DealsPage /></PageTransition>} />
                    <Route path="/deal/:id" element={<PageTransition><DealDetails /></PageTransition>} />
                    <Route path="/diagnose" element={<PageTransition><DiagnosePage /></PageTransition>} />
                    <Route path="/simulateur" element={<PageTransition><SimulatorPage /></PageTransition>} />
                    <Route path="/estimer" element={<PageTransition><SimulatorPage /></PageTransition>} />
                    <Route path="/deals-found" element={<PageTransition><DealsFound /></PageTransition>} />
                    <Route path="/charte" element={<PageTransition><ChartePage /></PageTransition>} />
                    <Route path="/charte-du-swap" element={<PageTransition><CharteDuSwap /></PageTransition>} />
                    <Route path="/charte-qualite" element={<PageTransition><CharteQualitePage /></PageTransition>} />
                    <Route path="/post" element={<PageTransition><SimulatorPage /></PageTransition>} />
                    <Route path="/mes-publications" element={<PageTransition><MyPosts /></PageTransition>} />
                    <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
                    <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
                    <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                    <Route path="/a-propos" element={<PageTransition><APropos /></PageTransition>} />
                    <Route path="/aide-et-faq" element={<PageTransition><AideEtFaq /></PageTransition>} />
                    <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                    <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
                    <Route path="/mentions-legales" element={<PageTransition><MentionsLegales /></PageTransition>} />
                    <Route path="/cgv" element={<PageTransition><CGV /></PageTransition>} />
                    <Route path="/cgu" element={<PageTransition><CGU /></PageTransition>} />
                    <Route path="/politique-confidentialite" element={<PageTransition><PolitiqueConfidentialite /></PageTransition>} />
                    <Route path="/apk" element={<PageTransition><Apk /></PageTransition>} />
                    <Route path="/dealboxes" element={<PageTransition><DealboxCatalog /></PageTransition>} />
                    <Route path="/communities" element={<PageTransition><Index /></PageTransition>} />
                    <Route path="/messages" element={<PageTransition><Index /></PageTransition>} />
                    <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
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
                  <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                </Routes>
              </Suspense>
            </DealsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
