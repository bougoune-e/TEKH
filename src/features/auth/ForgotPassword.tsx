import { useState } from "react";
import { supabase } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { Link } from "react-router-dom";
import { CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import MotionRings from "@/shared/components/MotionRings";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isSupabaseConfigured) {
      setError("Service indisponible : configuration manquante.");
      setLoading(false);
      return;
    }

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? window.location.origin : ((import.meta.env.VITE_APP_URL as string) || window.location.origin);
    const redirectTo = `${baseUrl.replace(/\/$/, '')}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      setError("Erreur : " + resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <section className="min-h-dvh bg-white dark:bg-black flex flex-col items-center justify-center p-6">
        <MotionRings className="mb-8">
          <div className="text-center space-y-4 z-20">
            <h2 className="text-2xl font-black text-black dark:text-white">Email envoyé</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Si un compte existe avec cet email, vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <Link to="/login" className="block text-xs font-bold text-primary hover:underline mt-4">
              Retour à la connexion
            </Link>
          </div>
        </MotionRings>
      </section>
    );
  }

  return (
    <section className="min-h-dvh bg-white dark:bg-black flex flex-col items-center justify-center p-6 pb-28 md:pb-6 overflow-hidden">
      <MotionRings className="mb-12">
        <div className="text-center space-y-2 z-20">
          <h2 className="text-4xl font-black tracking-tighter text-black dark:text-white font-sans uppercase">
            Mot de passe oublié
          </h2>
          <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            Saisissez votre email, nous vous enverrons un lien de réinitialisation.
          </p>
        </div>
      </MotionRings>

      <div className="w-full max-w-[400px] z-10">
        <CardContent className="p-0 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 px-6 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary font-bold text-base text-black dark:text-white font-sans"
            />
            {error && (
              <div className="text-rose-600 text-[13px] font-bold text-center">{error}</div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full bg-[#064e3b] dark:bg-[#059669] text-white font-black text-lg hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-xl font-sans"
            >
              {loading ? "Envoi…" : "Envoyer le lien"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/login" className="font-bold text-primary hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </CardContent>
      </div>
    </section>
  );
}
