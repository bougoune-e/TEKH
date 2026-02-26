import { useState } from "react";
import { supabase } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Eye, EyeOff } from "lucide-react";
import MotionRings from "@/shared/components/MotionRings";
import { useTranslation } from "react-i18next";

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!isSupabaseConfigured) {
      setError("Inscription indisponible : configuration Supabase manquante.");
      setLoading(false);
      return;
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/profile" },
    });
    if (signUpError) {
      setError("Inscription échouée : " + signUpError.message);
      setLoading(false);
      return;
    }
    if (data?.user) {
      if (data.user.identities?.length === 0) {
        setError("Un compte existe déjà avec cet email. Connectez-vous.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate("/login"), 2500);
    } else {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="min-h-dvh bg-white dark:bg-black flex flex-col items-center justify-center p-6">
        <MotionRings className="mb-8">
          <div className="text-center space-y-4 z-20">
            <h2 className="text-2xl font-black text-black dark:text-white">Compte créé</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.
            </p>
            <p className="text-xs text-muted-foreground">Redirection vers la connexion…</p>
          </div>
        </MotionRings>
      </section>
    );
  }

  return (
    <section className="min-h-dvh bg-white dark:bg-black flex flex-col items-center justify-center p-6 pb-28 md:pb-6 overflow-hidden">
      <MotionRings className="mb-12">
        <div className="text-center space-y-2 z-20">
          <h2 className="text-4xl font-black tracking-tighter text-black dark:text-white font-sans uppercase">{t('auth.signUp')}</h2>
          <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
        </div>
      </MotionRings>

      <Card className="w-full max-w-[400px] border-0 shadow-none bg-transparent z-10">
        <CardContent className="p-0 space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 px-6 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary font-bold text-base text-black dark:text-white font-sans"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe (min. 6 caractères)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-14 px-6 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary font-bold text-base text-black dark:text-white font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {error && (
              <div className="text-rose-600 text-[13px] font-bold text-center">{error}</div>
            )}
            <Button type="submit" className="w-full h-14 rounded-full bg-[#064e3b] dark:bg-[#059669] text-white font-black text-lg hover:opacity-90 transition-all shadow-xl font-sans" disabled={loading}>
              {loading ? "Création…" : "Créer mon compte"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="font-bold text-primary hover:underline">{t('auth.login')}</Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
