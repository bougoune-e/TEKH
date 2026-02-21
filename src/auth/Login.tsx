import { useState } from "react";
import { supabase } from "@/lib/supabaseApi";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logos/robott.jpeg";
import MotionRings from "@/components/common/MotionRings";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginWithGoogle = async () => {
    setError("");
    if (!isSupabaseConfigured) {
      setError("Connexion Google indisponible: configuration Supabase manquante.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/deals` } as any });
    if (error) setError(error.message);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(true);

    if (error) {
      setError("Connexion échouée : " + error.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      navigate("/deals");
    }
  };

  return (
    <section className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
      <MotionRings className="mb-12">
        <div className="text-center space-y-2 z-20">
          <h2 className="text-4xl font-black tracking-tighter text-black dark:text-white font-sans uppercase">{t('auth.login')}</h2>
          <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
        </div>
      </MotionRings>

      <Card className="w-full max-w-[400px] border-0 shadow-none bg-transparent z-10">
        <CardContent className="p-0 space-y-8">
          {/* Priority 1: Google Login (Spotify Style) */}
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-4 bg-black hover:bg-zinc-900 transition-all duration-300 p-2 pr-8 rounded-full border border-transparent hover:scale-105 active:scale-95 group w-full shadow-xl"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-white font-sans">{t('auth.google')}</span>
          </button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200 dark:border-zinc-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-black px-6 text-slate-500 font-black tracking-widest font-sans">{t('auth.or')}</span></div>
          </div>

          {/* Simplified Email Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 px-6 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary font-bold transition-all text-base text-black dark:text-white font-sans"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 px-6 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary font-bold transition-all text-base text-black dark:text-white font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <div className="text-rose-600 text-[13px] font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 rounded-full bg-black dark:bg-primary text-white dark:text-black font-black text-lg hover:scale-[1.05] active:scale-95 transition-all shadow-xl font-sans" disabled={loading}>
              {loading ? t('auth.loading') : t('auth.signIn')}
            </Button>
          </form>

          <div className="flex justify-between items-center px-2">
            <Link to="/forgot-password" size="sm" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
              {t('auth.forgotPassword')}
            </Link>
            <Link to="/signup" size="sm" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
              {t('auth.signUp')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
