import * as Sentry from "@sentry/react";
import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigationType } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import AdminRoute from "@/features/auth/AdminRoute";

// Admin pages — lazy loaded so they never bloat the main bundle
const AdminLayout = lazy(() => import("@/features/admin/layout/AdminLayout"));
const Dashboard = lazy(() => import("@/features/admin/pages/Dashboard"));
const Users = lazy(() => import("@/features/admin/pages/Users"));
const Annonces = lazy(() => import("@/features/admin/pages/Annonces"));
const AdminDeals = lazy(() => import("@/features/admin/pages/AdminDeals"));
const AdminDealForm = lazy(() => import("@/features/admin/pages/AdminDealForm"));
const AdminDenied = lazy(() => import("@/features/admin/pages/AdminDenied"));
const DealBox = lazy(() => import("@/features/admin/pages/DealBox"));
const AdminTekhPoints = lazy(() => import("@/features/admin/pages/AdminTekhPoints"));
const Categories = lazy(() => import("@/features/admin/pages/Categories"));
const AdminStats = lazy(() => import("@/features/admin/pages/Stats"));
const AdminSettings = lazy(() => import("@/features/admin/pages/Settings"));
const AdminNotifications = lazy(() => import("@/features/admin/pages/AdminNotifications"));
import PageLoader from "@/shared/components/PageLoader";
import { DealsProvider } from "@/features/marketplace/deals.context";
import { CartProvider } from "@/features/marketplace/cart.context";
import { AuthProvider } from "@/features/auth/auth.context";
import { AuthSheetProvider } from "@/features/auth/AuthSheet";
import { ThemeProvider } from "@/core/theme/ThemeProvider";
import Layout from "@/shared/components/Layout";
import ScrollRestorer from "@/shared/components/ScrollToTop";
import { usePWA } from "@/shared/hooks/usePWA";
import {
  NavigationProvider,
  useBackNavigation,
  useAppLifecycle,
  useExitConfirmation,
} from "@/core/navigation";
import { useAuth } from "@/features/auth/auth.context";
import { useAuthNudge } from "@/shared/hooks/useAuthNudge";

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
const PolitiqueEchangeTekhPoints = lazy(() => import("@/features/legal/PolitiqueEchangeTekhPoints"));

const DiagnosePage = lazy(() => import("@/features/simulator/Diagnose"));
const AdminPage = lazy(() => import("@/features/misc/AdminPage"));
const DealboxCatalog = lazy(() => import("@/features/marketplace/DealboxCatalog"));
const PrixPage = lazy(() => import("@/features/simulator/PrixPage"));
const NotificationsPage = lazy(() => import("@/features/notifications/Notifications"));
const PanierPage = lazy(() => import("@/features/marketplace/Panier"));
const MaintenanceIT = lazy(() => import("@/features/services/MaintenanceIT"));
const FormationTech = lazy(() => import("@/features/services/FormationTech"));
const DevWebMobile = lazy(() => import("@/features/services/DevWebMobile"));
const HistoriquePage = lazy(() => import("@/features/settings/Historique"));
const CommandesPage = lazy(() => import("@/features/settings/Commandes").then((m) => ({ default: m.default })));
const CommandeDetailPage = lazy(() => import("@/features/settings/Commandes").then((m) => ({ default: m.CommandeDetailPage })));
const SignupPage = lazy(() => import("@/features/auth/Signup"));
const AuthCallback = lazy(() => import("@/features/auth/AuthCallback"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("@/features/auth/ResetPassword"));

const queryClient = new QueryClient();

const PageTransition = ({ children, navType }: { children: React.ReactNode, navType?: string }) => {
  // Retour arrière (POP) : pas d'animation pour revenir exactement à la section précédente.
  if (navType === "POP") return <div className="w-full h-full">{children}</div>;
  // Transition courte pour limiter l'effet "logo / flash" avant la page.
  return (
    <div className="animate-in fade-in duration-200 w-full h-full">
      {children}
    </div>
  );
};

// ─── Timed Nudge ──────────────────────────────────────────────────────────────
const TimedAuthNudge = () => {
  const { user } = useAuth();
  const { triggerNudge } = useAuthNudge();

  useEffect(() => {
    if (user) return;
    const timer = setTimeout(() => {
      triggerNudge("timed_browse");
    }, 180000); // 3 minutes
    return () => clearTimeout(timer);
  }, [user, triggerNudge]);

  return null;
};

const App = () => (
  <Sentry.ErrorBoundary fallback={<div className="flex items-center justify-center min-h-dvh text-sm text-muted-foreground">Une erreur est survenue. Rechargez la page.</div>}>
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
  </Sentry.ErrorBoundary>
);

/**
 * NavigationShell — wires back navigation, exit confirmation, and app lifecycle.
 * Must be rendered INSIDE <NavigationProvider>.
 */
const NavigationShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { handleExitAttempt, cleanup } = useExitConfirmation();

  // Wire back button: on root screen → exit confirmation
  useBackNavigation({
    onRootBack: () => {
      handleExitAttempt();
    },
  });

  // Wire app lifecycle: persist/restore on background/foreground
  useAppLifecycle({
    getSnapshot: () => ({
      stack: [],     // Provider handles the actual stack; this is a fallback
      activeIndex: 0,
      savedAt: Date.now(),
    }),
    onExpired: () => {
      // Session expired — no action needed, provider will start fresh
    },
  });

  // Cleanup exit confirmation timer on unmount
  useEffect(() => cleanup, [cleanup]);

  return <>{children}</>;
};

const NavigationWrapper = () => {
  const navType = useNavigationType();
  const isPWA = usePWA();

  return (
    <>
      <NavigationProvider>
        <NavigationShell>
          <ScrollRestorer />
          <AuthProvider>
            <AuthSheetProvider>
              <DealsProvider>
                <CartProvider>
                  <TimedAuthNudge />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Routes principales avec Layout */}
                      <Route element={<Layout />}>
                        <Route index element={<PageTransition navType={navType}><Index /></PageTransition>} />
                        <Route path="/deals" element={<PageTransition navType={navType}><DealsPage /></PageTransition>} />
                        <Route path="/deal/:id" element={<PageTransition navType={navType}><DealDetails /></PageTransition>} />
                        <Route path="/diagnose" element={<PageTransition navType={navType}><DiagnosePage /></PageTransition>} />
                        <Route path="/simulateur" element={<PageTransition navType={navType}><SimulatorPage /></PageTransition>} />
                        <Route path="/deals-found" element={<PageTransition navType={navType}><DealsFound /></PageTransition>} />
                        <Route path="/charte" element={<PageTransition navType={navType}><ChartePage /></PageTransition>} />
                        <Route path="/charte-du-swap" element={<PageTransition navType={navType}><CharteDuSwap /></PageTransition>} />
                        <Route path="/politique-echange-tekhpoints" element={<PageTransition navType={navType}><PolitiqueEchangeTekhPoints /></PageTransition>} />
                        <Route path="/charte-qualite" element={<PageTransition navType={navType}><CharteQualitePage /></PageTransition>} />
                        <Route path="/profile" element={<ProtectedRoute><PageTransition navType={navType}><Profile /></PageTransition></ProtectedRoute>} />
                        <Route path="/search" element={<PageTransition navType={navType}><SearchPage /></PageTransition>} />
                        <Route path="/login" element={<PageTransition navType={navType}><Login /></PageTransition>} />
                        <Route path="/signup" element={<PageTransition navType={navType}><SignupPage /></PageTransition>} />
                        <Route path="/forgot-password" element={<PageTransition navType={navType}><ForgotPasswordPage /></PageTransition>} />
                        <Route path="/reset-password" element={<PageTransition navType={navType}><ResetPasswordPage /></PageTransition>} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
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
                        <Route path="/recherche" element={<PageTransition navType={navType}><SearchPage /></PageTransition>} />
                        <Route path="/settings" element={<PageTransition navType={navType}><SettingsPage /></PageTransition>} />
                        <Route path="/historique" element={<ProtectedRoute><PageTransition navType={navType}><HistoriquePage /></PageTransition></ProtectedRoute>} />
                        <Route path="/commandes" element={<ProtectedRoute><PageTransition navType={navType}><CommandesPage /></PageTransition></ProtectedRoute>} />
                        <Route path="/commandes/:id" element={<ProtectedRoute><PageTransition navType={navType}><CommandeDetailPage /></PageTransition></ProtectedRoute>} />
                        <Route path="/notifications" element={<PageTransition navType={navType}><NotificationsPage /></PageTransition>} />
                        <Route path="/panier" element={<PageTransition navType={navType}><PanierPage /></PageTransition>} />
                        <Route path="/maintenance" element={<PageTransition navType={navType}><MaintenanceIT /></PageTransition>} />
                        <Route path="/formation" element={<PageTransition navType={navType}><FormationTech /></PageTransition>} />
                        <Route path="/dev-web" element={<PageTransition navType={navType}><DevWebMobile /></PageTransition>} />
                        <Route path="/prix" element={<PageTransition navType={navType}><PrixPage /></PageTransition>} />
                      </Route>

                      {/* Route Admin Exclusive */}
                      <Route path="/admin-tekh-control" element={<AdminPage />} />

                      {/* Page "accès admin refusé" (affiche l'email connecté pour configurer VITE_ADMIN_EMAILS) */}
                      <Route path="/admin-denied" element={
                        <ProtectedRoute>
                          <AdminDenied />
                        </ProtectedRoute>
                      } />
                      {/* Routes d'administration (réservées aux utilisateurs ADMIN) */}
                      <Route path="/admin" element={
                        <ProtectedRoute>
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        </ProtectedRoute>
                      }>
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={<Users />} />
                        <Route path="annonces" element={<Annonces />} />
                        <Route path="deals" element={<AdminDeals />} />
                        <Route path="deals/new" element={<AdminDealForm />} />
                        <Route path="deals/:id/edit" element={<AdminDealForm />} />
                        <Route path="dealbox" element={<DealBox />} />
                        <Route path="tekhpoints" element={<AdminTekhPoints />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="stats" element={<AdminStats />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="notifications" element={<AdminNotifications />} />
                      </Route>

                      {/* Route 404 - Doit être la dernière */}
                      <Route path="*" element={<PageTransition navType={navType}><NotFound /></PageTransition>} />
                    </Routes>
                  </Suspense>
                </CartProvider>
              </DealsProvider>
            </AuthSheetProvider>
          </AuthProvider>
        </NavigationShell>
      </NavigationProvider>
    </>
  );
}

export default App;
