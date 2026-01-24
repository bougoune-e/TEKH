import { useState } from "react";
import { supabase } from "@/lib/supabaseApi";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function Login() {
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

    setLoading(false);

    if (error) {
      setError("Connexion échouée : " + error.message);
      return;
    }

    if (data?.user) {
      navigate("/deals");
    }
  };

  return (
    <section className="min-h-screen grid place-items-center p-6 bg-gradient-subtle">
      <Card className="w-full max-w-md shadow-card bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground"><LogIn className="h-5 w-5" /></span>
            Connexion à SWAP
          </CardTitle>
          <CardDescription>Connectez-vous pour publier ou accepter des deals.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSupabaseConfigured && (
            <div className="space-y-3 mb-4">
              <Button type="button" onClick={loginWithGoogle} className="w-full justify-center gap-3 bg-[#DB4437] hover:bg-[#C53D32] text-white">
                Continuer avec Google
              </Button>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-foreground placeholder:text-foreground border-border/70 focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 text-foreground placeholder:text-foreground border-border/70 focus-visible:ring-0 focus-visible:border-primary"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 inline-flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-md p-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
